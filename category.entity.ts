import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string; // houses | shops | land | businesses | artisans

  @Column()
  nameFr: string;

  @Column()
  nameEn: string;

  @Column({ nullable: true })
  icon: string;
}
