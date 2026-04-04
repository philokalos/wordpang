import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Share, Alert, TextInput, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS } from '../constants/theme';
import SketchyButton from './sketchy/SketchyButton';
import { exportAllData, importAllData, getBackupSummary, type BackupSummary } from '../services/backup';

export default function BackupPanel() {
  const [summary, setSummary] = useState<BackupSummary | null>(null);
  const [importing, setImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const loadSummary = useCallback(async () => {
    const result = await getBackupSummary();
    setSummary(result);
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const handleExport = async () => {
    try {
      const json = await exportAllData();
      await Share.share({
        message: json,
        title: 'WordPang 백업 데이터',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      Alert.alert('내보내기 실패', message);
    }
  };

  const handleImport = async () => {
    const trimmed = pasteText.trim();
    if (!trimmed) {
      Alert.alert('오류', '백업 데이터를 붙여넣어 주세요.');
      return;
    }

    setImporting(true);
    try {
      const success = await importAllData(trimmed);
      if (success) {
        Alert.alert('가져오기 완료', '데이터가 복원되었습니다.');
        setShowImportModal(false);
        setPasteText('');
        await loadSummary();
      } else {
        Alert.alert('가져오기 실패', '올바른 백업 데이터가 아닙니다.');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      Alert.alert('가져오기 실패', message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>데이터 백업</Text>

      {summary && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            총 게임: {summary.totalGames}회
          </Text>
          <Text style={styles.summaryText}>
            학습 단어: {summary.learnedWords}개
          </Text>
          <Text style={styles.summaryText}>
            획득 배지: {summary.achievements}개
          </Text>
        </View>
      )}

      <View style={styles.buttons}>
        <SketchyButton
          label="단어장 저장하기"
          onPress={() => void handleExport()}
          variant="primary"
          seed={201}
          icon="📤"
          accessibilityLabel="단어장 저장하기"
        />
        <SketchyButton
          label="단어장 불러오기"
          onPress={() => setShowImportModal(true)}
          variant="secondary"
          seed={202}
          icon="📥"
          accessibilityLabel="단어장 불러오기"
        />
      </View>

      <Modal
        visible={showImportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImportModal(false)}
      >
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>단어장 불러오기</Text>
            <Text style={styles.modalDesc}>
              소중한 단어 기록을 안전하게 저장하거나 불러올 수 있어요! 백업 데이터를 아래에 붙여넣어 주세요.
            </Text>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="백업 JSON 데이터를 여기에 붙여넣기..."
              placeholderTextColor={COLORS.textMuted}
              value={pasteText}
              onChangeText={setPasteText}
              accessibilityLabel="백업 데이터 입력"
            />
            <View style={styles.modalButtons}>
              <SketchyButton
                label="복원하기"
                onPress={() => void handleImport()}
                variant="success"
                seed={203}
                disabled={importing || !pasteText.trim()}
                accessibilityLabel="데이터 복원하기"
              />
              <Pressable
                onPress={() => {
                  setShowImportModal(false);
                  setPasteText('');
                }}
                style={styles.cancelButton}
                accessibilityRole="button"
                accessibilityLabel="취소"
              >
                <Text style={styles.cancelText}>취소</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
  },
  summaryBox: {
    backgroundColor: COLORS.surface,
    padding: 16,
    ...SKETCHY_RADIUS.medium,
    borderWidth: 1.5,
    borderColor: COLORS.tileBorder,
    gap: 4,
  },
  summaryText: {
    fontSize: 18,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textSecondary,
  },
  buttons: {
    gap: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    padding: 24,
    ...SKETCHY_RADIUS.large,
    borderWidth: 2,
    borderColor: COLORS.tileBorder,
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
  },
  modalDesc: {
    fontSize: 16,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textSecondary,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: COLORS.tileBorder,
    ...SKETCHY_RADIUS.small,
    padding: 12,
    minHeight: 120,
    maxHeight: 200,
    fontFamily: SKETCHY_FONTS.regular,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    textAlignVertical: 'top',
  },
  modalButtons: {
    gap: 8,
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 18,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
  },
});
