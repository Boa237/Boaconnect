import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Listing } from '../types';

const GREEN = '#157347';

function formatPrice(listing: Listing) {
  if (!listing.price) return 'Prix sur demande';
  const amount = listing.price.toLocaleString('fr-FR').replace(/,/g, ' ');
  return `${amount} FCFA${listing.priceUnit === 'per_month' ? ' / mois' : ''}`;
}

export default function ListingCard({ listing, onPress }: { listing: Listing; onPress: () => void }) {
  const cover = listing.photos?.[0]?.url;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {cover ? (
        <Image source={{ uri: cover }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Text style={{ color: 'white', fontWeight: '700' }}>{listing.category?.nameFr?.[0] || '?'}</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
        <Text style={styles.price}>{formatPrice(listing)}</Text>
        <Text style={styles.location}>{listing.neighborhood}, {listing.city}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: 170, backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E7EAE6', marginRight: 12 },
  cover: { width: '100%', height: 100 },
  coverPlaceholder: { backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 10 },
  title: { fontSize: 12.5, fontWeight: '600', color: '#152119', height: 32 },
  price: { fontSize: 13, fontWeight: '700', color: GREEN, marginTop: 4 },
  location: { fontSize: 10.5, color: '#6B7A72', marginTop: 4 },
});
