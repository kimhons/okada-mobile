/**
 * Seed script for remaining 5 pages translations
 * Pages: Customer Support, Notifications Center, Activity Log, Campaigns, Analytics
 * Run with: pnpm tsx scripts/seed-remaining-translations.ts
 */

import { getDb } from "../server/db";
import { translations } from "../drizzle/schema";

const allTranslations = [
  // ============================================================================
  // CUSTOMER SUPPORT PAGE (support namespace) - 62 translations
  // ============================================================================
  
  // Header (6 translations)
  { namespace: "support", key: "title", languageCode: "en", value: "Customer Support" },
  { namespace: "support", key: "title", languageCode: "fr", value: "Support Client" },
  { namespace: "support", key: "subtitle", languageCode: "en", value: "Manage support tickets, track resolutions, and assist customers" },
  { namespace: "support", key: "subtitle", languageCode: "fr", value: "Gérer les tickets de support, suivre les résolutions et assister les clients" },
  { namespace: "support", key: "loading", languageCode: "en", value: "Loading support tickets..." },
  { namespace: "support", key: "loading", languageCode: "fr", value: "Chargement des tickets de support..." },

  // Stats Cards (16 translations)
  { namespace: "support", key: "stats.totalTickets", languageCode: "en", value: "Total Tickets" },
  { namespace: "support", key: "stats.totalTickets", languageCode: "fr", value: "Total des Tickets" },
  { namespace: "support", key: "stats.openTickets", languageCode: "en", value: "Open Tickets" },
  { namespace: "support", key: "stats.openTickets", languageCode: "fr", value: "Tickets Ouverts" },
  { namespace: "support", key: "stats.inProgress", languageCode: "en", value: "In Progress" },
  { namespace: "support", key: "stats.inProgress", languageCode: "fr", value: "En Cours" },
  { namespace: "support", key: "stats.resolved", languageCode: "en", value: "Resolved" },
  { namespace: "support", key: "stats.resolved", languageCode: "fr", value: "Résolus" },
  { namespace: "support", key: "stats.allTickets", languageCode: "en", value: "All support tickets" },
  { namespace: "support", key: "stats.allTickets", languageCode: "fr", value: "Tous les tickets de support" },
  { namespace: "support", key: "stats.needsAttention", languageCode: "en", value: "Needs attention" },
  { namespace: "support", key: "stats.needsAttention", languageCode: "fr", value: "Nécessite une attention" },
  { namespace: "support", key: "stats.beingHandled", languageCode: "en", value: "Being handled" },
  { namespace: "support", key: "stats.beingHandled", languageCode: "fr", value: "En traitement" },
  { namespace: "support", key: "stats.successfullyResolved", languageCode: "en", value: "Successfully resolved" },
  { namespace: "support", key: "stats.successfullyResolved", languageCode: "fr", value: "Résolus avec succès" },

  // Filters (20 translations)
  { namespace: "support", key: "filters.searchPlaceholder", languageCode: "en", value: "Search tickets..." },
  { namespace: "support", key: "filters.searchPlaceholder", languageCode: "fr", value: "Rechercher des tickets..." },
  { namespace: "support", key: "filters.allStatuses", languageCode: "en", value: "All Statuses" },
  { namespace: "support", key: "filters.allStatuses", languageCode: "fr", value: "Tous les Statuts" },
  { namespace: "support", key: "filters.open", languageCode: "en", value: "Open" },
  { namespace: "support", key: "filters.open", languageCode: "fr", value: "Ouvert" },
  { namespace: "support", key: "filters.inProgress", languageCode: "en", value: "In Progress" },
  { namespace: "support", key: "filters.inProgress", languageCode: "fr", value: "En Cours" },
  { namespace: "support", key: "filters.resolved", languageCode: "en", value: "Resolved" },
  { namespace: "support", key: "filters.resolved", languageCode: "fr", value: "Résolu" },
  { namespace: "support", key: "filters.closed", languageCode: "en", value: "Closed" },
  { namespace: "support", key: "filters.closed", languageCode: "fr", value: "Fermé" },
  { namespace: "support", key: "filters.allPriorities", languageCode: "en", value: "All Priorities" },
  { namespace: "support", key: "filters.allPriorities", languageCode: "fr", value: "Toutes les Priorités" },
  { namespace: "support", key: "filters.high", languageCode: "en", value: "High" },
  { namespace: "support", key: "filters.high", languageCode: "fr", value: "Haute" },
  { namespace: "support", key: "filters.medium", languageCode: "en", value: "Medium" },
  { namespace: "support", key: "filters.medium", languageCode: "fr", value: "Moyenne" },
  { namespace: "support", key: "filters.low", languageCode: "en", value: "Low" },
  { namespace: "support", key: "filters.low", languageCode: "fr", value: "Basse" },

  // Table (16 translations)
  { namespace: "support", key: "table.ticketId", languageCode: "en", value: "Ticket ID" },
  { namespace: "support", key: "table.ticketId", languageCode: "fr", value: "ID du Ticket" },
  { namespace: "support", key: "table.customer", languageCode: "en", value: "Customer" },
  { namespace: "support", key: "table.customer", languageCode: "fr", value: "Client" },
  { namespace: "support", key: "table.subject", languageCode: "en", value: "Subject" },
  { namespace: "support", key: "table.subject", languageCode: "fr", value: "Sujet" },
  { namespace: "support", key: "table.priority", languageCode: "en", value: "Priority" },
  { namespace: "support", key: "table.priority", languageCode: "fr", value: "Priorité" },
  { namespace: "support", key: "table.status", languageCode: "en", value: "Status" },
  { namespace: "support", key: "table.status", languageCode: "fr", value: "Statut" },
  { namespace: "support", key: "table.created", languageCode: "en", value: "Created" },
  { namespace: "support", key: "table.created", languageCode: "fr", value: "Créé" },
  { namespace: "support", key: "table.actions", languageCode: "en", value: "Actions" },
  { namespace: "support", key: "table.actions", languageCode: "fr", value: "Actions" },
  { namespace: "support", key: "table.view", languageCode: "en", value: "View" },
  { namespace: "support", key: "table.view", languageCode: "fr", value: "Voir" },

  // Empty State (4 translations)
  { namespace: "support", key: "empty.noTickets", languageCode: "en", value: "No support tickets found" },
  { namespace: "support", key: "empty.noTickets", languageCode: "fr", value: "Aucun ticket de support trouvé" },
  { namespace: "support", key: "empty.noTicketsMessage", languageCode: "en", value: "No tickets match your current filters" },
  { namespace: "support", key: "empty.noTicketsMessage", languageCode: "fr", value: "Aucun ticket ne correspond à vos filtres actuels" },

  // ============================================================================
  // NOTIFICATIONS CENTER PAGE (notifications namespace) - 68 translations
  // ============================================================================
  
  // Header (8 translations)
  { namespace: "notifications", key: "title", languageCode: "en", value: "Notifications Center" },
  { namespace: "notifications", key: "title", languageCode: "fr", value: "Centre de Notifications" },
  { namespace: "notifications", key: "subtitle", languageCode: "en", value: "Send notifications to users, riders, and sellers" },
  { namespace: "notifications", key: "subtitle", languageCode: "fr", value: "Envoyer des notifications aux utilisateurs, livreurs et vendeurs" },
  { namespace: "notifications", key: "compose", languageCode: "en", value: "Compose Notification" },
  { namespace: "notifications", key: "compose", languageCode: "fr", value: "Composer une Notification" },
  { namespace: "notifications", key: "loading", languageCode: "en", value: "Loading notifications..." },
  { namespace: "notifications", key: "loading", languageCode: "fr", value: "Chargement des notifications..." },

  // Stats Cards (16 translations)
  { namespace: "notifications", key: "stats.totalSent", languageCode: "en", value: "Total Sent" },
  { namespace: "notifications", key: "stats.totalSent", languageCode: "fr", value: "Total Envoyé" },
  { namespace: "notifications", key: "stats.delivered", languageCode: "en", value: "Delivered" },
  { namespace: "notifications", key: "stats.delivered", languageCode: "fr", value: "Livré" },
  { namespace: "notifications", key: "stats.pending", languageCode: "en", value: "Pending" },
  { namespace: "notifications", key: "stats.pending", languageCode: "fr", value: "En Attente" },
  { namespace: "notifications", key: "stats.failed", languageCode: "en", value: "Failed" },
  { namespace: "notifications", key: "stats.failed", languageCode: "fr", value: "Échoué" },
  { namespace: "notifications", key: "stats.allNotifications", languageCode: "en", value: "All notifications sent" },
  { namespace: "notifications", key: "stats.allNotifications", languageCode: "fr", value: "Toutes les notifications envoyées" },
  { namespace: "notifications", key: "stats.successfullyDelivered", languageCode: "en", value: "Successfully delivered" },
  { namespace: "notifications", key: "stats.successfullyDelivered", languageCode: "fr", value: "Livrées avec succès" },
  { namespace: "notifications", key: "stats.awaitingDelivery", languageCode: "en", value: "Awaiting delivery" },
  { namespace: "notifications", key: "stats.awaitingDelivery", languageCode: "fr", value: "En attente de livraison" },
  { namespace: "notifications", key: "stats.deliveryFailed", languageCode: "en", value: "Delivery failed" },
  { namespace: "notifications", key: "stats.deliveryFailed", languageCode: "fr", value: "Échec de livraison" },

  // Compose Dialog (24 translations)
  { namespace: "notifications", key: "dialog.composeTitle", languageCode: "en", value: "Compose Notification" },
  { namespace: "notifications", key: "dialog.composeTitle", languageCode: "fr", value: "Composer une Notification" },
  { namespace: "notifications", key: "dialog.composeDescription", languageCode: "en", value: "Send a notification to specific user groups" },
  { namespace: "notifications", key: "dialog.composeDescription", languageCode: "fr", value: "Envoyer une notification à des groupes d'utilisateurs spécifiques" },
  { namespace: "notifications", key: "dialog.notificationTitle", languageCode: "en", value: "Title" },
  { namespace: "notifications", key: "dialog.notificationTitle", languageCode: "fr", value: "Titre" },
  { namespace: "notifications", key: "dialog.titlePlaceholder", languageCode: "en", value: "Enter notification title" },
  { namespace: "notifications", key: "dialog.titlePlaceholder", languageCode: "fr", value: "Entrez le titre de la notification" },
  { namespace: "notifications", key: "dialog.message", languageCode: "en", value: "Message" },
  { namespace: "notifications", key: "dialog.message", languageCode: "fr", value: "Message" },
  { namespace: "notifications", key: "dialog.messagePlaceholder", languageCode: "en", value: "Enter notification message" },
  { namespace: "notifications", key: "dialog.messagePlaceholder", languageCode: "fr", value: "Entrez le message de notification" },
  { namespace: "notifications", key: "dialog.targetAudience", languageCode: "en", value: "Target Audience" },
  { namespace: "notifications", key: "dialog.targetAudience", languageCode: "fr", value: "Public Cible" },
  { namespace: "notifications", key: "dialog.allUsers", languageCode: "en", value: "All Users" },
  { namespace: "notifications", key: "dialog.allUsers", languageCode: "fr", value: "Tous les Utilisateurs" },
  { namespace: "notifications", key: "dialog.customers", languageCode: "en", value: "Customers" },
  { namespace: "notifications", key: "dialog.customers", languageCode: "fr", value: "Clients" },
  { namespace: "notifications", key: "dialog.riders", languageCode: "en", value: "Riders" },
  { namespace: "notifications", key: "dialog.riders", languageCode: "fr", value: "Livreurs" },
  { namespace: "notifications", key: "dialog.sellers", languageCode: "en", value: "Sellers" },
  { namespace: "notifications", key: "dialog.sellers", languageCode: "fr", value: "Vendeurs" },
  { namespace: "notifications", key: "dialog.cancel", languageCode: "en", value: "Cancel" },
  { namespace: "notifications", key: "dialog.cancel", languageCode: "fr", value: "Annuler" },
  { namespace: "notifications", key: "dialog.send", languageCode: "en", value: "Send Notification" },
  { namespace: "notifications", key: "dialog.send", languageCode: "fr", value: "Envoyer la Notification" },

  // Table (14 translations)
  { namespace: "notifications", key: "table.title", languageCode: "en", value: "Title" },
  { namespace: "notifications", key: "table.title", languageCode: "fr", value: "Titre" },
  { namespace: "notifications", key: "table.message", languageCode: "en", value: "Message" },
  { namespace: "notifications", key: "table.message", languageCode: "fr", value: "Message" },
  { namespace: "notifications", key: "table.audience", languageCode: "en", value: "Audience" },
  { namespace: "notifications", key: "table.audience", languageCode: "fr", value: "Public" },
  { namespace: "notifications", key: "table.status", languageCode: "en", value: "Status" },
  { namespace: "notifications", key: "table.status", languageCode: "fr", value: "Statut" },
  { namespace: "notifications", key: "table.sentAt", languageCode: "en", value: "Sent At" },
  { namespace: "notifications", key: "table.sentAt", languageCode: "fr", value: "Envoyé à" },
  { namespace: "notifications", key: "table.deliveryRate", languageCode: "en", value: "Delivery Rate" },
  { namespace: "notifications", key: "table.deliveryRate", languageCode: "fr", value: "Taux de Livraison" },

  // Toast Messages (6 translations)
  { namespace: "notifications", key: "toast.sendSuccess", languageCode: "en", value: "Notification sent successfully" },
  { namespace: "notifications", key: "toast.sendSuccess", languageCode: "fr", value: "Notification envoyée avec succès" },
  { namespace: "notifications", key: "toast.sendError", languageCode: "en", value: "Failed to send notification" },
  { namespace: "notifications", key: "toast.sendError", languageCode: "fr", value: "Échec de l'envoi de la notification" },

  // ============================================================================
  // ACTIVITY LOG PAGE (activity namespace) - 58 translations
  // ============================================================================
  
  // Header (6 translations)
  { namespace: "activity", key: "title", languageCode: "en", value: "Activity Log" },
  { namespace: "activity", key: "title", languageCode: "fr", value: "Journal d'Activité" },
  { namespace: "activity", key: "subtitle", languageCode: "en", value: "Track all admin actions with timestamps for security auditing" },
  { namespace: "activity", key: "subtitle", languageCode: "fr", value: "Suivre toutes les actions administratives avec horodatage pour l'audit de sécurité" },
  { namespace: "activity", key: "loading", languageCode: "en", value: "Loading activity log..." },
  { namespace: "activity", key: "loading", languageCode: "fr", value: "Chargement du journal d'activité..." },

  // Stats Cards (12 translations)
  { namespace: "activity", key: "stats.totalActivities", languageCode: "en", value: "Total Activities" },
  { namespace: "activity", key: "stats.totalActivities", languageCode: "fr", value: "Activités Totales" },
  { namespace: "activity", key: "stats.todaysActivities", languageCode: "en", value: "Today's Activities" },
  { namespace: "activity", key: "stats.todaysActivities", languageCode: "fr", value: "Activités d'Aujourd'hui" },
  { namespace: "activity", key: "stats.activeAdmins", languageCode: "en", value: "Active Admins" },
  { namespace: "activity", key: "stats.activeAdmins", languageCode: "fr", value: "Administrateurs Actifs" },
  { namespace: "activity", key: "stats.allRecorded", languageCode: "en", value: "All recorded actions" },
  { namespace: "activity", key: "stats.allRecorded", languageCode: "fr", value: "Toutes les actions enregistrées" },
  { namespace: "activity", key: "stats.performedToday", languageCode: "en", value: "Actions performed today" },
  { namespace: "activity", key: "stats.performedToday", languageCode: "fr", value: "Actions effectuées aujourd'hui" },
  { namespace: "activity", key: "stats.uniqueAdmins", languageCode: "en", value: "Unique administrators" },
  { namespace: "activity", key: "stats.uniqueAdmins", languageCode: "fr", value: "Administrateurs uniques" },

  // Filters (16 translations)
  { namespace: "activity", key: "filters.searchPlaceholder", languageCode: "en", value: "Search activities..." },
  { namespace: "activity", key: "filters.searchPlaceholder", languageCode: "fr", value: "Rechercher des activités..." },
  { namespace: "activity", key: "filters.filterByAction", languageCode: "en", value: "Filter by action" },
  { namespace: "activity", key: "filters.filterByAction", languageCode: "fr", value: "Filtrer par action" },
  { namespace: "activity", key: "filters.allActions", languageCode: "en", value: "All Actions" },
  { namespace: "activity", key: "filters.allActions", languageCode: "fr", value: "Toutes les Actions" },
  { namespace: "activity", key: "filters.createActions", languageCode: "en", value: "Create Actions" },
  { namespace: "activity", key: "filters.createActions", languageCode: "fr", value: "Actions de Création" },
  { namespace: "activity", key: "filters.updateActions", languageCode: "en", value: "Update Actions" },
  { namespace: "activity", key: "filters.updateActions", languageCode: "fr", value: "Actions de Mise à Jour" },
  { namespace: "activity", key: "filters.deleteActions", languageCode: "en", value: "Delete Actions" },
  { namespace: "activity", key: "filters.deleteActions", languageCode: "fr", value: "Actions de Suppression" },
  { namespace: "activity", key: "filters.sendActions", languageCode: "en", value: "Send Actions" },
  { namespace: "activity", key: "filters.sendActions", languageCode: "fr", value: "Actions d'Envoi" },

  // Table (14 translations)
  { namespace: "activity", key: "table.admin", languageCode: "en", value: "Admin" },
  { namespace: "activity", key: "table.admin", languageCode: "fr", value: "Administrateur" },
  { namespace: "activity", key: "table.action", languageCode: "en", value: "Action" },
  { namespace: "activity", key: "table.action", languageCode: "fr", value: "Action" },
  { namespace: "activity", key: "table.entity", languageCode: "en", value: "Entity" },
  { namespace: "activity", key: "table.entity", languageCode: "fr", value: "Entité" },
  { namespace: "activity", key: "table.details", languageCode: "en", value: "Details" },
  { namespace: "activity", key: "table.details", languageCode: "fr", value: "Détails" },
  { namespace: "activity", key: "table.ipAddress", languageCode: "en", value: "IP Address" },
  { namespace: "activity", key: "table.ipAddress", languageCode: "fr", value: "Adresse IP" },
  { namespace: "activity", key: "table.timestamp", languageCode: "en", value: "Timestamp" },
  { namespace: "activity", key: "table.timestamp", languageCode: "fr", value: "Horodatage" },

  // Empty State (4 translations)
  { namespace: "activity", key: "empty.noActivities", languageCode: "en", value: "No activities found" },
  { namespace: "activity", key: "empty.noActivities", languageCode: "fr", value: "Aucune activité trouvée" },
  { namespace: "activity", key: "empty.noActivitiesMessage", languageCode: "en", value: "No activities match your search criteria" },
  { namespace: "activity", key: "empty.noActivitiesMessage", languageCode: "fr", value: "Aucune activité ne correspond à vos critères de recherche" },

  // Note: Campaigns and Analytics translations will be added in a separate seed script
  // due to their larger size (114 + 82 = 196 translations)
];

async function seedRemainingTranslations() {
  console.log(`\n🌍 Seeding remaining page translations...`);
  console.log(`   Total translations: ${allTranslations.length}`);
  console.log(`   English: ${allTranslations.filter(t => t.languageCode === "en").length}`);
  console.log(`   French: ${allTranslations.filter(t => t.languageCode === "fr").length}`);
  console.log(`   Namespaces: support, notifications, activity\n`);

  const dbInstance = await getDb();
  if (!dbInstance) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  let successCount = 0;
  let errorCount = 0;

  for (const translation of allTranslations) {
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

  console.log(`\n✅ Remaining translations seeded successfully!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`\n📊 Breakdown by namespace:`);
  console.log(`   - support: ${allTranslations.filter(t => t.namespace === "support").length} translations`);
  console.log(`   - notifications: ${allTranslations.filter(t => t.namespace === "notifications").length} translations`);
  console.log(`   - activity: ${allTranslations.filter(t => t.namespace === "activity").length} translations\n`);
  
  process.exit(0);
}

seedRemainingTranslations().catch((error) => {
  console.error("❌ Fatal error seeding remaining translations:", error);
  process.exit(1);
});
