import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, SafeAreaView, StatusBar,
} from 'react-native';
import TagInput from '../components/TagInput';
import { suggestPrescription } from '../services/api';

export default function PrescribeScreen({ navigation }) {
  const [diseases, setDiseases] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [currentMeds, setCurrentMeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  async function handlePrescribe() {
    if (diseases.length === 0) {
      Alert.alert('Atenção', 'Adiciona pelo menos uma doença ou condição.');
      return;
    }
    setLoading(true);
    setLoadingMsg('A consultar guidelines clínicas...');
    const timer = setTimeout(() => setLoadingMsg('A analisar interações e contraindicações...'), 5000);
    const timer2 = setTimeout(() => setLoadingMsg('A preparar sugestão de receita...'), 12000);
    try {
      const result = await suggestPrescription(diseases, allergies, currentMeds);
      clearTimeout(timer);
      clearTimeout(timer2);
      navigation.navigate('Result', { result: { ...result, analysis: result.suggestion, isPrescription: true } });
    } catch (err) {
      clearTimeout(timer);
      clearTimeout(timer2);
      const msg = err.code === 'ECONNABORTED'
        ? 'A análise demorou demasiado. Tenta com menos condições ou verifica a ligação.'
        : 'Não foi possível ligar ao servidor. Verifica que o backend está ativo.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>📋 Sugestão de Receita</Text>
            <Text style={styles.subtitle}>Medicação baseada nas condições do paciente</Text>
          </View>
        </View>

        <View style={styles.card}>
          <TagInput
            label="Doenças / Condições"
            placeholder="ex: diabetes tipo 2, dores na coluna..."
            tags={diseases}
            onAdd={(d) => setDiseases([...diseases, d])}
            onRemove={(d) => setDiseases(diseases.filter((x) => x !== d))}
            color="#7C3AED"
          />

          <TagInput
            label="Alergias (opcional)"
            placeholder="ex: penicilina, AINEs..."
            tags={allergies}
            onAdd={(d) => setAllergies([...allergies, d])}
            onRemove={(d) => setAllergies(allergies.filter((x) => x !== d))}
            color="#DC2626"
          />

          <TagInput
            label="Medicação atual (opcional)"
            placeholder="ex: metformina, omeprazol..."
            tags={currentMeds}
            onAdd={(d) => setCurrentMeds([...currentMeds, d])}
            onRemove={(d) => setCurrentMeds(currentMeds.filter((x) => x !== d))}
            color="#059669"
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              🤖 O Claude irá sugerir medicação de primeira e segunda linha com base nas guidelines clínicas, verificando interações e contraindicações.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handlePrescribe}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>{loadingMsg}</Text>
              </View>
            ) : (
              <Text style={styles.btnText}>Gerar Sugestão de Receita</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          ⚕️ Sugestão de apoio clínico gerada por IA. Não substitui o julgamento médico nem dispensa a consulta das guidelines atuais.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: 8, gap: 12 },
  backBtn: { padding: 4 },
  backText: { fontSize: 24, color: '#374151' },
  headerText: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  infoBox: {
    backgroundColor: '#F5F3FF', borderRadius: 10, padding: 12,
    marginBottom: 20, borderLeftWidth: 3, borderLeftColor: '#7C3AED',
  },
  infoText: { fontSize: 13, color: '#5B21B6', lineHeight: 20 },
  btn: {
    backgroundColor: '#7C3AED', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#C4B5FD' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadingText: { color: '#EDE9FE', fontSize: 13 },
  disclaimer: {
    textAlign: 'center', fontSize: 11, color: '#9CA3AF',
    marginTop: 20, paddingHorizontal: 20,
  },
});
