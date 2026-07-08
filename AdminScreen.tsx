import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { adminApi } from '../api/admin';
import { Listing } from '../types';

const GREEN = '#157347';

export default function AdminScreen() {
  const [pending, setPending] = useState<Listing[]>([]);

  const load = useCallback(() => {
    adminApi.findPending().then(setPending);
  }, []);

  useFocusEffect(load);

  const approve = async (id: string) => {
    await adminApi.approve(id);
    load();
  };

  // NOTE : Alert.prompt n'existe que sur iOS. Sur Android, remplacez ceci par
  // une petite modale avec un TextInput pour saisir le motif de rejet.
  const reject = async (id: string) => {
    await adminApi.reject(id, 'Annonce non conforme aux règles de publication.');
    load();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{pending.length} annonce(s) en attente</Text>
      <FlatList
        data={pending}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>{item.neighborhood}, {item.city}</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.rejectButton} onPress={() => reject(item.id)}>
                <Text style={styles.rejectText}>Rejeter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveButton} onPress={() => approve(item.id)}>
                <Text style={styles.approveText}>Approuver</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 16 },
  header: { fontSize: 14, color: '#6B7A72', marginBottom: 12 },
  card: { backgroundColor: 'white', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E7EAE6' },
  title: { fontSize: 14, fontWeight: '700', color: '#152119' },
  meta: { fontSize: 12, color: '#6B7A72', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  rejectButton: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#C4432B', alignItems: 'center' },
  rejectText: { color: '#C4432B', fontWeight: '700', fontSize: 12.5 },
  approveButton: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: GREEN, alignItems: 'center' },
  approveText: { color: 'white', fontWeight: '700', fontSize: 12.5 },
});
