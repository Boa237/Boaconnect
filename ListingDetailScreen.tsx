import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Linking, Dimensions, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { listingsApi } from '../api/listings';
import { favoritesApi } from '../api/favorites';
import { messagesApi } from '../api/messages';
import { Listing } from '../types';

const GREEN = '#157347';
const { width } = Dimensions.get('window');

export default function ListingDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [listing, setListing] = useState<Listing | null>(null);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    listingsApi.findOne(id).then(setListing);
    listingsApi.trackView(id).catch(() => undefined);
  }, [id]);

  if (!listing) return <View style={styles.container} />;

  const toggleFavorite = async () => {
    if (isFav) {
      await favoritesApi.remove(listing.id);
    } else {
      await favoritesApi.add(listing.id);
    }
    setIsFav(!isFav);
  };

  const call = () => listing.contactPhone && Linking.openURL(`tel:${listing.contactPhone}`);
  const whatsapp = () =>
    listing.whatsappNumber && Linking.openURL(`https://wa.me/${listing.whatsappNumber.replace(/[^0-9]/g, '')}`);

  const contactViaMessage = async () => {
    try {
      const { conversation } = await messagesApi.start(
        listing.ownerId,
        `Bonjour, je suis intéressé(e) par votre annonce "${listing.title}".`,
        listing.id,
      );
      navigation.navigate('Chat', { conversationId: conversation.id });
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.message || "Impossible d'ouvrir la conversation.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {listing.photos?.length > 0 ? (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {listing.photos.map((p) => (
            <Image key={p.id} source={{ uri: p.url }} style={{ width, height: 220 }} />
          ))}
        </ScrollView>
      ) : (
        <View style={[{ width, height: 220 }, styles.coverPlaceholder]} />
      )}

      <View style={styles.body}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>
          {listing.price ? `${listing.price.toLocaleString('fr-FR')} FCFA` : 'Prix sur demande'}
        </Text>
        <Text style={styles.location}>{listing.neighborhood}, {listing.city}</Text>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{listing.description}</Text>

        {listing.latitude && listing.longitude && (
          <>
            <Text style={styles.sectionTitle}>Localisation</Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: listing.latitude,
                longitude: listing.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={{ latitude: listing.latitude, longitude: listing.longitude }} />
            </MapView>
          </>
        )}

        <TouchableOpacity onPress={toggleFavorite} style={styles.favButton}>
          <Text style={{ color: isFav ? '#C4432B' : '#6B7A72' }}>
            {isFav ? '♥ Retiré des favoris au prochain appui' : '♡ Ajouter aux favoris'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.messageButton} onPress={contactViaMessage}>
          <Text style={styles.messageButtonText}>💬 Contacter par message (dans l'app)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contactRow}>
        <TouchableOpacity style={[styles.contactButton, styles.callButton]} onPress={call}>
          <Text style={styles.callText}>Appeler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.contactButton, styles.whatsappButton]} onPress={whatsapp}>
          <Text style={styles.whatsappText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  coverPlaceholder: { backgroundColor: GREEN },
  body: { padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#152119' },
  price: { fontSize: 20, fontWeight: '700', color: GREEN, marginTop: 6 },
  location: { fontSize: 12.5, color: '#6B7A72', marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#152119', marginTop: 18, marginBottom: 6 },
  description: { fontSize: 13, color: '#6B7A72', lineHeight: 20 },
  map: { width: '100%', height: 180, borderRadius: 12 },
  favButton: { marginTop: 20, alignItems: 'center' },
  messageButton: { marginTop: 14, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: GREEN, alignItems: 'center' },
  messageButtonText: { color: GREEN, fontWeight: '700', fontSize: 13 },
  contactRow: { flexDirection: 'row', padding: 16, gap: 12 },
  contactButton: { flex: 1, padding: 14, borderRadius: 14, alignItems: 'center' },
  callButton: { borderWidth: 1, borderColor: GREEN },
  callText: { color: GREEN, fontWeight: '700' },
  whatsappButton: { backgroundColor: '#25D366' },
  whatsappText: { color: 'white', fontWeight: '700' },
});
