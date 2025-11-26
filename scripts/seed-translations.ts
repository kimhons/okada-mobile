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
