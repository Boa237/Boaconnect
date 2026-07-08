import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { messagesApi } from '../api/messages';

const GREEN = '#157347';

export default function ConversationsScreen({ navigation }: any) {
  const [conversations, setConversations] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      messagesApi.findConversations().then(setConversations);
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Messages</Text>
      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ gap: 10 }}
        ListEmptyComponent={<Text style={styles.empty}>Aucune conversation pour le moment.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Chat', { conversationId: item.id })}>
            <Text style={styles.rowText}>Conversation du {new Date(item.createdAt).toLocaleDateString('fr-FR')}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 16, paddingTop: 50 },
  header: { fontSize: 20, fontWeight: '700', color: GREEN, marginBottom: 16 },
  row: { padding: 14, borderRadius: 12, backgroundColor: 'white', borderWidth: 1, borderColor: '#E7EAE6' },
  rowText: { fontSize: 13, color: '#152119' },
  empty: { textAlign: 'center', color: '#6B7A72', marginTop: 40 },
});
