#!/usr/bin/env python3
"""App Store Connect API — subtitle 변경 스크립트

Guideline 2.3.8 대응: 영문 subtitle에서 'for Kids' 제거
"""

import json
import time
import base64
import urllib.request
import urllib.error
import ssl
import os
import sys

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec, utils as ec_utils

# --- Config ---
API_KEY_ID = "22PFV23DQR"
ISSUER_ID = "342ff145-d21e-4437-a639-492c3910c370"
BUNDLE_ID = "com.philokalos.wordpop"
KEY_PATH = os.path.expanduser("~/.appstoreconnect/private_keys/AuthKey_22PFV23DQR.p8")
SSL_CERT = "/etc/ssl/cert.pem"

BASE = "https://api.appstoreconnect.apple.com/v1"

# New subtitle (Guideline 2.3.8 fix)
NEW_SUBTITLE_EN = "Learn Words Through Puzzles"
NEW_KEYWORDS_EN = "vocabulary,word game,english learning,word puzzle,spelling,flashcard,education,elementary,review"


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def make_jwt() -> str:
    with open(KEY_PATH, "rb") as f:
        key = serialization.load_pem_private_key(f.read(), password=None)

    now = int(time.time())
    header = b64url(json.dumps({"alg": "ES256", "kid": API_KEY_ID, "typ": "JWT"}).encode())
    payload = b64url(json.dumps({
        "iss": ISSUER_ID,
        "iat": now,
        "exp": now + 1200,
        "aud": "appstoreconnect-v1",
    }).encode())

    message = f"{header}.{payload}".encode()
    der_sig = key.sign(message, ec.ECDSA(hashes.SHA256()))
    r, s = ec_utils.decode_dss_signature(der_sig)
    raw_sig = r.to_bytes(32, "big") + s.to_bytes(32, "big")

    return f"{header}.{payload}.{b64url(raw_sig)}"


def api_call(method: str, path: str, body: dict | None = None) -> dict:
    ctx = ssl.create_default_context(cafile=SSL_CERT)
    token = make_jwt()
    url = f"{BASE}{path}" if path.startswith("/") else path
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            if resp.status == 204:
                return {}
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        print(f"API Error {e.code}: {err_body}", file=sys.stderr)
        raise


def find_app_id() -> str:
    """Find app ID by bundle ID."""
    resp = api_call("GET", f"/apps?filter[bundleId]={BUNDLE_ID}&fields[apps]=bundleId,name")
    apps = resp.get("data", [])
    if not apps:
        print(f"  App not found for bundle ID: {BUNDLE_ID}", file=sys.stderr)
        sys.exit(1)
    app = apps[0]
    print(f"  App: {app['attributes']['name']} (ID: {app['id']})")
    return app["id"]


def get_editable_version(app_id: str) -> dict | None:
    """Get the current editable app store version."""
    resp = api_call(
        "GET",
        f"/apps/{app_id}/appStoreVersions"
        f"?filter[appStoreState]=REJECTED,READY_FOR_REVIEW,PREPARE_FOR_SUBMISSION,DEVELOPER_REJECTED"
        f"&limit=1"
    )
    versions = resp.get("data", [])
    if versions:
        v = versions[0]
        print(f"  Version: {v['attributes']['versionString']} — State: {v['attributes']['appStoreState']}")
        return v
    return None


def get_version_localizations(version_id: str) -> list:
    """Get version-level localizations (keywords, description, etc.)."""
    resp = api_call("GET", f"/appStoreVersions/{version_id}/appStoreVersionLocalizations")
    return resp.get("data", [])


def get_app_info(app_id: str) -> dict | None:
    """Get app info (contains subtitle via appInfoLocalizations)."""
    resp = api_call("GET", f"/apps/{app_id}/appInfos?limit=1")
    infos = resp.get("data", [])
    return infos[0] if infos else None


def get_app_info_localizations(app_info_id: str) -> list:
    """Get app-info-level localizations (subtitle, name, etc.)."""
    resp = api_call("GET", f"/appInfos/{app_info_id}/appInfoLocalizations")
    return resp.get("data", [])


