import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';

export default function TagInput({ label, placeholder, tags, onAdd, onRemove, color = '#2563EB' }) {
  const [text, setText] = useState('');

  function handleAdd() {
    const trimmed = text.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed);
      setText('');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: color }]} onPress={handleAdd}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsRow}>
        {tags.map((tag) => (
          <View key={tag} style={[styles.tag, { backgroundColor: color + '20', borderColor: color }]}>
            <Text style={[styles.tagText, { color }]}>{tag}</Text>
            <TouchableOpacity onPress={() => onRemove(tag)} style={styles.removeBtn}>
              <Text style={[styles.removeText, { color }]}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  addBtn: {
    width: 44, height: 44, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 24, lineHeight: 28 },
  tagsRow: { marginTop: 10 },
  tag: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    marginRight: 8,
  },
  tagText: { fontSize: 13, fontWeight: '500' },
  removeBtn: { marginLeft: 6 },
  removeText: { fontSize: 12, fontWeight: '700' },
});
