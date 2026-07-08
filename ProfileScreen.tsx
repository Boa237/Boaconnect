import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

const GREEN = '#157347';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.phone}>{user?.phoneNumber}</Text>
        <Text style={styles.location}>{user?.neighborhood}, {user?.city}</Text>
      </View>

      {user?.role === 'admin' && (
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Admin')}>
          <Text style={styles.rowText}>🛡️ Tableau de bord administrateur</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 16, paddingTop: 50 },
  card: { backgroundColor: GREEN, borderRadius: 16, padding: 20, marginBottom: 20 },
  name: { color: 'white', fontSize: 17, fontWeight: '700' },
  phone: { color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  location: { color: 'rgba(255,255,255,0.85)', marginTop: 2, fontSize: 12 },
  row: { padding: 16, borderRadius: 12, backgroundColor: 'white', borderWidth: 1, borderColor: '#E7EAE6', marginBottom: 12 },
  rowText: { fontSize: 14, color: '#152119', fontWeight: '600' },
  logoutButton: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#C4432B', alignItems: 'center', marginTop: 'auto' },
  logoutText: { color: '#C4432B', fontWeight: '700' },
});
