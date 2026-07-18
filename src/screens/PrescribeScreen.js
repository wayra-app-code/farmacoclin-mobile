import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, SafeAreaView, StatusBar,
} from 'react-native';
import TagInput from '../components/TagInput';
import { suggestPrescription } from '../services/api';
import { useLanguage } from '../LanguageContext';
import { t } from '../i18n';

const PURPLE = '#6D28D9';
const DARK = '#0F172A';
const GRAY = '#64748B';
const WHITE = '#FFFFFF';

const LANGUAGES = [
  { code: 'pt', flag: '🇵🇹', label: 'PT' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
];

export default function PrescribeScreen({ navigation }) {
  const [diseases, setDiseases] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [currentMeds, setCurrentMeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const { language, setLanguage } = useLanguage();

  async function handlePrescribe() {
    if (!diseases.length) { Alert.alert(t(language, 'alertAttention'), t(language, 'alertNoDisease')); return; }
    setLoading(true);
    setLoadingMsg(t(language, 'loadingMsg1'));
    const t1 = setTimeout(() => setLoadingMsg(t(language, 'loadingMsg2')), 5000);
    const t2 = setTimeout(() => setLoadingMsg(t(language, 'loadingMsg3')), 12000);
    try {
      const result = await suggestPrescription(diseases, allergies, currentMeds, language);
      clearTimeout(t1); clearTimeout(t2);
      navigation.navigate('Result', { result: { ...result, analysis: result.suggestion, isPrescription: true } });
    } catch (err) {
      clearTimeout(t1); clearTimeout(t2);
      Alert.alert(t(language, 'alertErrorTitle'), err.code === 'ECONNABORTED'
        ? t(language, 'alertTimeout')
        : t(language, 'alertError'));
    } finally { setLoading(false); setLoadingMsg(''); }
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={PURPLE} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <View style={s.hero}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backText}>{t(language, 'back')}</Text>
          </TouchableOpacity>
          <View style={s.heroContent}>
            <Text style={s.heroIcon}>📋</Text>
            <Text style={s.heroTitle}>{t(language, 'prescribeTitle')}</Text>
            <Text style={s.heroSub}>{t(language, 'prescribeSub')}</Text>
            <View style={s.langRow}>
              {LANGUAGES.map((l) => (
                <TouchableOpacity
                  key={l.code}
                  style={[s.langBtn, language === l.code && s.langBtnActive]}
                  onPress={() => setLanguage(l.code)}
                >
                  <Text style={s.langFlag}>{l.flag}</Text>
                  <Text style={[s.langLabel, language === l.code && s.langLabelActive]}>{l.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={s.formCard}>
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionDot, { backgroundColor: PURPLE }]} />
              <Text style={s.sectionTitle}>{t(language, 'patientConditions')}</Text>
            </View>
            <TagInput
              label=""
              placeholder={t(language, 'patientPlaceholder')}
              tags={diseases}
              onAdd={(d) => setDiseases([...diseases, d])}
              onRemove={(d) => setDiseases(diseases.filter(x => x !== d))}
              color={PURPLE}
            />
          </View>

          <View style={s.divider} />

          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionDot, { backgroundColor: '#DC2626' }]} />
              <Text style={s.sectionTitle}>{t(language, 'allergies')} <Text style={s.optional}>{t(language, 'optional')}</Text></Text>
            </View>
            <TagInput
              label=""
              placeholder={t(language, 'allergiesPlaceholder')}
              tags={allergies}
              onAdd={(d) => setAllergies([...allergies, d])}
              onRemove={(d) => setAllergies(allergies.filter(x => x !== d))}
              color="#DC2626"
            />
          </View>

          <View style={s.divider} />

          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionDot, { backgroundColor: '#0D9488' }]} />
              <Text style={s.sectionTitle}>{t(language, 'currentMeds')} <Text style={s.optional}>{t(language, 'optional')}</Text></Text>
            </View>
            <TagInput
              label=""
              placeholder={t(language, 'currentMedsPlaceholder')}
              tags={currentMeds}
              onAdd={(d) => setCurrentMeds([...currentMeds, d])}
              onRemove={(d) => setCurrentMeds(currentMeds.filter(x => x !== d))}
              color="#0D9488"
            />
          </View>

          <View style={s.infoBox}>
            <Text style={s.infoText}>{t(language, 'prescribeInfo')}</Text>
          </View>

          <TouchableOpacity
            style={[s.btn, loading && s.btnLoading]}
            onPress={handlePrescribe}
            disabled={loading}
          >
            {loading
              ? <><ActivityIndicator color={WHITE} style={{ marginRight: 10 }} /><Text style={s.btnText}>{loadingMsg}</Text></>
              : <Text style={s.btnText}>{t(language, 'prescribeBtn')}</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={s.disclaimer}>{t(language, 'prescribeDisclaimer')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PURPLE },
  scroll: { paddingBottom: 40 },

  hero: { backgroundColor: PURPLE, padding: 24, paddingBottom: 32 },
  backBtn: { marginBottom: 20 },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  heroContent: { alignItems: 'flex-start' },
  heroIcon: { fontSize: 36, marginBottom: 10 },
  heroTitle: { color: WHITE, fontSize: 26, fontWeight: '800', marginBottom: 8 },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 20, marginBottom: 14 },
  langRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  langBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  langBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: WHITE,
  },
  langFlag: { fontSize: 14 },
  langLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  langLabelActive: { color: WHITE },

  formCard: {
    backgroundColor: WHITE, marginHorizontal: 16,
    borderRadius: 20, padding: 22,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 }, elevation: 6,
    marginBottom: 16,
  },
  section: { marginBottom: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionDot: { width: 4, height: 18, borderRadius: 2, marginRight: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: DARK },
  optional: { color: GRAY, fontWeight: '400', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },

  infoBox: {
    backgroundColor: '#F5F3FF', borderRadius: 12, padding: 14,
    marginBottom: 20, marginTop: 8,
  },
  infoText: { color: '#5B21B6', fontSize: 13, lineHeight: 20 },

  btn: {
    backgroundColor: PURPLE, borderRadius: 14,
    paddingVertical: 17, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center',
    shadowColor: PURPLE, shadowOpacity: 0.35,
    shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  btnLoading: { backgroundColor: '#9F6FE8', shadowOpacity: 0 },
  btnText: { color: WHITE, fontSize: 15, fontWeight: '700' },

  disclaimer: {
    textAlign: 'center', fontSize: 11,
    color: 'rgba(255,255,255,0.5)', paddingHorizontal: 24, marginTop: 4,
  },
});
