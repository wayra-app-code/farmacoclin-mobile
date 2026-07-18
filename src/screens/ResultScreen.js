import React from 'react';
import { useLanguage } from '../LanguageContext';
import { t } from '../i18n';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';

function renderAnalysis(text) {
  // Split by lines and render with basic markdown-like formatting
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('# ')) {
      return <Text key={i} style={styles.h1}>{line.replace('# ', '')}</Text>;
    }
    if (line.startsWith('## ')) {
      return <Text key={i} style={styles.h2}>{line.replace('## ', '')}</Text>;
    }
    if (line.startsWith('### ')) {
      return <Text key={i} style={styles.h3}>{line.replace('### ', '')}</Text>;
    }
    if (line.startsWith('> ')) {
      return (
        <View key={i} style={styles.blockquote}>
          <Text style={styles.blockquoteText}>{line.replace('> ', '')}</Text>
        </View>
      );
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <View key={i} style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>{line.replace(/^[-*] /, '')}</Text>
        </View>
      );
    }
    if (line.startsWith('---')) {
      return <View key={i} style={styles.divider} />;
    }
    if (line.trim() === '') {
      return <View key={i} style={{ height: 6 }} />;
    }
    // Handle inline bold **text**
    const parts = line.split(/\*\*(.*?)\*\*/g);
    if (parts.length > 1) {
      return (
        <Text key={i} style={styles.body}>
          {parts.map((p, j) =>
            j % 2 === 1 ? <Text key={j} style={styles.bold}>{p}</Text> : p
          )}
        </Text>
      );
    }
    return <Text key={i} style={styles.body}>{line}</Text>;
  });
}

export default function ResultScreen({ navigation, route }) {
  const { result } = route.params;
  const { language } = useLanguage();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← {result.isPrescription ? t(language, 'newPrescription') : t(language, 'newAnalysis')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Summary chips */}
        <View style={styles.summaryRow}>
          <View style={[styles.chip, { backgroundColor: '#ECFDF5' }]}>
            <Text style={[styles.chipText, { color: '#059669' }]}>
              🏥 {result.diseases?.join(', ')}
            </Text>
          </View>
          {result.isPrescription ? (
            <View style={[styles.chip, { backgroundColor: '#F5F3FF' }]}>
              <Text style={[styles.chipText, { color: '#7C3AED' }]}>
                {t(language, 'prescriptionChip')}
              </Text>
            </View>
          ) : (
            <View style={[styles.chip, { backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.chipText, { color: '#2563EB' }]}>
                💊 {result.drugs?.length ?? 0} {(result.drugs?.length ?? 0) !== 1 ? t(language, 'drugs') : t(language, 'drug')}
              </Text>
            </View>
          )}
        </View>

        {/* Drugs not found warning */}
        {result.drugsNotFound?.length > 0 && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              {t(language, 'drugsNotFound')} {result.drugsNotFound.join(', ')}. {t(language, 'drugsNotFoundSuffix')}
            </Text>
          </View>
        )}

        {/* Analysis */}
        <View style={styles.card}>
          {renderAnalysis(result.analysis)}
        </View>

        <Text style={styles.disclaimer}>
          {t(language, 'resultDisclaimer')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  topBar: {
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backBtn: { alignSelf: 'flex-start' },
  backText: { color: '#2563EB', fontSize: 15, fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 40 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  chip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  chipText: { fontSize: 13, fontWeight: '600' },
  warning: {
    backgroundColor: '#FEF3C7', borderRadius: 10, padding: 12, marginBottom: 12,
    borderLeftWidth: 3, borderLeftColor: '#F59E0B',
  },
  warningText: { color: '#92400E', fontSize: 13 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  h1: { fontSize: 20, fontWeight: '800', color: '#111827', marginVertical: 8 },
  h2: { fontSize: 17, fontWeight: '700', color: '#1D4ED8', marginTop: 14, marginBottom: 4 },
  h3: { fontSize: 15, fontWeight: '700', color: '#374151', marginTop: 10, marginBottom: 2 },
  body: { fontSize: 14, color: '#374151', lineHeight: 22 },
  bold: { fontWeight: '700', color: '#111827' },
  blockquote: {
    borderLeftWidth: 3, borderLeftColor: '#2563EB',
    backgroundColor: '#EFF6FF', padding: 10, borderRadius: 6, marginVertical: 6,
  },
  blockquoteText: { color: '#1E40AF', fontSize: 13, fontStyle: 'italic' },
  listItem: { flexDirection: 'row', marginVertical: 2, paddingLeft: 4 },
  bullet: { color: '#6B7280', marginRight: 6, fontSize: 14 },
  listText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 10 },
  disclaimer: {
    textAlign: 'center', fontSize: 11, color: '#9CA3AF',
    marginTop: 16, paddingHorizontal: 10,
  },
});
