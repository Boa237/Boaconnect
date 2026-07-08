export enum ListingStatus {
  PENDING = 'pending',   // en attente de modération
  APPROVED = 'approved', // visible publiquement
  REJECTED = 'rejected', // refusée par un admin
  ARCHIVED = 'archived', // retirée par son propriétaire
}
