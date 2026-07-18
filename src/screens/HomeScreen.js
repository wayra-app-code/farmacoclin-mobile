import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, SafeAreaView,
  StatusBar, Platform,
} from 'react-native';
import TagInput from '../components/TagInput';
import DrugAutocomplete from '../components/DrugAutocomplete';
import { analyzeInteractions } from '../services/api';
import { useLanguage } from '../LanguageContext';

const BLUE = '#1B4FD8';
const TEAL = '#0D9488';
const DARK = '#0F172A';
const GRAY = '#64748B';
const LIGHT = '#F1F5F9';
const WHITE = '#FFFFFF';

const LANGUAGES = [
  { code: 'pt', flag: '🇵🇹', label: 'PT' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
];

export default function HomeScreen({ navigation }) {
  const [diseases, setDiseases] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { language, setLanguage } = useLanguage();

  async function handleAnalyze() {
    if (!diseases.length) { Alert.alert('Atenção', 'Adiciona pelo menos uma doença ou condição.'); return; }
    if (!drugs.length) { Alert.alert('Atenção', 'Adiciona pelo menos um medicamento.'); return; }
    setLoading(true);
    try {
      const result = await analyzeInteractions(diseases, drugs, language);
      navigation.navigate('Result', { result });
    } catch {
      Alert.alert('Erro de ligação', 'Não foi possível ligar ao servidor. Verifica a tua ligação à internet.');
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Hero header */}
        <View style={s.hero}>
          <View style={s.logoRow}>
            <View style={s.logoIcon}>
              <Text style={s.logoIconText}>＋</Text>
            </View>
            <Text style={s.logoText}>FarmacoClin</Text>
          </View>
          <Text style={s.heroSubtitle}>Apoio farmacológico à decisão clínica</Text>
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

        {/* Quick action cards */}
        <View style={s.cardsRow}>
          <TouchableOpacity style={[s.quickCard, { backgroundColor: TEAL }]} onPress={() => navigation.navigate('Prescribe')}>
            <Text style={s.quickCardIcon}>📋</Text>
            <Text style={s.quickCardTitle}>Sugestão{'\n'}de Receita</Text>
            <Text style={s.quickCardArrow}>→</Text>
          </TouchableOpacity>
          <View style={[s.quickCard, { backgroundColor: '#1E3A8A', flex: 1.2 }]}>
            <Text style={s.quickCardIcon}>⚡</Text>
            <Text style={s.quickCardTitle}>Análise{'\n'}Rápida</Text>
            <Text style={s.quickCardSub}>Preenche abaixo</Text>
          </View>
        </View>

        {/* Main form card */}
        <View style={s.formCard}>
          <View style={s.formHeader}>
            <View style={[s.formHeaderDot, { backgroundColor: BLUE }]} />
            <Text style={s.formTitle}>Análise de Interações</Text>
          </View>
          <Text style={s.formDesc}>Verifica conflitos entre medicamentos e condições clínicas</Text>

          <View style={s.divider} />

          <TagInput
            label="Doenças / Condições"
            placeholder="ex: diabetes tipo 2, hipertensão..."
            tags={diseases}
            onAdd={(d) => setDiseases([...diseases, d])}
            onRemove={(d) => setDiseases(diseases.filter(x => x !== d))}
            color={TEAL}
          />

          <DrugAutocomplete
            tags={drugs}
            onAdd={(d) => setDrugs([...drugs, d])}
            onRemove={(d) => setDrugs(drugs.filter(x => x !== d))}
          />

          <TouchableOpacity
            style={[s.analyzeBtn, loading && s.analyzeBtnLoading]}
            onPress={handleAnalyze}
            disabled={loading}
          >
            {loading
              ? <><ActivityIndicator color={WHITE} style={{ marginRight: 10 }} /><Text style={s.analyzeBtnText}>A analisar...</Text></>
              : <Text style={s.analyzeBtnText}>Analisar Interações</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={s.disclaimer}>⚕️ Ferramenta de apoio à decisão clínica — não substitui o julgamento médico</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BLUE },
  scroll: { paddingBottom: 40 },

  hero: {
    backgroundColor: BLUE,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  logoIconText: { color: WHITE, fontSize: 20, fontWeight: '700' },
  logoText: { color: WHITE, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  heroSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 14 },
  langRow: { flexDirection: 'row', gap: 8 },
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

  cardsRow: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, marginTop: -8, marginBottom: 16,
  },
  quickCard: {
    flex: 1, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  quickCardIcon: { fontSize: 24, marginBottom: 8 },
  quickCardTitle: { color: WHITE, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  quickCardArrow: { color: 'rgba(255,255,255,0.8)', fontSize: 20, marginTop: 8 },
  quickCardSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 4 },

  formCard: {
    backgroundColor: WHITE,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 }, elevation: 6,
    marginBottom: 16,
  },
  formHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  formHeaderDot: { width: 4, height: 20, borderRadius: 2, marginRight: 10 },
  formTitle: { fontSize: 18, fontWeight: '800', color: DARK },
  formDesc: { fontSize: 13, color: GRAY, marginBottom: 16, marginLeft: 14 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 20 },

  analyzeBtn: {
    backgroundColor: BLUE, borderRadius: 14,
    paddingVertical: 17, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center',
    marginTop: 8,
    shadowColor: BLUE, shadowOpacity: 0.35,
    shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  analyzeBtnLoading: { backgroundColor: '#6B91E8', shadowOpacity: 0 },
  analyzeBtnText: { color: WHITE, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  disclaimer: {
    textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 24, marginTop: 4,
  },
});
