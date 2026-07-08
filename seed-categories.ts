import { AppDataSource } from '../data-source';
import { Category } from '../../categories/entities/category.entity';

/**
 * Insère les 5 catégories principales de Mboa Connect.
 * Exécution : npm run seed
 */
async function run() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Category);

  const categories = [
    { slug: 'houses', nameFr: 'Maisons à louer', nameEn: 'Houses for rent', icon: 'home' },
    { slug: 'shops', nameFr: 'Boutiques à louer', nameEn: 'Shops for rent', icon: 'store' },
    { slug: 'land', nameFr: 'Terrains à vendre', nameEn: 'Land for sale', icon: 'tree' },
    { slug: 'businesses', nameFr: 'Commerces locaux', nameEn: 'Local businesses', icon: 'briefcase' },
    { slug: 'artisans', nameFr: 'Artisans', nameEn: 'Artisans', icon: 'wrench' },
  ];

  for (const cat of categories) {
    const existing = await repo.findOne({ where: { slug: cat.slug } });
    if (!existing) {
      await repo.save(repo.create(cat));
      console.log(`✅ Catégorie créée : ${cat.slug}`);
    } else {
      console.log(`↷ Catégorie déjà présente : ${cat.slug}`);
    }
  }

  await AppDataSource.destroy();
  console.log('🌱 Seed terminé.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
