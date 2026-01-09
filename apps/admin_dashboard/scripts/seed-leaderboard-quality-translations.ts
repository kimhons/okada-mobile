import { drizzle } from "drizzle-orm/mysql2";
import { translations } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const leaderboardTranslations = [
  // English - Rider Leaderboard
  { languageCode: "en", namespace: "leaderboard", key: "title", value: "Rider Performance Leaderboard" },
  { languageCode: "en", namespace: "leaderboard", key: "subtitle", value: "Track and celebrate top-performing riders" },
  { languageCode: "en", namespace: "leaderboard", key: "lastUpdated", value: "Last updated" },
  { languageCode: "en", namespace: "leaderboard", key: "autoRefresh", value: "Auto-refreshes every 30s" },
  { languageCode: "en", namespace: "leaderboard", key: "refresh", value: "Refresh" },
  
  // Stats
  { languageCode: "en", namespace: "leaderboard", key: "stats.totalRiders", value: "Total Riders" },
  { languageCode: "en", namespace: "leaderboard", key: "stats.totalDeliveries", value: "Total Deliveries" },
  { languageCode: "en", namespace: "leaderboard", key: "stats.avgPerformance", value: "Avg Performance" },
  { languageCode: "en", namespace: "leaderboard", key: "stats.totalEarnings", value: "Total Earnings" },
  { languageCode: "en", namespace: "leaderboard", key: "stats.activeIn", value: "Active in {{period}}" },
  { languageCode: "en", namespace: "leaderboard", key: "stats.completed", value: "Completed {{period}}" },
  { languageCode: "en", namespace: "leaderboard", key: "stats.outOf100", value: "Out of 100 points" },
  { languageCode: "en", namespace: "leaderboard", key: "stats.earned", value: "Earned {{period}}" },
  
  // Leaderboard
  { languageCode: "en", namespace: "leaderboard", key: "leaderboard.title", value: "Leaderboard" },
  
  // Period
  { languageCode: "en", namespace: "leaderboard", key: "period.today", value: "Today" },
  { languageCode: "en", namespace: "leaderboard", key: "period.week", value: "This Week" },
  { languageCode: "en", namespace: "leaderboard", key: "period.month", value: "This Month" },
  { languageCode: "en", namespace: "leaderboard", key: "period.all", value: "All Time" },
  
  // Category
  { languageCode: "en", namespace: "leaderboard", key: "category.overall", value: "Overall Performance" },
  { languageCode: "en", namespace: "leaderboard", key: "category.earnings", value: "Top Earners" },
  { languageCode: "en", namespace: "leaderboard", key: "category.deliveries", value: "Delivery Champions" },
  { languageCode: "en", namespace: "leaderboard", key: "category.rating", value: "Customer Favorites" },
  { languageCode: "en", namespace: "leaderboard", key: "category.speed", value: "Speed Masters" },
  
  // Tier
  { languageCode: "en", namespace: "leaderboard", key: "tier.all", value: "All Tiers" },
  { languageCode: "en", namespace: "leaderboard", key: "tier.platinum", value: "Platinum" },
  { languageCode: "en", namespace: "leaderboard", key: "tier.gold", value: "Gold" },
  { languageCode: "en", namespace: "leaderboard", key: "tier.silver", value: "Silver" },
  { languageCode: "en", namespace: "leaderboard", key: "tier.bronze", value: "Bronze" },
  { languageCode: "en", namespace: "leaderboard", key: "tier.rookie", value: "Rookie" },
  
  // Compare
  { languageCode: "en", namespace: "leaderboard", key: "compare.button", value: "Compare ({{count}}/2)" },
  
  // Table
  { languageCode: "en", namespace: "leaderboard", key: "table.compare", value: "Compare" },
  { languageCode: "en", namespace: "leaderboard", key: "table.rank", value: "Rank" },
  { languageCode: "en", namespace: "leaderboard", key: "table.rider", value: "Rider" },
  { languageCode: "en", namespace: "leaderboard", key: "table.tier", value: "Tier" },
  { languageCode: "en", namespace: "leaderboard", key: "table.score", value: "Score" },
  { languageCode: "en", namespace: "leaderboard", key: "table.deliveries", value: "Deliveries" },
  { languageCode: "en", namespace: "leaderboard", key: "table.rating", value: "Rating" },
  { languageCode: "en", namespace: "leaderboard", key: "table.onTime", value: "On-Time" },
  { languageCode: "en", namespace: "leaderboard", key: "table.earnings", value: "Earnings" },
  { languageCode: "en", namespace: "leaderboard", key: "table.status", value: "Status" },
  { languageCode: "en", namespace: "leaderboard", key: "table.scoreMax", value: "/ 100" },
  
  // Empty
  { languageCode: "en", namespace: "leaderboard", key: "empty", value: "No riders found for {{period}}" },

  // French - Rider Leaderboard
  { languageCode: "fr", namespace: "leaderboard", key: "title", value: "Classement des Performances des Livreurs" },
  { languageCode: "fr", namespace: "leaderboard", key: "subtitle", value: "Suivre et célébrer les meilleurs livreurs" },
  { languageCode: "fr", namespace: "leaderboard", key: "lastUpdated", value: "Dernière mise à jour" },
  { languageCode: "fr", namespace: "leaderboard", key: "autoRefresh", value: "Actualisation automatique toutes les 30s" },
  { languageCode: "fr", namespace: "leaderboard", key: "refresh", value: "Actualiser" },
  
  // Stats
  { languageCode: "fr", namespace: "leaderboard", key: "stats.totalRiders", value: "Total des Livreurs" },
  { languageCode: "fr", namespace: "leaderboard", key: "stats.totalDeliveries", value: "Total des Livraisons" },
  { languageCode: "fr", namespace: "leaderboard", key: "stats.avgPerformance", value: "Performance Moyenne" },
  { languageCode: "fr", namespace: "leaderboard", key: "stats.totalEarnings", value: "Gains Totaux" },
  { languageCode: "fr", namespace: "leaderboard", key: "stats.activeIn", value: "Actif dans {{period}}" },
  { languageCode: "fr", namespace: "leaderboard", key: "stats.completed", value: "Complété {{period}}" },
  { languageCode: "fr", namespace: "leaderboard", key: "stats.outOf100", value: "Sur 100 points" },
  { languageCode: "fr", namespace: "leaderboard", key: "stats.earned", value: "Gagné {{period}}" },
  
  // Leaderboard
  { languageCode: "fr", namespace: "leaderboard", key: "leaderboard.title", value: "Classement" },
  
  // Period
  { languageCode: "fr", namespace: "leaderboard", key: "period.today", value: "Aujourd'hui" },
  { languageCode: "fr", namespace: "leaderboard", key: "period.week", value: "Cette Semaine" },
  { languageCode: "fr", namespace: "leaderboard", key: "period.month", value: "Ce Mois" },
  { languageCode: "fr", namespace: "leaderboard", key: "period.all", value: "Tout le Temps" },
  
  // Category
  { languageCode: "fr", namespace: "leaderboard", key: "category.overall", value: "Performance Globale" },
  { languageCode: "fr", namespace: "leaderboard", key: "category.earnings", value: "Meilleurs Gains" },
  { languageCode: "fr", namespace: "leaderboard", key: "category.deliveries", value: "Champions de Livraison" },
  { languageCode: "fr", namespace: "leaderboard", key: "category.rating", value: "Favoris des Clients" },
  { languageCode: "fr", namespace: "leaderboard", key: "category.speed", value: "Maîtres de la Vitesse" },
  
  // Tier
  { languageCode: "fr", namespace: "leaderboard", key: "tier.all", value: "Tous les Niveaux" },
  { languageCode: "fr", namespace: "leaderboard", key: "tier.platinum", value: "Platine" },
  { languageCode: "fr", namespace: "leaderboard", key: "tier.gold", value: "Or" },
  { languageCode: "fr", namespace: "leaderboard", key: "tier.silver", value: "Argent" },
  { languageCode: "fr", namespace: "leaderboard", key: "tier.bronze", value: "Bronze" },
  { languageCode: "fr", namespace: "leaderboard", key: "tier.rookie", value: "Débutant" },
  
  // Compare
  { languageCode: "fr", namespace: "leaderboard", key: "compare.button", value: "Comparer ({{count}}/2)" },
  
  // Table
  { languageCode: "fr", namespace: "leaderboard", key: "table.compare", value: "Comparer" },
  { languageCode: "fr", namespace: "leaderboard", key: "table.rank", value: "Rang" },
  { languageCode: "fr", namespace: "leaderboard", key: "table.rider", value: "Livreur" },
  { languageCode: "fr", namespace: "leaderboard", key: "table.tier", value: "Niveau" },
  { languageCode: "fr", namespace: "leaderboard", key: "table.score", value: "Score" },
  { languageCode: "fr", namespace: "leaderboard", key: "table.deliveries", value: "Livraisons" },
  { languageCode: "fr", namespace: "leaderboard", key: "table.rating", value: "Note" },
  { languageCode: "fr", namespace: "leaderboard", key: "table.onTime", value: "À l'Heure" },
  { languageCode: "fr", namespace: "leaderboard", key: "table.earnings", value: "Gains" },
  { languageCode: "fr", namespace: "leaderboard", key: "table.status", value: "Statut" },
  { languageCode: "fr", namespace: "leaderboard", key: "table.scoreMax", value: "/ 100" },
  
  // Empty
  { languageCode: "fr", namespace: "leaderboard", key: "empty", value: "Aucun livreur trouvé pour {{period}}" },
];

