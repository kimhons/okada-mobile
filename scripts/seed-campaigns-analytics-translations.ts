/**
 * Seed script for Campaigns and Analytics pages translations
 * Pages: Promotional Campaigns, Analytics Dashboard
 * Run with: pnpm tsx scripts/seed-campaigns-analytics-translations.ts
 */

import { getDb } from "../server/db";
import { translations } from "../drizzle/schema";

const campaignsAnalyticsTranslations = [
  // ============================================================================
  // PROMOTIONAL CAMPAIGNS PAGE (campaigns namespace) - ~114 translations
  // ============================================================================
  
  // Header (8 translations)
  { namespace: "campaigns", key: "title", languageCode: "en", value: "Promotional Campaigns" },
  { namespace: "campaigns", key: "title", languageCode: "fr", value: "Campagnes Promotionnelles" },
  { namespace: "campaigns", key: "subtitle", languageCode: "en", value: "Create and manage marketing campaigns and promotions" },
  { namespace: "campaigns", key: "subtitle", languageCode: "fr", value: "Créer et gérer les campagnes marketing et promotions" },
  { namespace: "campaigns", key: "createCampaign", languageCode: "en", value: "Create Campaign" },
  { namespace: "campaigns", key: "createCampaign", languageCode: "fr", value: "Créer une Campagne" },
  { namespace: "campaigns", key: "loading", languageCode: "en", value: "Loading campaigns..." },
  { namespace: "campaigns", key: "loading", languageCode: "fr", value: "Chargement des campagnes..." },

  // Stats Cards (16 translations)
  { namespace: "campaigns", key: "stats.activeCampaigns", languageCode: "en", value: "Active Campaigns" },
  { namespace: "campaigns", key: "stats.activeCampaigns", languageCode: "fr", value: "Campagnes Actives" },
  { namespace: "campaigns", key: "stats.totalReach", languageCode: "en", value: "Total Reach" },
  { namespace: "campaigns", key: "stats.totalReach", languageCode: "fr", value: "Portée Totale" },
  { namespace: "campaigns", key: "stats.conversionRate", languageCode: "en", value: "Conversion Rate" },
  { namespace: "campaigns", key: "stats.conversionRate", languageCode: "fr", value: "Taux de Conversion" },
  { namespace: "campaigns", key: "stats.totalRevenue", languageCode: "en", value: "Total Revenue" },
  { namespace: "campaigns", key: "stats.totalRevenue", languageCode: "fr", value: "Revenu Total" },
  { namespace: "campaigns", key: "stats.currentlyRunning", languageCode: "en", value: "Currently running" },
  { namespace: "campaigns", key: "stats.currentlyRunning", languageCode: "fr", value: "En cours d'exécution" },
  { namespace: "campaigns", key: "stats.usersReached", languageCode: "en", value: "Users reached" },
  { namespace: "campaigns", key: "stats.usersReached", languageCode: "fr", value: "Utilisateurs atteints" },
  { namespace: "campaigns", key: "stats.campaignConversions", languageCode: "en", value: "Campaign conversions" },
  { namespace: "campaigns", key: "stats.campaignConversions", languageCode: "fr", value: "Conversions de campagne" },
  { namespace: "campaigns", key: "stats.generatedRevenue", languageCode: "en", value: "Generated revenue" },
  { namespace: "campaigns", key: "stats.generatedRevenue", languageCode: "fr", value: "Revenu généré" },

  // Create/Edit Dialog (40 translations)
  { namespace: "campaigns", key: "dialog.createTitle", languageCode: "en", value: "Create Campaign" },
  { namespace: "campaigns", key: "dialog.createTitle", languageCode: "fr", value: "Créer une Campagne" },
  { namespace: "campaigns", key: "dialog.createDescription", languageCode: "en", value: "Launch a new promotional campaign" },
  { namespace: "campaigns", key: "dialog.createDescription", languageCode: "fr", value: "Lancer une nouvelle campagne promotionnelle" },
  { namespace: "campaigns", key: "dialog.editTitle", languageCode: "en", value: "Edit Campaign" },
  { namespace: "campaigns", key: "dialog.editTitle", languageCode: "fr", value: "Modifier la Campagne" },
  { namespace: "campaigns", key: "dialog.editDescription", languageCode: "en", value: "Update campaign details" },
  { namespace: "campaigns", key: "dialog.editDescription", languageCode: "fr", value: "Mettre à jour les détails de la campagne" },
  { namespace: "campaigns", key: "dialog.campaignName", languageCode: "en", value: "Campaign Name" },
  { namespace: "campaigns", key: "dialog.campaignName", languageCode: "fr", value: "Nom de la Campagne" },
  { namespace: "campaigns", key: "dialog.namePlaceholder", languageCode: "en", value: "Enter campaign name" },
  { namespace: "campaigns", key: "dialog.namePlaceholder", languageCode: "fr", value: "Entrez le nom de la campagne" },
  { namespace: "campaigns", key: "dialog.description", languageCode: "en", value: "Description" },
  { namespace: "campaigns", key: "dialog.description", languageCode: "fr", value: "Description" },
  { namespace: "campaigns", key: "dialog.descriptionPlaceholder", languageCode: "en", value: "Enter campaign description" },
  { namespace: "campaigns", key: "dialog.descriptionPlaceholder", languageCode: "fr", value: "Entrez la description de la campagne" },
  { namespace: "campaigns", key: "dialog.discountType", languageCode: "en", value: "Discount Type" },
  { namespace: "campaigns", key: "dialog.discountType", languageCode: "fr", value: "Type de Réduction" },
  { namespace: "campaigns", key: "dialog.percentage", languageCode: "en", value: "Percentage" },
  { namespace: "campaigns", key: "dialog.percentage", languageCode: "fr", value: "Pourcentage" },
  { namespace: "campaigns", key: "dialog.fixedAmount", languageCode: "en", value: "Fixed Amount" },
  { namespace: "campaigns", key: "dialog.fixedAmount", languageCode: "fr", value: "Montant Fixe" },
  { namespace: "campaigns", key: "dialog.discountValue", languageCode: "en", value: "Discount Value" },
  { namespace: "campaigns", key: "dialog.discountValue", languageCode: "fr", value: "Valeur de Réduction" },
  { namespace: "campaigns", key: "dialog.valuePlaceholder", languageCode: "en", value: "Enter discount value" },
  { namespace: "campaigns", key: "dialog.valuePlaceholder", languageCode: "fr", value: "Entrez la valeur de réduction" },
  { namespace: "campaigns", key: "dialog.startDate", languageCode: "en", value: "Start Date" },
  { namespace: "campaigns", key: "dialog.startDate", languageCode: "fr", value: "Date de Début" },
  { namespace: "campaigns", key: "dialog.endDate", languageCode: "en", value: "End Date" },
  { namespace: "campaigns", key: "dialog.endDate", languageCode: "fr", value: "Date de Fin" },
  { namespace: "campaigns", key: "dialog.targetAudience", languageCode: "en", value: "Target Audience" },
  { namespace: "campaigns", key: "dialog.targetAudience", languageCode: "fr", value: "Public Cible" },
  { namespace: "campaigns", key: "dialog.allUsers", languageCode: "en", value: "All Users" },
  { namespace: "campaigns", key: "dialog.allUsers", languageCode: "fr", value: "Tous les Utilisateurs" },
  { namespace: "campaigns", key: "dialog.newUsers", languageCode: "en", value: "New Users" },
  { namespace: "campaigns", key: "dialog.newUsers", languageCode: "fr", value: "Nouveaux Utilisateurs" },
  { namespace: "campaigns", key: "dialog.returningUsers", languageCode: "en", value: "Returning Users" },
  { namespace: "campaigns", key: "dialog.returningUsers", languageCode: "fr", value: "Utilisateurs Récurrents" },
  { namespace: "campaigns", key: "dialog.cancel", languageCode: "en", value: "Cancel" },
  { namespace: "campaigns", key: "dialog.cancel", languageCode: "fr", value: "Annuler" },
  { namespace: "campaigns", key: "dialog.create", languageCode: "en", value: "Create Campaign" },
  { namespace: "campaigns", key: "dialog.create", languageCode: "fr", value: "Créer la Campagne" },
  { namespace: "campaigns", key: "dialog.update", languageCode: "en", value: "Update Campaign" },
  { namespace: "campaigns", key: "dialog.update", languageCode: "fr", value: "Mettre à Jour" },

  // Filters (12 translations)
  { namespace: "campaigns", key: "filters.searchPlaceholder", languageCode: "en", value: "Search campaigns..." },
  { namespace: "campaigns", key: "filters.searchPlaceholder", languageCode: "fr", value: "Rechercher des campagnes..." },
  { namespace: "campaigns", key: "filters.allStatuses", languageCode: "en", value: "All Statuses" },
  { namespace: "campaigns", key: "filters.allStatuses", languageCode: "fr", value: "Tous les Statuts" },
  { namespace: "campaigns", key: "filters.active", languageCode: "en", value: "Active" },
  { namespace: "campaigns", key: "filters.active", languageCode: "fr", value: "Actif" },
  { namespace: "campaigns", key: "filters.scheduled", languageCode: "en", value: "Scheduled" },
  { namespace: "campaigns", key: "filters.scheduled", languageCode: "fr", value: "Planifié" },
  { namespace: "campaigns", key: "filters.ended", languageCode: "en", value: "Ended" },
  { namespace: "campaigns", key: "filters.ended", languageCode: "fr", value: "Terminé" },
  { namespace: "campaigns", key: "filters.paused", languageCode: "en", value: "Paused" },
  { namespace: "campaigns", key: "filters.paused", languageCode: "fr", value: "En Pause" },

  // Table (24 translations)
  { namespace: "campaigns", key: "table.campaign", languageCode: "en", value: "Campaign" },
  { namespace: "campaigns", key: "table.campaign", languageCode: "fr", value: "Campagne" },
  { namespace: "campaigns", key: "table.discount", languageCode: "en", value: "Discount" },
  { namespace: "campaigns", key: "table.discount", languageCode: "fr", value: "Réduction" },
  { namespace: "campaigns", key: "table.period", languageCode: "en", value: "Period" },
  { namespace: "campaigns", key: "table.period", languageCode: "fr", value: "Période" },
  { namespace: "campaigns", key: "table.reach", languageCode: "en", value: "Reach" },
  { namespace: "campaigns", key: "table.reach", languageCode: "fr", value: "Portée" },
  { namespace: "campaigns", key: "table.conversions", languageCode: "en", value: "Conversions" },
  { namespace: "campaigns", key: "table.conversions", languageCode: "fr", value: "Conversions" },
  { namespace: "campaigns", key: "table.revenue", languageCode: "en", value: "Revenue" },
  { namespace: "campaigns", key: "table.revenue", languageCode: "fr", value: "Revenu" },
  { namespace: "campaigns", key: "table.status", languageCode: "en", value: "Status" },
  { namespace: "campaigns", key: "table.status", languageCode: "fr", value: "Statut" },
  { namespace: "campaigns", key: "table.actions", languageCode: "en", value: "Actions" },
  { namespace: "campaigns", key: "table.actions", languageCode: "fr", value: "Actions" },
  { namespace: "campaigns", key: "table.edit", languageCode: "en", value: "Edit" },
  { namespace: "campaigns", key: "table.edit", languageCode: "fr", value: "Modifier" },
  { namespace: "campaigns", key: "table.delete", languageCode: "en", value: "Delete" },
  { namespace: "campaigns", key: "table.delete", languageCode: "fr", value: "Supprimer" },
  { namespace: "campaigns", key: "table.pause", languageCode: "en", value: "Pause" },
  { namespace: "campaigns", key: "table.pause", languageCode: "fr", value: "Mettre en Pause" },
  { namespace: "campaigns", key: "table.resume", languageCode: "en", value: "Resume" },
  { namespace: "campaigns", key: "table.resume", languageCode: "fr", value: "Reprendre" },

  // Toast Messages (10 translations)
  { namespace: "campaigns", key: "toast.createSuccess", languageCode: "en", value: "Campaign created successfully" },
  { namespace: "campaigns", key: "toast.createSuccess", languageCode: "fr", value: "Campagne créée avec succès" },
  { namespace: "campaigns", key: "toast.updateSuccess", languageCode: "en", value: "Campaign updated successfully" },
  { namespace: "campaigns", key: "toast.updateSuccess", languageCode: "fr", value: "Campagne mise à jour avec succès" },
  { namespace: "campaigns", key: "toast.deleteSuccess", languageCode: "en", value: "Campaign deleted successfully" },
  { namespace: "campaigns", key: "toast.deleteSuccess", languageCode: "fr", value: "Campagne supprimée avec succès" },
  { namespace: "campaigns", key: "toast.pauseSuccess", languageCode: "en", value: "Campaign paused successfully" },
  { namespace: "campaigns", key: "toast.pauseSuccess", languageCode: "fr", value: "Campagne mise en pause avec succès" },
  { namespace: "campaigns", key: "toast.resumeSuccess", languageCode: "en", value: "Campaign resumed successfully" },
  { namespace: "campaigns", key: "toast.resumeSuccess", languageCode: "fr", value: "Campagne reprise avec succès" },

  // Empty State (4 translations)
  { namespace: "campaigns", key: "empty.noCampaigns", languageCode: "en", value: "No campaigns found" },
  { namespace: "campaigns", key: "empty.noCampaigns", languageCode: "fr", value: "Aucune campagne trouvée" },
  { namespace: "campaigns", key: "empty.noCampaignsMessage", languageCode: "en", value: "Create your first campaign to start promoting" },
  { namespace: "campaigns", key: "empty.noCampaignsMessage", languageCode: "fr", value: "Créez votre première campagne pour commencer à promouvoir" },

  // ============================================================================
  // ANALYTICS DASHBOARD PAGE (analytics namespace) - ~82 translations
  // ============================================================================
  
  // Header (6 translations)
  { namespace: "analytics", key: "title", languageCode: "en", value: "Analytics Dashboard" },
  { namespace: "analytics", key: "title", languageCode: "fr", value: "Tableau de Bord Analytique" },
  { namespace: "analytics", key: "subtitle", languageCode: "en", value: "Comprehensive platform analytics and insights" },
  { namespace: "analytics", key: "subtitle", languageCode: "fr", value: "Analyses et insights complets de la plateforme" },
  { namespace: "analytics", key: "loading", languageCode: "en", value: "Loading analytics..." },
  { namespace: "analytics", key: "loading", languageCode: "fr", value: "Chargement des analyses..." },

  // Time Period Selector (10 translations)
  { namespace: "analytics", key: "period.today", languageCode: "en", value: "Today" },
  { namespace: "analytics", key: "period.today", languageCode: "fr", value: "Aujourd'hui" },
  { namespace: "analytics", key: "period.week", languageCode: "en", value: "This Week" },
  { namespace: "analytics", key: "period.week", languageCode: "fr", value: "Cette Semaine" },
  { namespace: "analytics", key: "period.month", languageCode: "en", value: "This Month" },
  { namespace: "analytics", key: "period.month", languageCode: "fr", value: "Ce Mois" },
  { namespace: "analytics", key: "period.quarter", languageCode: "en", value: "This Quarter" },
  { namespace: "analytics", key: "period.quarter", languageCode: "fr", value: "Ce Trimestre" },
  { namespace: "analytics", key: "period.year", languageCode: "en", value: "This Year" },
  { namespace: "analytics", key: "period.year", languageCode: "fr", value: "Cette Année" },

  // Overview Stats (18 translations)
  { namespace: "analytics", key: "stats.totalOrders", languageCode: "en", value: "Total Orders" },
  { namespace: "analytics", key: "stats.totalOrders", languageCode: "fr", value: "Total des Commandes" },
  { namespace: "analytics", key: "stats.totalRevenue", languageCode: "en", value: "Total Revenue" },
  { namespace: "analytics", key: "stats.totalRevenue", languageCode: "fr", value: "Revenu Total" },
  { namespace: "analytics", key: "stats.activeUsers", languageCode: "en", value: "Active Users" },
  { namespace: "analytics", key: "stats.activeUsers", languageCode: "fr", value: "Utilisateurs Actifs" },
  { namespace: "analytics", key: "stats.activeRiders", languageCode: "en", value: "Active Riders" },
  { namespace: "analytics", key: "stats.activeRiders", languageCode: "fr", value: "Livreurs Actifs" },
  { namespace: "analytics", key: "stats.ordersPlaced", languageCode: "en", value: "Orders placed" },
  { namespace: "analytics", key: "stats.ordersPlaced", languageCode: "fr", value: "Commandes passées" },
  { namespace: "analytics", key: "stats.revenueGenerated", languageCode: "en", value: "Revenue generated" },
  { namespace: "analytics", key: "stats.revenueGenerated", languageCode: "fr", value: "Revenu généré" },
  { namespace: "analytics", key: "stats.registeredUsers", languageCode: "en", value: "Registered users" },
  { namespace: "analytics", key: "stats.registeredUsers", languageCode: "fr", value: "Utilisateurs enregistrés" },
  { namespace: "analytics", key: "stats.availableRiders", languageCode: "en", value: "Available riders" },
  { namespace: "analytics", key: "stats.availableRiders", languageCode: "fr", value: "Livreurs disponibles" },
  { namespace: "analytics", key: "stats.fromLastPeriod", languageCode: "en", value: "from last period" },
  { namespace: "analytics", key: "stats.fromLastPeriod", languageCode: "fr", value: "de la dernière période" },

  // Charts (30 translations)
  { namespace: "analytics", key: "charts.orderTrends", languageCode: "en", value: "Order Trends" },
  { namespace: "analytics", key: "charts.orderTrends", languageCode: "fr", value: "Tendances des Commandes" },
  { namespace: "analytics", key: "charts.orderTrendsDescription", languageCode: "en", value: "Daily order volume over time" },
  { namespace: "analytics", key: "charts.orderTrendsDescription", languageCode: "fr", value: "Volume quotidien des commandes au fil du temps" },
  { namespace: "analytics", key: "charts.revenueAnalysis", languageCode: "en", value: "Revenue Analysis" },
  { namespace: "analytics", key: "charts.revenueAnalysis", languageCode: "fr", value: "Analyse des Revenus" },
  { namespace: "analytics", key: "charts.revenueDescription", languageCode: "en", value: "Revenue breakdown by category" },
  { namespace: "analytics", key: "charts.revenueDescription", languageCode: "fr", value: "Répartition des revenus par catégorie" },
  { namespace: "analytics", key: "charts.userGrowth", languageCode: "en", value: "User Growth" },
  { namespace: "analytics", key: "charts.userGrowth", languageCode: "fr", value: "Croissance des Utilisateurs" },
  { namespace: "analytics", key: "charts.userGrowthDescription", languageCode: "en", value: "New user registrations over time" },
  { namespace: "analytics", key: "charts.userGrowthDescription", languageCode: "fr", value: "Nouvelles inscriptions d'utilisateurs au fil du temps" },
  { namespace: "analytics", key: "charts.riderPerformance", languageCode: "en", value: "Rider Performance" },
  { namespace: "analytics", key: "charts.riderPerformance", languageCode: "fr", value: "Performance des Livreurs" },
  { namespace: "analytics", key: "charts.riderDescription", languageCode: "en", value: "Top performing riders by deliveries" },
  { namespace: "analytics", key: "charts.riderDescription", languageCode: "fr", value: "Meilleurs livreurs par nombre de livraisons" },
  { namespace: "analytics", key: "charts.orders", languageCode: "en", value: "Orders" },
  { namespace: "analytics", key: "charts.orders", languageCode: "fr", value: "Commandes" },
  { namespace: "analytics", key: "charts.revenue", languageCode: "en", value: "Revenue" },
  { namespace: "analytics", key: "charts.revenue", languageCode: "fr", value: "Revenu" },
  { namespace: "analytics", key: "charts.users", languageCode: "en", value: "Users" },
  { namespace: "analytics", key: "charts.users", languageCode: "fr", value: "Utilisateurs" },
  { namespace: "analytics", key: "charts.deliveries", languageCode: "en", value: "Deliveries" },
  { namespace: "analytics", key: "charts.deliveries", languageCode: "fr", value: "Livraisons" },
  { namespace: "analytics", key: "charts.date", languageCode: "en", value: "Date" },
  { namespace: "analytics", key: "charts.date", languageCode: "fr", value: "Date" },
  { namespace: "analytics", key: "charts.value", languageCode: "en", value: "Value" },
  { namespace: "analytics", key: "charts.value", languageCode: "fr", value: "Valeur" },

  // Empty State (4 translations)
  { namespace: "analytics", key: "empty.noData", languageCode: "en", value: "No data available" },
  { namespace: "analytics", key: "empty.noData", languageCode: "fr", value: "Aucune donnée disponible" },
  { namespace: "analytics", key: "empty.noDataMessage", languageCode: "en", value: "No analytics data for the selected period" },
  { namespace: "analytics", key: "empty.noDataMessage", languageCode: "fr", value: "Aucune donnée analytique pour la période sélectionnée" },

  // Additional common terms (14 translations)
  { namespace: "analytics", key: "common.export", languageCode: "en", value: "Export" },
  { namespace: "analytics", key: "common.export", languageCode: "fr", value: "Exporter" },
  { namespace: "analytics", key: "common.refresh", languageCode: "en", value: "Refresh" },
  { namespace: "analytics", key: "common.refresh", languageCode: "fr", value: "Actualiser" },
  { namespace: "analytics", key: "common.filter", languageCode: "en", value: "Filter" },
  { namespace: "analytics", key: "common.filter", languageCode: "fr", value: "Filtrer" },
  { namespace: "analytics", key: "common.download", languageCode: "en", value: "Download" },
  { namespace: "analytics", key: "common.download", languageCode: "fr", value: "Télécharger" },
  { namespace: "analytics", key: "common.viewDetails", languageCode: "en", value: "View Details" },
  { namespace: "analytics", key: "common.viewDetails", languageCode: "fr", value: "Voir les Détails" },
  { namespace: "analytics", key: "common.close", languageCode: "en", value: "Close" },
  { namespace: "analytics", key: "common.close", languageCode: "fr", value: "Fermer" },
];

