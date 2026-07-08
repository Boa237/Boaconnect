import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { categoriesApi } from '../api/categories';
import { listingsApi } from '../api/listings';
import { Category } from '../types';

const GREEN = '#157347';
const ARRONDISSEMENTS = ['Yaoundé I', 'Yaoundé II', 'Yaoundé III', 'Yaoundé IV', 'Yaoundé V', 'Yaoundé VI', 'Yaoundé VII'];

export default function PublishListingScreen({ navigation }: any) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState(ARRONDISSEMENTS[0]);
  const [neighborhood, setNeighborhood] = useState('');
  const [phone, setPhone] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoriesApi.findAll().then((cats) => {
      setCategories(cats);
      setCategoryId(cats[0]?.id);
    });
  }, []);

  const pickPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', "Autorisez l'accès aux photos pour continuer.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 6,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos(result.assets.map((a) => a.uri));
    }
  };

  const captureLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', "Autorisez la géolocalisation pour situer votre annonce sur la carte.");
      return;
    }
    const position = await Location.getCurrentPositionAsync({});
    setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
  };

  const handleSubmit = async () => {
    if (!categoryId || title.trim().length < 5 || description.trim().length < 10 || !neighborhood) {
      Alert.alert('Formulaire incomplet', 'Merci de remplir tous les champs obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      const listing = await listingsApi.create({
        categoryId,
        title,
        description,
        price: price ? Number(price) : undefined,
        priceUnit: price ? 'per_month' : 'on_request',
        city,
        neighborhood,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        contactPhone: phone || undefined,
        whatsappNumber: phone || undefined,
      } as any);

      if (photos.length > 0) {
        const urls = await listingsApi.uploadPhotos(photos);
        await listingsApi.attachPhotos(listing.id, urls);
      }

      Alert.alert('Annonce envoyée', 'Votre annonce sera visible après validation par un administrateur.');
      navigation.navigate('Home');
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.message || "Impossible de publier l'annonce.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingTop: 50, paddingBottom: 60 }}>
      <Text style={styles.header}>Nouvelle annonce</Text>

      <Text style={styles.label}>Catégorie</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.chip, categoryId === c.id && styles.chipActive]}
            onPress={() => setCategoryId(c.id)}
          >
            <Text style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}>{c.nameFr}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Titre</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ex: Belle maison 3 chambres à Bastos" />

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, { height: 90 }]} value={description} onChangeText={setDescription} multiline placeholder="Décrivez votre bien ou service..." />

      <Text style={styles.label}>Prix (FCFA, laisser vide si sur demande)</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="50000" />

      <Text style={styles.label}>Arrondissement</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {ARRONDISSEMENTS.map((a) => (
          <TouchableOpacity key={a} style={[styles.chip, city === a && styles.chipActive]} onPress={() => setCity(a)}>
            <Text style={[styles.chipText, city === a && styles.chipTextActive]}>{a}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Quartier</Text>
      <TextInput style={styles.input} value={neighborhood} onChangeText={setNeighborhood} placeholder="Ex: Bastos" />

      <Text style={styles.label}>Téléphone / WhatsApp de contact</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+237 6XX XXX XXX" />

      <TouchableOpacity style={styles.secondaryButton} onPress={captureLocation}>
        <Text style={styles.secondaryButtonText}>
          {coords ? '📍 Position capturée' : '📍 Utiliser ma position actuelle'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Photos ({photos.length}/6)</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {photos.map((uri) => (
          <Image key={uri} source={{ uri }} style={styles.thumb} />
        ))}
        <TouchableOpacity style={styles.addPhotoButton} onPress={pickPhotos}>
          <Text style={{ color: '#6B7A72', fontSize: 12 }}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Envoi...' : 'Envoyer pour validation'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  header: { fontSize: 20, fontWeight: '700', color: GREEN, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#152119', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#E7EAE6', borderRadius: 12, padding: 12, fontSize: 14, backgroundColor: 'white' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E7EAE6', backgroundColor: 'white', marginRight: 8 },
  chipActive: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { fontSize: 12, color: '#152119' },
  chipTextActive: { color: 'white', fontWeight: '600' },
  secondaryButton: { marginTop: 14, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: GREEN, alignItems: 'center' },
  secondaryButtonText: { color: GREEN, fontWeight: '600', fontSize: 13 },
  thumb: { width: 70, height: 70, borderRadius: 10 },
  addPhotoButton: { width: 70, height: 70, borderRadius: 10, borderWidth: 1, borderColor: '#E7EAE6', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  button: { backgroundColor: GREEN, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 15 },
});
