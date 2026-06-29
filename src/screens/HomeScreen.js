import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, SafeAreaView, StatusBar,
} from 'react-native';
import TagInput from '../components/TagInput';
import DrugAutocomplete from '../components/DrugAutocomplete';
import { analyzeInteractions } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [diseases, setDiseases] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (diseases.length === 0) {
      Alert.alert('Atenção', 'Adiciona pelo menos uma doença ou condição.');
      return;
    }
    if (drugs.length === 0) {
      Alert.alert('Atenção', 'Adiciona pelo menos um medicamento.');
      return;
    }
    setLoading(true);
    try {
      const result = await analyzeInteractions(diseases, drugs);
      navigation.navigate('Result', { result });
    } catch {
      Alert.alert('Erro', 'Não foi possível ligar ao servidor. Verifica que o backend está ativo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>💊 FarmacoClin</Text>
          <Text style={styles.subtitle}>Apoio à decisão clínica farmacológica</Text>
        </View>

        {/* Quick action: Prescription suggestion */}
        <TouchableOpacity
          style={styles.prescribeCard}
          onPress={() => navigation.navigate('Prescribe')}
        >
          <View>
            <Text style={styles.prescribeTitle}>📋 Sugestão de Receita</Text>
            <Text style={styles.prescribeSubtitle}>
              Indica as condições do paciente e recebe sugestão de medicação
            </Text>
          </View>
          <Text style={styles.prescribeArrow}>→</Text>
        </TouchableOpacity>

        {/* Interaction analysis card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔍 Análise de Interações</Text>
          <Text style={styles.cardSubtitle}>Verifica conflitos entre medicamentos e doenças</Text>

          <View style={styles.divider} />

          <TagInput
            label="Doenças / Condições do Paciente"
            placeholder="ex: diabetes tipo 2, hipertensão..."
            tags={diseases}
            onAdd={(d) => setDiseases([...diseases, d])}
            onRemove={(d) => setDiseases(diseases.filter((x) => x !== d))}
            color="#059669"
          />

          <DrugAutocomplete
            tags={drugs}
            onAdd={(d) => setDrugs([...drugs, d])}
            onRemove={(d) => setDrugs(drugs.filter((x) => x !== d))}
          />

          <TouchableOpacity
            style={[styles.analyzeBtn, loading && styles.analyzeBtnDisabled]}
            onPress={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.analyzeBtnText}>Analisar Interações</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          ⚕️ Ferramenta de apoio à decisão clínica. Não substitui o julgamento médico.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  prescribeCard: {
    backgroundColor: '#7C3AED', borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#7C3AED', shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  prescribeTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  prescribeSubtitle: { color: '#EDE9FE', fontSize: 12, marginTop: 4, maxWidth: '85%' },
  prescribeArrow: { color: '#fff', fontSize: 22 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  cardSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
  analyzeBtn: {
    backgroundColor: '#2563EB', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 4,
  },
  analyzeBtnDisabled: { backgroundColor: '#93C5FD' },
  analyzeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disclaimer: {
    textAlign: 'center', fontSize: 11, color: '#9CA3AF',
    marginTop: 20, paddingHorizontal: 20,
  },
});