async function seedCampaignsAnalyticsTranslations() {
  console.log(`\n🌍 Seeding Campaigns and Analytics translations...`);
  console.log(`   Total translations: ${campaignsAnalyticsTranslations.length}`);
  console.log(`   English: ${campaignsAnalyticsTranslations.filter(t => t.languageCode === "en").length}`);
  console.log(`   French: ${campaignsAnalyticsTranslations.filter(t => t.languageCode === "fr").length}`);
  console.log(`   Namespaces: campaigns, analytics\n`);

  const dbInstance = await getDb();
  if (!dbInstance) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  let successCount = 0;
  let errorCount = 0;

  for (const translation of campaignsAnalyticsTranslations) {
    try {
      await dbInstance.insert(translations).values(translation).onDuplicateKeyUpdate({
        set: { value: translation.value },
      });
      successCount++;
    } catch (error) {
      console.error(`❌ Error seeding ${translation.namespace}.${translation.key}:`, error);
      errorCount++;
    }
  }

  console.log(`\n✅ Campaigns and Analytics translations seeded successfully!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`\n📊 Breakdown by namespace:`);
  console.log(`   - campaigns: ${campaignsAnalyticsTranslations.filter(t => t.namespace === "campaigns").length} translations`);
  console.log(`   - analytics: ${campaignsAnalyticsTranslations.filter(t => t.namespace === "analytics").length} translations\n`);
  
  process.exit(0);
}

seedCampaignsAnalyticsTranslations().catch((error) => {
  console.error("❌ Fatal error seeding campaigns and analytics translations:", error);
  process.exit(1);
});
