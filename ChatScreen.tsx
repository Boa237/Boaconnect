import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { messagesApi } from '../api/messages';
import { useAuth } from '../context/AuthContext';

const GREEN = '#157347';
// Rafraîchissement simple par sondage (polling). Pour une messagerie en temps réel,
// remplacez ceci par une connexion WebSocket (ex: @nestjs/websockets côté backend).
const POLL_INTERVAL_MS = 4000;

export default function ChatScreen({ route }: any) {
  const { conversationId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const intervalRef = useRef<any>(null);

  const load = () => messagesApi.findMessages(conversationId).then(setMessages);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [conversationId]);

  const send = async () => {
    if (!text.trim()) return;
    await messagesApi.sendMessage(conversationId, text);
    setText('');
    load();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ gap: 8, padding: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.senderId === user?.id ? styles.bubbleMine : styles.bubbleTheirs]}>
            <Text style={item.senderId === user?.id ? styles.bubbleTextMine : styles.bubbleTextTheirs}>{item.body}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Écrire un message..." />
        <TouchableOpacity style={styles.sendButton} onPress={send}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  bubble: { maxWidth: '75%', padding: 10, borderRadius: 14 },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: GREEN },
  bubbleTheirs: { alignSelf: 'flex-start', backgroundColor: 'white', borderWidth: 1, borderColor: '#E7EAE6' },
  bubbleTextMine: { color: 'white', fontSize: 13 },
  bubbleTextTheirs: { color: '#152119', fontSize: 13 },
  inputRow: { flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1, borderColor: '#E7EAE6', backgroundColor: 'white' },
  input: { flex: 1, borderWidth: 1, borderColor: '#E7EAE6', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  sendButton: { backgroundColor: GREEN, borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' },
});
