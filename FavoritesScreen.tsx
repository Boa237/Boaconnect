import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { favoritesApi } from '../api/favorites';
import { Listing } from '../types';
import ListingCard from '../components/ListingCard';

export default function FavoritesScreen({ navigation }: any) {
  const [favorites, setFavorites] = useState<Listing[]>([]);

  useFocusEffect(
    useCallback(() => {
      favoritesApi.findMine().then(setFavorites);
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mes favoris</Text>
      <FlatList
        data={favorites}
        keyExtractor={(l) => l.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12 }}
        ListEmptyComponent={<Text style={styles.empty}>Aucun favori pour le moment.</Text>}
        renderItem={({ item }) => (
          <ListingCard listing={item} onPress={() => navigation.navigate('ListingDetail', { id: item.id })} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 16, paddingTop: 50 },
  header: { fontSize: 20, fontWeight: '700', color: '#157347', marginBottom: 16 },
  empty: { textAlign: 'center', color: '#6B7A72', marginTop: 40 },
});
