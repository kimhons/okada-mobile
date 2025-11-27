import { drizzle } from "drizzle-orm/mysql2";
import { languages, translations } from "../drizzle/schema";

/**
 * Seed script for initial translations
 * Populates English and French translations for the Okada platform
 * Critical for Cameroon market (60% French-speaking users)
 */

const db = drizzle(process.env.DATABASE_URL!);

async function seedTranslations() {
  console.log("🌍 Seeding translations...");

  // Step 1: Seed languages
  console.log("📝 Adding languages...");
  try {
    await db.insert(languages).values([
      {
        code: "en",
        name: "English",
        nativeName: "English",
        isRTL: false,
        isActive: true,
        isDefault: true,
      },
      {
        code: "fr",
        name: "French",
        nativeName: "Français",
        isRTL: false,
        isActive: true,
        isDefault: false,
      },
    ]);
    console.log("✅ Languages added successfully");
  } catch (error) {
    console.log("⚠️  Languages already exist, skipping...");
  }

  // Step 2: Seed translations
  console.log("📝 Adding translations...");
  
  const translationData = [
    // Common namespace
    { languageCode: "en", namespace: "common", key: "welcome", value: "Welcome", context: "General greeting" },
    { languageCode: "fr", namespace: "common", key: "welcome", value: "Bienvenue", context: "General greeting" },
    { languageCode: "en", namespace: "common", key: "loading", value: "Loading...", context: "Loading indicator" },
    { languageCode: "fr", namespace: "common", key: "loading", value: "Chargement...", context: "Loading indicator" },
    { languageCode: "en", namespace: "common", key: "error", value: "Error", context: "Error message" },
    { languageCode: "fr", namespace: "common", key: "error", value: "Erreur", context: "Error message" },
    { languageCode: "en", namespace: "common", key: "success", value: "Success", context: "Success message" },
    { languageCode: "fr", namespace: "common", key: "success", value: "Succès", context: "Success message" },
    { languageCode: "en", namespace: "common", key: "save", value: "Save", context: "Save button" },
    { languageCode: "fr", namespace: "common", key: "save", value: "Enregistrer", context: "Save button" },
    { languageCode: "en", namespace: "common", key: "cancel", value: "Cancel", context: "Cancel button" },
    { languageCode: "fr", namespace: "common", key: "cancel", value: "Annuler", context: "Cancel button" },
    { languageCode: "en", namespace: "common", key: "delete", value: "Delete", context: "Delete button" },
    { languageCode: "fr", namespace: "common", key: "delete", value: "Supprimer", context: "Delete button" },
    { languageCode: "en", namespace: "common", key: "edit", value: "Edit", context: "Edit button" },
    { languageCode: "fr", namespace: "common", key: "edit", value: "Modifier", context: "Edit button" },
    { languageCode: "en", namespace: "common", key: "create", value: "Create", context: "Create button" },
    { languageCode: "fr", namespace: "common", key: "create", value: "Créer", context: "Create button" },
    { languageCode: "en", namespace: "common", key: "search", value: "Search", context: "Search placeholder" },
    { languageCode: "fr", namespace: "common", key: "search", value: "Rechercher", context: "Search placeholder" },
    { languageCode: "en", namespace: "common", key: "filter", value: "Filter", context: "Filter button" },
    { languageCode: "fr", namespace: "common", key: "filter", value: "Filtrer", context: "Filter button" },
    { languageCode: "en", namespace: "common", key: "export", value: "Export", context: "Export button" },
    { languageCode: "fr", namespace: "common", key: "export", value: "Exporter", context: "Export button" },
    { languageCode: "en", namespace: "common", key: "import", value: "Import", context: "Import button" },
    { languageCode: "fr", namespace: "common", key: "import", value: "Importer", context: "Import button" },
    { languageCode: "en", namespace: "common", key: "refresh", value: "Refresh", context: "Refresh button" },
    { languageCode: "fr", namespace: "common", key: "refresh", value: "Actualiser", context: "Refresh button" },
    { languageCode: "en", namespace: "common", key: "back", value: "Back", context: "Back button" },
    { languageCode: "fr", namespace: "common", key: "back", value: "Retour", context: "Back button" },
    { languageCode: "en", namespace: "common", key: "next", value: "Next", context: "Next button" },
    { languageCode: "fr", namespace: "common", key: "next", value: "Suivant", context: "Next button" },
    { languageCode: "en", namespace: "common", key: "previous", value: "Previous", context: "Previous button" },
    { languageCode: "fr", namespace: "common", key: "previous", value: "Précédent", context: "Previous button" },
    { languageCode: "en", namespace: "common", key: "submit", value: "Submit", context: "Submit button" },
    { languageCode: "fr", namespace: "common", key: "submit", value: "Soumettre", context: "Submit button" },
    { languageCode: "en", namespace: "common", key: "confirm", value: "Confirm", context: "Confirm button" },
    { languageCode: "fr", namespace: "common", key: "confirm", value: "Confirmer", context: "Confirm button" },
    { languageCode: "en", namespace: "common", key: "yes", value: "Yes", context: "Yes option" },
    { languageCode: "fr", namespace: "common", key: "yes", value: "Oui", context: "Yes option" },
    { languageCode: "en", namespace: "common", key: "no", value: "No", context: "No option" },
    { languageCode: "fr", namespace: "common", key: "no", value: "Non", context: "No option" },

    // Dashboard namespace
    { languageCode: "en", namespace: "dashboard", key: "title", value: "Dashboard", context: "Dashboard page title" },
    { languageCode: "fr", namespace: "dashboard", key: "title", value: "Tableau de bord", context: "Dashboard page title" },
    { languageCode: "en", namespace: "dashboard", key: "overview", value: "Overview", context: "Overview section" },
    { languageCode: "fr", namespace: "dashboard", key: "overview", value: "Vue d'ensemble", context: "Overview section" },
    { languageCode: "en", namespace: "dashboard", key: "analytics", value: "Analytics", context: "Analytics section" },
    { languageCode: "fr", namespace: "dashboard", key: "analytics", value: "Analytique", context: "Analytics section" },
    { languageCode: "en", namespace: "dashboard", key: "reports", value: "Reports", context: "Reports section" },
    { languageCode: "fr", namespace: "dashboard", key: "reports", value: "Rapports", context: "Reports section" },
    { languageCode: "en", namespace: "dashboard", key: "total_orders", value: "Total Orders", context: "Total orders metric" },
    { languageCode: "fr", namespace: "dashboard", key: "total_orders", value: "Total des commandes", context: "Total orders metric" },
    { languageCode: "en", namespace: "dashboard", key: "active_users", value: "Active Users", context: "Active users metric" },
    { languageCode: "fr", namespace: "dashboard", key: "active_users", value: "Utilisateurs actifs", context: "Active users metric" },
    { languageCode: "en", namespace: "dashboard", key: "active_riders", value: "Active Riders", context: "Active riders metric" },
    { languageCode: "fr", namespace: "dashboard", key: "active_riders", value: "Livreurs actifs", context: "Active riders metric" },
    { languageCode: "en", namespace: "dashboard", key: "total_revenue", value: "Total Revenue", context: "Total revenue metric" },
    { languageCode: "fr", namespace: "dashboard", key: "total_revenue", value: "Revenu total", context: "Total revenue metric" },
    { languageCode: "en", namespace: "dashboard", key: "welcome_message", value: "Welcome to Okada Admin Dashboard", context: "Dashboard welcome message" },
    { languageCode: "fr", namespace: "dashboard", key: "welcome_message", value: "Bienvenue sur le tableau de bord administrateur Okada", context: "Dashboard welcome message" },
    { languageCode: "en", namespace: "dashboard", key: "from_last_month", value: "from last month", context: "Comparison period" },
    { languageCode: "fr", namespace: "dashboard", key: "from_last_month", value: "par rapport au mois dernier", context: "Comparison period" },
    { languageCode: "en", namespace: "dashboard", key: "recent_orders", value: "Recent Orders", context: "Recent orders section title" },
    { languageCode: "fr", namespace: "dashboard", key: "recent_orders", value: "Commandes récentes", context: "Recent orders section title" },
    { languageCode: "en", namespace: "dashboard", key: "recent_orders_description", value: "Latest orders from customers", context: "Recent orders description" },
    { languageCode: "fr", namespace: "dashboard", key: "recent_orders_description", value: "Dernières commandes des clients", context: "Recent orders description" },
    { languageCode: "en", namespace: "dashboard", key: "manage_products", value: "Manage Products", context: "Manage products action" },
    { languageCode: "fr", namespace: "dashboard", key: "manage_products", value: "Gérer les produits", context: "Manage products action" },
    { languageCode: "en", namespace: "dashboard", key: "manage_products_description", value: "Add or edit product listings", context: "Manage products description" },
    { languageCode: "fr", namespace: "dashboard", key: "manage_products_description", value: "Ajouter ou modifier les listes de produits", context: "Manage products description" },
    { languageCode: "en", namespace: "dashboard", key: "approve_riders", value: "Approve Riders", context: "Approve riders action" },
    { languageCode: "fr", namespace: "dashboard", key: "approve_riders", value: "Approuver les livreurs", context: "Approve riders action" },
    { languageCode: "en", namespace: "dashboard", key: "approve_riders_description", value: "Review pending rider applications", context: "Approve riders description" },
    { languageCode: "fr", namespace: "dashboard", key: "approve_riders_description", value: "Examiner les candidatures de livreurs en attente", context: "Approve riders description" },
    { languageCode: "en", namespace: "dashboard", key: "view_analytics", value: "View Analytics", context: "View analytics action" },
    { languageCode: "fr", namespace: "dashboard", key: "view_analytics", value: "Voir les analyses", context: "View analytics action" },
    { languageCode: "en", namespace: "dashboard", key: "view_analytics_description", value: "Check performance metrics", context: "View analytics description" },
    { languageCode: "fr", namespace: "dashboard", key: "view_analytics_description", value: "Vérifier les métriques de performance", context: "View analytics description" },

    // Orders namespace
    { languageCode: "en", namespace: "orders", key: "title", value: "Orders", context: "Orders page title" },
    { languageCode: "fr", namespace: "orders", key: "title", value: "Commandes", context: "Orders page title" },
    { languageCode: "en", namespace: "orders", key: "order_id", value: "Order ID", context: "Order ID label" },
    { languageCode: "fr", namespace: "orders", key: "order_id", value: "ID de commande", context: "Order ID label" },
    { languageCode: "en", namespace: "orders", key: "customer", value: "Customer", context: "Customer label" },
    { languageCode: "fr", namespace: "orders", key: "customer", value: "Client", context: "Customer label" },
    { languageCode: "en", namespace: "orders", key: "status", value: "Status", context: "Status label" },
    { languageCode: "fr", namespace: "orders", key: "status", value: "Statut", context: "Status label" },
    { languageCode: "en", namespace: "orders", key: "total", value: "Total", context: "Total label" },
    { languageCode: "fr", namespace: "orders", key: "total", value: "Total", context: "Total label" },
    { languageCode: "en", namespace: "orders", key: "pending", value: "Pending", context: "Pending status" },
    { languageCode: "fr", namespace: "orders", key: "pending", value: "En attente", context: "Pending status" },
    { languageCode: "en", namespace: "orders", key: "confirmed", value: "Confirmed", context: "Confirmed status" },
    { languageCode: "fr", namespace: "orders", key: "confirmed", value: "Confirmé", context: "Confirmed status" },
    { languageCode: "en", namespace: "orders", key: "in_transit", value: "In Transit", context: "In transit status" },
    { languageCode: "fr", namespace: "orders", key: "in_transit", value: "En transit", context: "In transit status" },
    { languageCode: "en", namespace: "orders", key: "delivered", value: "Delivered", context: "Delivered status" },
    { languageCode: "fr", namespace: "orders", key: "delivered", value: "Livré", context: "Delivered status" },
    { languageCode: "en", namespace: "orders", key: "status_delivered", value: "delivered", context: "Delivered status lowercase" },
    { languageCode: "fr", namespace: "orders", key: "status_delivered", value: "livré", context: "Delivered status lowercase" },
    { languageCode: "en", namespace: "orders", key: "status_in_transit", value: "in transit", context: "In transit status lowercase" },
    { languageCode: "fr", namespace: "orders", key: "status_in_transit", value: "en transit", context: "In transit status lowercase" },
    { languageCode: "en", namespace: "orders", key: "status_quality_verification", value: "quality verification", context: "Quality verification status" },
    { languageCode: "fr", namespace: "orders", key: "status_quality_verification", value: "vérification qualité", context: "Quality verification status" },
    { languageCode: "en", namespace: "orders", key: "status_confirmed", value: "confirmed", context: "Confirmed status lowercase" },
    { languageCode: "fr", namespace: "orders", key: "status_confirmed", value: "confirmé", context: "Confirmed status lowercase" },
    { languageCode: "en", namespace: "orders", key: "status_pending", value: "pending", context: "Pending status lowercase" },
    { languageCode: "fr", namespace: "orders", key: "status_pending", value: "en attente", context: "Pending status lowercase" },

    // Products namespace
    { languageCode: "en", namespace: "products", key: "title", value: "Products", context: "Products page title" },
    { languageCode: "fr", namespace: "products", key: "title", value: "Produits", context: "Products page title" },
    { languageCode: "en", namespace: "products", key: "product_name", value: "Product Name", context: "Product name label" },
    { languageCode: "fr", namespace: "products", key: "product_name", value: "Nom du produit", context: "Product name label" },
    { languageCode: "en", namespace: "products", key: "category", value: "Category", context: "Category label" },
    { languageCode: "fr", namespace: "products", key: "category", value: "Catégorie", context: "Category label" },
    { languageCode: "en", namespace: "products", key: "price", value: "Price", context: "Price label" },
    { languageCode: "fr", namespace: "products", key: "price", value: "Prix", context: "Price label" },
    { languageCode: "en", namespace: "products", key: "stock", value: "Stock", context: "Stock label" },
    { languageCode: "fr", namespace: "products", key: "stock", value: "Stock", context: "Stock label" },
    { languageCode: "en", namespace: "products", key: "in_stock", value: "In Stock", context: "In stock status" },
    { languageCode: "fr", namespace: "products", key: "in_stock", value: "En stock", context: "In stock status" },
    { languageCode: "en", namespace: "products", key: "out_of_stock", value: "Out of Stock", context: "Out of stock status" },
    { languageCode: "fr", namespace: "products", key: "out_of_stock", value: "Rupture de stock", context: "Out of stock status" },

    // Users namespace
    { languageCode: "en", namespace: "users", key: "title", value: "Users", context: "Users page title" },
    { languageCode: "fr", namespace: "users", key: "title", value: "Utilisateurs", context: "Users page title" },
    { languageCode: "en", namespace: "users", key: "name", value: "Name", context: "Name label" },
    { languageCode: "fr", namespace: "users", key: "name", value: "Nom", context: "Name label" },
    { languageCode: "en", namespace: "users", key: "email", value: "Email", context: "Email label" },
    { languageCode: "fr", namespace: "users", key: "email", value: "Email", context: "Email label" },
    { languageCode: "en", namespace: "users", key: "phone", value: "Phone", context: "Phone label" },
    { languageCode: "fr", namespace: "users", key: "phone", value: "Téléphone", context: "Phone label" },
    { languageCode: "en", namespace: "users", key: "role", value: "Role", context: "Role label" },
    { languageCode: "fr", namespace: "users", key: "role", value: "Rôle", context: "Role label" },

    // Riders namespace
    { languageCode: "en", namespace: "riders", key: "title", value: "Riders", context: "Riders page title" },
    { languageCode: "fr", namespace: "riders", key: "title", value: "Livreurs", context: "Riders page title" },
    { languageCode: "en", namespace: "riders", key: "vehicle_type", value: "Vehicle Type", context: "Vehicle type label" },
    { languageCode: "fr", namespace: "riders", key: "vehicle_type", value: "Type de véhicule", context: "Vehicle type label" },
    { languageCode: "en", namespace: "riders", key: "rating", value: "Rating", context: "Rating label" },
    { languageCode: "fr", namespace: "riders", key: "rating", value: "Évaluation", context: "Rating label" },
    { languageCode: "en", namespace: "riders", key: "total_deliveries", value: "Total Deliveries", context: "Total deliveries label" },
    { languageCode: "fr", namespace: "riders", key: "total_deliveries", value: "Total des livraisons", context: "Total deliveries label" },

    // Settings namespace
    { languageCode: "en", namespace: "settings", key: "title", value: "Settings", context: "Settings page title" },
    { languageCode: "fr", namespace: "settings", key: "title", value: "Paramètres", context: "Settings page title" },
    { languageCode: "en", namespace: "settings", key: "general", value: "General", context: "General settings" },
    { languageCode: "fr", namespace: "settings", key: "general", value: "Général", context: "General settings" },
    { languageCode: "en", namespace: "settings", key: "notifications", value: "Notifications", context: "Notifications settings" },
    { languageCode: "fr", namespace: "settings", key: "notifications", value: "Notifications", context: "Notifications settings" },
    { languageCode: "en", namespace: "settings", key: "security", value: "Security", context: "Security settings" },
    { languageCode: "fr", namespace: "settings", key: "security", value: "Sécurité", context: "Security settings" },
    { languageCode: "en", namespace: "settings", key: "language", value: "Language", context: "Language settings" },
    { languageCode: "fr", namespace: "settings", key: "language", value: "Langue", context: "Language settings" },

    // Offline namespace
    { languageCode: "en", namespace: "offline", key: "youre_offline", value: "You're Offline", context: "Offline status title" },
    { languageCode: "fr", namespace: "offline", key: "youre_offline", value: "Vous êtes hors ligne", context: "Offline status title" },
    { languageCode: "en", namespace: "offline", key: "online", value: "Online", context: "Online status" },
    { languageCode: "fr", namespace: "offline", key: "online", value: "En ligne", context: "Online status" },
    { languageCode: "en", namespace: "offline", key: "offline", value: "Offline", context: "Offline status" },
    { languageCode: "fr", namespace: "offline", key: "offline", value: "Hors ligne", context: "Offline status" },
    { languageCode: "en", namespace: "offline", key: "syncing", value: "Syncing...", context: "Syncing status" },
    { languageCode: "fr", namespace: "offline", key: "syncing", value: "Synchronisation...", context: "Syncing status" },
    { languageCode: "en", namespace: "offline", key: "sync_now", value: "Sync Now", context: "Sync now button" },
    { languageCode: "fr", namespace: "offline", key: "sync_now", value: "Synchroniser maintenant", context: "Sync now button" },
    { languageCode: "en", namespace: "offline", key: "syncing_changes", value: "Syncing Changes...", context: "Syncing changes status" },
    { languageCode: "fr", namespace: "offline", key: "syncing_changes", value: "Synchronisation des modifications...", context: "Syncing changes status" },
    { languageCode: "en", namespace: "offline", key: "pending_sync", value: "Pending Sync", context: "Pending sync status" },
    { languageCode: "fr", namespace: "offline", key: "pending_sync", value: "Synchronisation en attente", context: "Pending sync status" },
    { languageCode: "en", namespace: "offline", key: "queued_actions", value: "{{count}} action(s) queued for sync when connection is restored.", context: "Queued actions message" },
    { languageCode: "fr", namespace: "offline", key: "queued_actions", value: "{{count}} action(s) en attente de synchronisation lorsque la connexion sera rétablie.", context: "Queued actions message" },
    { languageCode: "en", namespace: "offline", key: "pending_actions", value: "{{count}} pending action(s)", context: "Pending actions count" },
    { languageCode: "fr", namespace: "offline", key: "pending_actions", value: "{{count}} action(s) en attente", context: "Pending actions count" },
    { languageCode: "en", namespace: "offline", key: "limited_features", value: "Some features may not be available. Changes will be synced when you're back online.", context: "Limited features message" },
    { languageCode: "fr", namespace: "offline", key: "limited_features", value: "Certaines fonctionnalités peuvent ne pas être disponibles. Les modifications seront synchronisées lorsque vous serez de nouveau en ligne.", context: "Limited features message" },
    { languageCode: "en", namespace: "offline", key: "show_details", value: "Show Details", context: "Show details button" },
    { languageCode: "fr", namespace: "offline", key: "show_details", value: "Afficher les détails", context: "Show details button" },
    { languageCode: "en", namespace: "offline", key: "hide_details", value: "Hide Details", context: "Hide details button" },
    { languageCode: "fr", namespace: "offline", key: "hide_details", value: "Masquer les détails", context: "Hide details button" },
    { languageCode: "en", namespace: "offline", key: "pending_changes", value: "Pending changes", context: "Pending changes label" },
    { languageCode: "fr", namespace: "offline", key: "pending_changes", value: "Modifications en attente", context: "Pending changes label" },
    { languageCode: "en", namespace: "offline", key: "last_sync", value: "Last sync", context: "Last sync label" },
    { languageCode: "fr", namespace: "offline", key: "last_sync", value: "Dernière synchronisation", context: "Last sync label" },
    { languageCode: "en", namespace: "offline", key: "last_synced", value: "Last synced", context: "Last synced label" },
    { languageCode: "fr", namespace: "offline", key: "last_synced", value: "Dernière synchronisation", context: "Last synced label" },
    { languageCode: "en", namespace: "offline", key: "never_synced", value: "Never synced", context: "Never synced message" },
    { languageCode: "fr", namespace: "offline", key: "never_synced", value: "Jamais synchronisé", context: "Never synced message" },
    { languageCode: "en", namespace: "offline", key: "just_now", value: "Just now", context: "Just now time" },
    { languageCode: "fr", namespace: "offline", key: "just_now", value: "À l'instant", context: "Just now time" },
    { languageCode: "en", namespace: "offline", key: "auto_sync_enabled", value: "Auto-sync enabled", context: "Auto-sync enabled message" },
    { languageCode: "fr", namespace: "offline", key: "auto_sync_enabled", value: "Synchronisation automatique activée", context: "Auto-sync enabled message" },
    { languageCode: "en", namespace: "offline", key: "auto_sync_description", value: "Changes will be automatically synced when connection is stable. You can also manually trigger sync using the button above.", context: "Auto-sync description" },
    { languageCode: "fr", namespace: "offline", key: "auto_sync_description", value: "Les modifications seront automatiquement synchronisées lorsque la connexion sera stable. Vous pouvez également déclencher manuellement la synchronisation à l'aide du bouton ci-dessus.", context: "Auto-sync description" },
    { languageCode: "en", namespace: "offline", key: "connection_status", value: "Connection Status", context: "Connection status title" },
    { languageCode: "fr", namespace: "offline", key: "connection_status", value: "État de la connexion", context: "Connection status title" },
    { languageCode: "en", namespace: "offline", key: "offline_support_description", value: "Offline support with automatic background sync", context: "Offline support description" },
    { languageCode: "fr", namespace: "offline", key: "offline_support_description", value: "Support hors ligne avec synchronisation automatique en arrière-plan", context: "Offline support description" },
    { languageCode: "en", namespace: "offline", key: "status", value: "Status", context: "Status label" },
    { languageCode: "fr", namespace: "offline", key: "status", value: "Statut", context: "Status label" },
    { languageCode: "en", namespace: "offline", key: "last_successful_sync", value: "Last Successful Sync", context: "Last successful sync label" },
    { languageCode: "fr", namespace: "offline", key: "last_successful_sync", value: "Dernière synchronisation réussie", context: "Last successful sync label" },
    { languageCode: "en", namespace: "offline", key: "no_connection_warning", value: "No internet connection. Changes will be synced automatically when connection is restored.", context: "No connection warning" },
    { languageCode: "fr", namespace: "offline", key: "no_connection_warning", value: "Pas de connexion Internet. Les modifications seront synchronisées automatiquement lorsque la connexion sera rétablie.", context: "No connection warning" },
  ];

  try {
    for (const translation of translationData) {
      await db.insert(translations).values(translation).onDuplicateKeyUpdate({
        set: {
          value: translation.value,
          context: translation.context,
        },
      });
    }
    console.log(`✅ Successfully seeded ${translationData.length} translations`);
  } catch (error) {
    console.error("❌ Error seeding translations:", error);
    throw error;
  }

  console.log("🎉 Translation seeding completed!");
}

// Run the seed function
seedTranslations()
  .then(() => {
    console.log("✅ Seed script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed script failed:", error);
    process.exit(1);
  });
