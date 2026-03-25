#!/usr/bin/env python3
"""Upload screenshots to App Store Connect."""
import json
import os
import hashlib
import time
import ssl
import urllib.request
import urllib.error
from pathlib import Path

# Fix SSL certificate verification on macOS
ssl_context = ssl.create_default_context()
try:
    import certifi
    ssl_context = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    # Fall back to system certs or unverified (macOS Python 3.13 needs cert install)
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

# JWT generation
import base64
import struct
import hmac
import hashlib as hl

KEY_ID = "22PFV23DQR"
ISSUER_ID = "342ff145-d21e-4437-a639-492c3910c370"
KEY_PATH = os.path.expanduser("~/.appstoreconnect/private_keys/AuthKey_22PFV23DQR.p8")
BASE_URL = "https://api.appstoreconnect.apple.com"

# Screenshot set ID for APP_IPHONE_67 (en-US localization)
SCREENSHOT_SET_ID = "f8cf43ec-1370-462a-a751-a43399626b45"

SCREENSHOTS_DIR = Path(__file__).parent / "screenshots" / "iphone_67"
SCREENSHOTS = [
    "01_welcome.png",
    "02_howtoplay.png",
    "03_home.png",
    "04_game.png",
    "05_features.png",
]


def b64url(data):
    if isinstance(data, str):
        data = data.encode()
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def make_jwt():
    """Generate ASC JWT token using ES256."""
    with open(KEY_PATH, "r") as f:
        pem = f.read().strip()

    # Use PyJWT if available, otherwise use cryptography library
    try:
        import jwt as pyjwt
        with open(KEY_PATH, "rb") as f:
            private_key = f.read()
        now = int(time.time())
        payload = {
            "iss": ISSUER_ID,
            "iat": now,
            "exp": now + 1200,
            "aud": "appstoreconnect-v1",
        }
        token = pyjwt.encode(payload, private_key, algorithm="ES256", headers={"kid": KEY_ID})
        return token if isinstance(token, str) else token.decode()
    except ImportError:
        pass

    # Fallback: use cryptography library directly
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import ec
    from cryptography.hazmat.backends import default_backend

    with open(KEY_PATH, "rb") as f:
        private_key = serialization.load_pem_private_key(f.read(), password=None, backend=default_backend())

    now = int(time.time())
    header = b64url(json.dumps({"alg": "ES256", "kid": KEY_ID, "typ": "JWT"}))
    payload = b64url(json.dumps({
        "iss": ISSUER_ID,
        "iat": now,
        "exp": now + 1200,
        "aud": "appstoreconnect-v1",
    }))
    message = f"{header}.{payload}".encode()
    signature = private_key.sign(message, ec.ECDSA(hashes.SHA256()))

    # DER -> raw r||s (64 bytes)
    from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature
    r, s = decode_dss_signature(signature)
    raw_sig = r.to_bytes(32, "big") + s.to_bytes(32, "big")

    return f"{header}.{payload}.{b64url(raw_sig)}"


def asc_request(method, path, body=None, headers=None, token=None):
    if token is None:
        token = make_jwt()
    url = f"{BASE_URL}{path}"
    req_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    if headers:
        req_headers.update(headers)
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req, context=ssl_context) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        print(f"  ERROR {e.code}: {err_body[:500]}")
        return None


def upload_screenshot(token, set_id, filename, file_path):
    """Reserve, upload, and commit a screenshot."""
    file_bytes = file_path.read_bytes()
    file_size = len(file_bytes)
    md5 = hashlib.md5(file_bytes).hexdigest()

    print(f"  Reserving {filename} ({file_size} bytes)...")
    reserve_body = {
        "data": {
            "type": "appScreenshots",
            "attributes": {
                "fileSize": file_size,
                "fileName": filename,
            },
            "relationships": {
                "appScreenshotSet": {
                    "data": {"type": "appScreenshotSets", "id": set_id}
                }
            },
        }
    }
    result = asc_request("POST", "/v1/appScreenshots", body=reserve_body, token=token)
    if not result:
        print(f"  FAILED to reserve {filename}")
        return False

    screenshot_id = result["data"]["id"]
    upload_ops = result["data"]["attributes"].get("uploadOperations", [])

    print(f"  Screenshot ID: {screenshot_id}, upload ops: {len(upload_ops)}")

    # Execute upload operations
    for op in upload_ops:
        offset = op["offset"]
        length = op["length"]
        url = op["url"]
        method = op["method"]
        req_headers_list = op.get("requestHeaders", [])

        chunk = file_bytes[offset : offset + length]
        req_headers = {h["name"]: h["value"] for h in req_headers_list}
        req_headers["Content-Length"] = str(len(chunk))

        print(f"    Uploading chunk offset={offset} len={length}...")
        req = urllib.request.Request(url, data=chunk, headers=req_headers, method=method)
        try:
            with urllib.request.urlopen(req, context=ssl_context) as resp:
                resp.read()
                print(f"    Chunk uploaded OK ({resp.status})")
        except urllib.error.HTTPError as e:
            print(f"    Chunk upload ERROR {e.code}: {e.read().decode()[:200]}")
            return False

    # Commit the upload
    print(f"  Committing {filename}...")
    commit_body = {
        "data": {
            "type": "appScreenshots",
            "id": screenshot_id,
            "attributes": {
                "uploaded": True,
                "sourceFileChecksum": md5,
            },
        }
    }
    result = asc_request("PATCH", f"/v1/appScreenshots/{screenshot_id}", body=commit_body, token=token)
    if result:
        state = result["data"]["attributes"].get("assetDeliveryState", {})
        print(f"  Committed. State: {state}")
        return True
    return False


def main():
    print("Generating JWT token...")
    token = make_jwt()
    print(f"Token: {token[:50]}...")

    print(f"\nUploading to screenshot set: {SCREENSHOT_SET_ID}")
    print(f"Screenshots dir: {SCREENSHOTS_DIR}\n")

    success = 0
    for i, fname in enumerate(SCREENSHOTS):
        file_path = SCREENSHOTS_DIR / fname
        if not file_path.exists():
            print(f"[{i+1}/{len(SCREENSHOTS)}] SKIP {fname} (not found)")
            continue
        print(f"[{i+1}/{len(SCREENSHOTS)}] {fname}")
        ok = upload_screenshot(token, SCREENSHOT_SET_ID, fname, file_path)
        if ok:
            success += 1
        time.sleep(1)

    print(f"\nDone: {success}/{len(SCREENSHOTS)} uploaded successfully")


if __name__ == "__main__":
    main()
