import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

const GREEN = '#157347';

export default function PhoneLoginScreen({ navigation }: any) {
  const { requestOtp } = useAuth();
  const [phone, setPhone] = useState('+237');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (phone.length < 9) {
      Alert.alert('Numéro invalide', 'Veuillez saisir un numéro de téléphone valide.');
      return;
    }
    setLoading(true);
    try {
      await requestOtp(phone);
      navigation.navigate('OtpVerify', { phone });
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.message || "Impossible d'envoyer le code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mboa Connect</Text>
      <Text style={styles.subtitle}>Connectez-vous avec votre numéro de téléphone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="+237 6XX XXX XXX"
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Envoi...' : 'Envoyer le code'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#FAFAF8' },
  title: { fontSize: 26, fontWeight: '700', color: GREEN, textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', color: '#6B7A72', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#E7EAE6', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: 'white', marginBottom: 16 },
  button: { backgroundColor: GREEN, borderRadius: 14, padding: 16, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 15 },
});
