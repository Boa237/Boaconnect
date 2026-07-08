import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

const GREEN = '#157347';

export default function OtpVerifyScreen({ route }: any) {
  const { phone } = route.params;
  const { verifyOtp } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      // La redirection (profil incomplet -> CompleteProfile, sinon -> Home)
      // est gérée automatiquement par RootNavigator via l'état `user` du contexte.
      await verifyOtp(phone, code);
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.message || 'Code invalide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vérification</Text>
      <Text style={styles.subtitle}>Code envoyé au {phone}</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        placeholder="123456"
        maxLength={6}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Vérification...' : 'Vérifier'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#FAFAF8' },
  title: { fontSize: 22, fontWeight: '700', color: GREEN, textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', color: '#6B7A72', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#E7EAE6', borderRadius: 12, padding: 14, fontSize: 20, letterSpacing: 6, textAlign: 'center', backgroundColor: 'white', marginBottom: 16 },
  button: { backgroundColor: GREEN, borderRadius: 14, padding: 16, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 15 },
});
