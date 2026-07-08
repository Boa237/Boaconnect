import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const GREEN = '#157347';
const ARRONDISSEMENTS = ['Yaoundé I', 'Yaoundé II', 'Yaoundé III', 'Yaoundé IV', 'Yaoundé V', 'Yaoundé VI', 'Yaoundé VII'];

export default function CompleteProfileScreen() {
  const { completeProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState(ARRONDISSEMENTS[0]);
  const [neighborhood, setNeighborhood] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (fullName.trim().length < 2) {
      Alert.alert('Nom requis', 'Veuillez entrer votre nom complet.');
      return;
    }
    setLoading(true);
    try {
      await completeProfile(fullName, city, neighborhood);
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.message || 'Impossible de finaliser le profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Complétez votre profil</Text>

      <Text style={styles.label}>Nom complet</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Ex: Aïcha Souley" />

      <Text style={styles.label}>Arrondissement</Text>
      <View style={styles.chipsRow}>
        {ARRONDISSEMENTS.map((a) => (
          <TouchableOpacity
            key={a}
            style={[styles.chip, city === a && styles.chipActive]}
            onPress={() => setCity(a)}
          >
            <Text style={[styles.chipText, city === a && styles.chipTextActive]}>{a}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Quartier</Text>
      <TextInput style={styles.input} value={neighborhood} onChangeText={setNeighborhood} placeholder="Ex: Bastos" />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Enregistrement...' : 'Continuer'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#FAFAF8', flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: GREEN, marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#152119', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#E7EAE6', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: 'white' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E7EAE6', backgroundColor: 'white', marginRight: 6, marginBottom: 6 },
  chipActive: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { fontSize: 12.5, color: '#152119' },
  chipTextActive: { color: 'white', fontWeight: '600' },
  button: { backgroundColor: GREEN, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 15 },
});