const qualityTranslations = [
  // English - Quality Verification
  { languageCode: "en", namespace: "quality", key: "title", value: "Quality Verification Review" },
  { languageCode: "en", namespace: "quality", key: "subtitle", value: "Review and approve delivery quality photos submitted by riders" },
  { languageCode: "en", namespace: "quality", key: "loading", value: "Loading quality verification photos..." },
  
  // Empty State
  { languageCode: "en", namespace: "quality", key: "empty.title", value: "No pending photos to review" },
  { languageCode: "en", namespace: "quality", key: "empty.message", value: "All quality verification photos have been reviewed" },
  
  // Card
  { languageCode: "en", namespace: "quality", key: "card.pending", value: "Pending" },
  { languageCode: "en", namespace: "quality", key: "card.photoAlt", value: "Quality verification photo" },
  { languageCode: "en", namespace: "quality", key: "card.customer", value: "Customer" },
  { languageCode: "en", namespace: "quality", key: "card.deliveryAddress", value: "Delivery Address" },
  { languageCode: "en", namespace: "quality", key: "card.uploaded", value: "Uploaded" },
  { languageCode: "en", namespace: "quality", key: "card.approve", value: "Approve" },
  { languageCode: "en", namespace: "quality", key: "card.reject", value: "Reject" },
  
  // Dialog
  { languageCode: "en", namespace: "quality", key: "dialog.title", value: "Quality Verification Photo" },
  { languageCode: "en", namespace: "quality", key: "dialog.description", value: "Order {{orderNumber}} - {{riderName}}" },
  { languageCode: "en", namespace: "quality", key: "dialog.customer", value: "Customer" },
  { languageCode: "en", namespace: "quality", key: "dialog.rider", value: "Rider" },
  { languageCode: "en", namespace: "quality", key: "dialog.deliveryAddress", value: "Delivery Address" },
  { languageCode: "en", namespace: "quality", key: "dialog.uploaded", value: "Uploaded" },
  { languageCode: "en", namespace: "quality", key: "dialog.close", value: "Close" },
  { languageCode: "en", namespace: "quality", key: "dialog.reject", value: "Reject" },
  { languageCode: "en", namespace: "quality", key: "dialog.approve", value: "Approve" },
  
  // Reject Dialog
  { languageCode: "en", namespace: "quality", key: "reject.title", value: "Reject Quality Photo" },
  { languageCode: "en", namespace: "quality", key: "reject.description", value: "Please provide a reason for rejecting this photo. This will be sent to the rider." },
  { languageCode: "en", namespace: "quality", key: "reject.placeholder", value: "Enter rejection reason..." },
  { languageCode: "en", namespace: "quality", key: "reject.cancel", value: "Cancel" },
  { languageCode: "en", namespace: "quality", key: "reject.submit", value: "Reject Photo" },
  
  // Toast Messages
  { languageCode: "en", namespace: "quality", key: "toast.approveSuccess", value: "Photo approved successfully" },
  { languageCode: "en", namespace: "quality", key: "toast.approveError", value: "Failed to approve photo: {{error}}" },
  { languageCode: "en", namespace: "quality", key: "toast.rejectSuccess", value: "Photo rejected" },
  { languageCode: "en", namespace: "quality", key: "toast.rejectError", value: "Failed to reject photo: {{error}}" },
  { languageCode: "en", namespace: "quality", key: "toast.reasonRequired", value: "Please provide a rejection reason" },

  // French - Quality Verification
  { languageCode: "fr", namespace: "quality", key: "title", value: "Vérification de la Qualité" },
  { languageCode: "fr", namespace: "quality", key: "subtitle", value: "Examiner et approuver les photos de qualité de livraison soumises par les livreurs" },
  { languageCode: "fr", namespace: "quality", key: "loading", value: "Chargement des photos de vérification de qualité..." },
  
  // Empty State
  { languageCode: "fr", namespace: "quality", key: "empty.title", value: "Aucune photo en attente de révision" },
  { languageCode: "fr", namespace: "quality", key: "empty.message", value: "Toutes les photos de vérification de qualité ont été examinées" },
  
  // Card
  { languageCode: "fr", namespace: "quality", key: "card.pending", value: "En Attente" },
  { languageCode: "fr", namespace: "quality", key: "card.photoAlt", value: "Photo de vérification de qualité" },
  { languageCode: "fr", namespace: "quality", key: "card.customer", value: "Client" },
  { languageCode: "fr", namespace: "quality", key: "card.deliveryAddress", value: "Adresse de Livraison" },
  { languageCode: "fr", namespace: "quality", key: "card.uploaded", value: "Téléchargé" },
  { languageCode: "fr", namespace: "quality", key: "card.approve", value: "Approuver" },
  { languageCode: "fr", namespace: "quality", key: "card.reject", value: "Rejeter" },
  
  // Dialog
  { languageCode: "fr", namespace: "quality", key: "dialog.title", value: "Photo de Vérification de Qualité" },
  { languageCode: "fr", namespace: "quality", key: "dialog.description", value: "Commande {{orderNumber}} - {{riderName}}" },
  { languageCode: "fr", namespace: "quality", key: "dialog.customer", value: "Client" },
  { languageCode: "fr", namespace: "quality", key: "dialog.rider", value: "Livreur" },
  { languageCode: "fr", namespace: "quality", key: "dialog.deliveryAddress", value: "Adresse de Livraison" },
  { languageCode: "fr", namespace: "quality", key: "dialog.uploaded", value: "Téléchargé" },
  { languageCode: "fr", namespace: "quality", key: "dialog.close", value: "Fermer" },
  { languageCode: "fr", namespace: "quality", key: "dialog.reject", value: "Rejeter" },
  { languageCode: "fr", namespace: "quality", key: "dialog.approve", value: "Approuver" },
  
  // Reject Dialog
  { languageCode: "fr", namespace: "quality", key: "reject.title", value: "Rejeter la Photo de Qualité" },
  { languageCode: "fr", namespace: "quality", key: "reject.description", value: "Veuillez fournir une raison pour rejeter cette photo. Cela sera envoyé au livreur." },
  { languageCode: "fr", namespace: "quality", key: "reject.placeholder", value: "Entrez la raison du rejet..." },
  { languageCode: "fr", namespace: "quality", key: "reject.cancel", value: "Annuler" },
  { languageCode: "fr", namespace: "quality", key: "reject.submit", value: "Rejeter la Photo" },
  
  // Toast Messages
  { languageCode: "fr", namespace: "quality", key: "toast.approveSuccess", value: "Photo approuvée avec succès" },
  { languageCode: "fr", namespace: "quality", key: "toast.approveError", value: "Échec de l'approbation de la photo : {{error}}" },
  { languageCode: "fr", namespace: "quality", key: "toast.rejectSuccess", value: "Photo rejetée" },
  { languageCode: "fr", namespace: "quality", key: "toast.rejectError", value: "Échec du rejet de la photo : {{error}}" },
  { languageCode: "fr", namespace: "quality", key: "toast.reasonRequired", value: "Veuillez fournir une raison de rejet" },
];

async function seedTranslations() {
  console.log("🌱 Seeding Rider Leaderboard and Quality Verification translations...");

  const allTranslations = [...leaderboardTranslations, ...qualityTranslations];

  for (const translation of allTranslations) {
    await db
      .insert(translations)
      .values(translation)
      .onDuplicateKeyUpdate({
        set: { value: translation.value },
      });
  }

  console.log(`✅ Seeded ${leaderboardTranslations.length} leaderboard translations (${leaderboardTranslations.length / 2} per language)`);
  console.log(`✅ Seeded ${qualityTranslations.length} quality translations (${qualityTranslations.length / 2} per language)`);
  console.log(`✅ Total: ${allTranslations.length} translations seeded successfully`);
}

seedTranslations()
  .then(() => {
    console.log("✅ Translation seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error seeding translations:", error);
    process.exit(1);
  });
