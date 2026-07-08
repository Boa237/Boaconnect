import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, RefreshControl, Image, Linking } from 'react-native';
import { listingsApi } from '../api/listings';
import { categoriesApi } from '../api/categories';
import { adsApi } from '../api/ads';
import { Category, Listing } from '../types';
import ListingCard from '../components/ListingCard';

const GREEN = '#157347';

export default function HomeScreen({ navigation }: any) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [cats, page, activeAds] = await Promise.all([
      categoriesApi.findAll(),
      listingsApi.findAll({ categoryId: activeCategory, q: query || undefined }),
      adsApi.findActive('home_banner').catch(() => []),
    ]);
    setCategories(cats);
    setListings(page.items);
    setAds(activeAds);
  }, [activeCategory, query]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleAdPress = async (ad: any) => {
    await adsApi.registerClick(ad.id).catch(() => undefined);
    if (ad.listingId) navigation.navigate('ListingDetail', { id: ad.listingId });
    else if (ad.targetUrl) Linking.openURL(ad.targetUrl);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mboa Connect</Text>
      <TextInput
        style={styles.search}
        placeholder="Rechercher à Yaoundé..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={load}
      />

      {ads.length > 0 && (
        <TouchableOpacity onPress={() => handleAdPress(ads[0])} style={styles.adBanner}>
          <Image source={{ uri: ads[0].imageUrl }} style={styles.adImage} />
        </TouchableOpacity>
      )}

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(c) => c.id}
        style={{ marginVertical: 10, flexGrow: 0 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, activeCategory === item.id && styles.chipActive]}
            onPress={() => setActiveCategory(activeCategory === item.id ? undefined : item.id)}
          >
            <Text style={[styles.chipText, activeCategory === item.id && styles.chipTextActive]}>{item.nameFr}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={listings}
        keyExtractor={(l) => l.id}
        numColumns={2}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.empty}>Aucune annonce pour le moment.</Text>}
        renderItem={({ item }) => (
          <ListingCard listing={item} onPress={() => navigation.navigate('ListingDetail', { id: item.id })} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 16, paddingTop: 50 },
  header: { fontSize: 20, fontWeight: '700', color: GREEN },
  search: { backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#E7EAE6', padding: 12, marginTop: 12 },
  adBanner: { marginTop: 12, borderRadius: 14, overflow: 'hidden' },
  adImage: { width: '100%', height: 90 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E7EAE6', backgroundColor: 'white', marginRight: 8 },
  chipActive: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { fontSize: 12, color: '#152119' },
  chipTextActive: { color: 'white', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#6B7A72', marginTop: 40 },
});
