import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, ActivityIndicator,
} from 'react-native';
import { searchDrugs } from '../services/api';

export default function DrugAutocomplete({ tags, onAdd, onRemove }) {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchDrugs(text);
        setSuggestions(results.slice(0, 5));
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [text]);

  function handleAdd(name) {
    const trimmed = (name || text).trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed);
    }
    setText('');
    setSuggestions([]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Medicamentos</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="ex: ibuprofeno, metformina, losartan..."
          placeholderTextColor="#9CA3AF"
          onSubmitEditing={() => handleAdd()}
          returnKeyType="done"
        />
        {loading ? (
          <ActivityIndicator style={styles.loader} color="#2563EB" />
        ) : (
          <TouchableOpacity style={styles.addBtn} onPress={() => handleAdd()}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Autocomplete suggestions */}
      {suggestions.length > 0 && (
        <View style={styles.dropdown}>
          {suggestions.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={styles.suggestion}
              onPress={() => handleAdd(s.generic || s.brand)}
            >
              <Text style={styles.suggestionGeneric}>{s.generic}</Text>
              {s.brand && s.brand !== s.generic && (
                <Text style={styles.suggestionBrand}> ({s.brand})</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Tags */}
      <View style={styles.tagsWrap}>
        {tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
            <TouchableOpacity onPress={() => onRemove(tag)}>
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Text style={styles.hint}>💡 Podes escrever em português — traduzimos automaticamente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputRow: { flexDirection: 'row', gap: 8, zIndex: 10 },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  addBtn: {
    width: 44, height: 44, borderRadius: 10, backgroundColor: '#2563EB',
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 24, lineHeight: 28 },
  loader: { width: 44, height: 44 },
  dropdown: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    backgroundColor: '#fff', marginTop: 4, zIndex: 20,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 4,
  },
  suggestion: {
    flexDirection: 'row', padding: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center',
  },
  suggestionGeneric: { fontSize: 14, color: '#111827', fontWeight: '500' },
  suggestionBrand: { fontSize: 13, color: '#6B7280' },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 },
  tag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#2563EB',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  tagText: { fontSize: 13, fontWeight: '500', color: '#2563EB' },
  removeText: { color: '#2563EB', fontSize: 12, fontWeight: '700', marginLeft: 6 },
  hint: { fontSize: 11, color: '#6B7280', marginTop: 8 },
});