def update_app_info_localization(loc_id: str, locale: str, subtitle: str):
    """Update subtitle (app-info level)."""
    body = {
        "data": {
            "type": "appInfoLocalizations",
            "id": loc_id,
            "attributes": {
                "subtitle": subtitle,
            },
        }
    }
    resp = api_call("PATCH", f"/appInfoLocalizations/{loc_id}", body)
    updated = resp.get("data", {}).get("attributes", {})
    print(f"  [{locale}] subtitle → {updated.get('subtitle', '(empty)')}")


def update_version_localization(loc_id: str, locale: str, keywords: str):
    """Update keywords (version level)."""
    body = {
        "data": {
            "type": "appStoreVersionLocalizations",
            "id": loc_id,
            "attributes": {
                "keywords": keywords,
            },
        }
    }
    resp = api_call("PATCH", f"/appStoreVersionLocalizations/{loc_id}", body)
    updated = resp.get("data", {}).get("attributes", {})
    print(f"  [{locale}] keywords → {updated.get('keywords', '(empty)')[:60]}...")


def main():
    print("=== App Store Connect — Subtitle 변경 (Guideline 2.3.8) ===\n")

    # 1. Find app
    print("[1/4] 앱 조회...")
    app_id = find_app_id()
    print()

    # 2. Get editable version
    print("[2/4] 편집 가능한 버전 조회...")
    version = get_editable_version(app_id)
    if not version:
        print("  편집 가능한 버전이 없습니다.", file=sys.stderr)
        sys.exit(1)
    version_id = version["id"]
    print()

    # 3. Get app info localizations (subtitle is here)
    print("[3/6] App Info 조회 (subtitle)...")
    app_info = get_app_info(app_id)
    if not app_info:
        print("  App Info를 찾을 수 없습니다.", file=sys.stderr)
        sys.exit(1)
    app_info_id = app_info["id"]

    info_locs = get_app_info_localizations(app_info_id)
    en_info_loc = None
    for loc in info_locs:
        locale = loc["attributes"]["locale"]
        current_subtitle = loc["attributes"].get("subtitle", "(empty)")
        print(f"  [{locale}] subtitle: {current_subtitle}")
        if locale.startswith("en"):
            en_info_loc = loc
    print()

    # 4. Get version localizations (keywords are here)
    print("[4/6] Version localization 조회 (keywords)...")
    ver_locs = get_version_localizations(version_id)
    en_ver_loc = None
    for loc in ver_locs:
        locale = loc["attributes"]["locale"]
        current_keywords = loc["attributes"].get("keywords", "(empty)")
        print(f"  [{locale}] keywords: {current_keywords[:60]}...")
        if locale.startswith("en"):
            en_ver_loc = loc
    print()

    if not en_info_loc:
        print("  영문 appInfoLocalization을 찾을 수 없습니다.", file=sys.stderr)
        sys.exit(1)
    if not en_ver_loc:
        print("  영문 versionLocalization을 찾을 수 없습니다.", file=sys.stderr)
        sys.exit(1)

    # 5. Update subtitle
    en_info_locale = en_info_loc["attributes"]["locale"]
    en_info_loc_id = en_info_loc["id"]
    print(f"[5/6] 영문 subtitle 변경 ({en_info_locale})...")
    print(f"  New: {NEW_SUBTITLE_EN}")
    update_app_info_localization(en_info_loc_id, en_info_locale, NEW_SUBTITLE_EN)
    print()

    # 6. Update keywords
    en_ver_locale = en_ver_loc["attributes"]["locale"]
    en_ver_loc_id = en_ver_loc["id"]
    print(f"[6/6] 영문 keywords 변경 ({en_ver_locale})...")
    print(f"  New: {NEW_KEYWORDS_EN}")
    update_version_localization(en_ver_loc_id, en_ver_locale, NEW_KEYWORDS_EN)

    print("\n=== 완료 — App Store Connect에서 확인 후 재제출하세요 ===")


if __name__ == "__main__":
    main()
