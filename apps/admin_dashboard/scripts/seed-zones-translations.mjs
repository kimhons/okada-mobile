import { drizzle } from "drizzle-orm/mysql2";
import { translations } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const zonesTranslations = [
  // Header Section
  { namespace: "zones", key: "title", language: "en", value: "Delivery Zones" },
  { namespace: "zones", key: "title", language: "fr", value: "Zones de Livraison" },
  { namespace: "zones", key: "subtitle", language: "en", value: "Configure delivery zones for Douala and Yaoundé with pricing tiers and time estimates" },
  { namespace: "zones", key: "subtitle", language: "fr", value: "Configurez les zones de livraison pour Douala et Yaoundé avec les tarifs et les délais estimés" },
  { namespace: "zones", key: "addZone", language: "en", value: "Add Zone" },
  { namespace: "zones", key: "addZone", language: "fr", value: "Ajouter une Zone" },
  { namespace: "zones", key: "loading", language: "en", value: "Loading delivery zones..." },
  { namespace: "zones", key: "loading", language: "fr", value: "Chargement des zones de livraison..." },
  { namespace: "zones", key: "deleteConfirm", language: "en", value: "Are you sure you want to delete this delivery zone?" },
  { namespace: "zones", key: "deleteConfirm", language: "fr", value: "Êtes-vous sûr de vouloir supprimer cette zone de livraison ?" },

  // Dialog Section
  { namespace: "zones", key: "dialog.createTitle", language: "en", value: "Create Delivery Zone" },
  { namespace: "zones", key: "dialog.createTitle", language: "fr", value: "Créer une Zone de Livraison" },
  { namespace: "zones", key: "dialog.createDescription", language: "en", value: "Add a new delivery zone with pricing and time estimates" },
  { namespace: "zones", key: "dialog.createDescription", language: "fr", value: "Ajouter une nouvelle zone de livraison avec tarifs et délais estimés" },
  { namespace: "zones", key: "dialog.editTitle", language: "en", value: "Edit Delivery Zone" },
  { namespace: "zones", key: "dialog.editTitle", language: "fr", value: "Modifier la Zone de Livraison" },
  { namespace: "zones", key: "dialog.editDescription", language: "en", value: "Update delivery zone pricing and time estimates" },
  { namespace: "zones", key: "dialog.editDescription", language: "fr", value: "Mettre à jour les tarifs et délais de la zone de livraison" },
  { namespace: "zones", key: "dialog.zoneName", language: "en", value: "Zone Name" },
  { namespace: "zones", key: "dialog.zoneName", language: "fr", value: "Nom de la Zone" },
  { namespace: "zones", key: "dialog.zoneNamePlaceholder", language: "en", value: "e.g., Akwa, Bonanjo" },
  { namespace: "zones", key: "dialog.zoneNamePlaceholder", language: "fr", value: "ex: Akwa, Bonanjo" },
  { namespace: "zones", key: "dialog.city", language: "en", value: "City" },
  { namespace: "zones", key: "dialog.city", language: "fr", value: "Ville" },
  { namespace: "zones", key: "dialog.baseFee", language: "en", value: "Base Fee (FCFA)" },
  { namespace: "zones", key: "dialog.baseFee", language: "fr", value: "Tarif de Base (FCFA)" },
  { namespace: "zones", key: "dialog.perKmFee", language: "en", value: "Per KM Fee (FCFA)" },
  { namespace: "zones", key: "dialog.perKmFee", language: "fr", value: "Tarif par KM (FCFA)" },
  { namespace: "zones", key: "dialog.estimatedTime", language: "en", value: "Estimated Delivery Time (minutes)" },
  { namespace: "zones", key: "dialog.estimatedTime", language: "fr", value: "Temps de Livraison Estimé (minutes)" },
  { namespace: "zones", key: "dialog.cancel", language: "en", value: "Cancel" },
  { namespace: "zones", key: "dialog.cancel", language: "fr", value: "Annuler" },
  { namespace: "zones", key: "dialog.create", language: "en", value: "Create Zone" },
  { namespace: "zones", key: "dialog.create", language: "fr", value: "Créer la Zone" },
  { namespace: "zones", key: "dialog.update", language: "en", value: "Update Zone" },
  { namespace: "zones", key: "dialog.update", language: "fr", value: "Mettre à Jour" },

  // Cities
  { namespace: "zones", key: "cities.douala", language: "en", value: "Douala" },
  { namespace: "zones", key: "cities.douala", language: "fr", value: "Douala" },
  { namespace: "zones", key: "cities.yaounde", language: "en", value: "Yaoundé" },
  { namespace: "zones", key: "cities.yaounde", language: "fr", value: "Yaoundé" },

  // Cards Section
  { namespace: "zones", key: "cards.doualaZones", language: "en", value: "Douala Zones" },
  { namespace: "zones", key: "cards.doualaZones", language: "fr", value: "Zones de Douala" },
  { namespace: "zones", key: "cards.yaoundeZones", language: "en", value: "Yaoundé Zones" },
  { namespace: "zones", key: "cards.yaoundeZones", language: "fr", value: "Zones de Yaoundé" },
  { namespace: "zones", key: "cards.zonesConfigured", language: "en", value: "delivery zones configured" },
  { namespace: "zones", key: "cards.zonesConfigured", language: "fr", value: "zones de livraison configurées" },
  { namespace: "zones", key: "cards.noZonesDouala", language: "en", value: "No delivery zones configured for Douala" },
  { namespace: "zones", key: "cards.noZonesDouala", language: "fr", value: "Aucune zone de livraison configurée pour Douala" },
  { namespace: "zones", key: "cards.noZonesYaounde", language: "en", value: "No delivery zones configured for Yaoundé" },
  { namespace: "zones", key: "cards.noZonesYaounde", language: "fr", value: "Aucune zone de livraison configurée pour Yaoundé" },

  // Table Section
  { namespace: "zones", key: "table.zone", language: "en", value: "Zone" },
  { namespace: "zones", key: "table.zone", language: "fr", value: "Zone" },
  { namespace: "zones", key: "table.pricing", language: "en", value: "Pricing" },
  { namespace: "zones", key: "table.pricing", language: "fr", value: "Tarification" },
  { namespace: "zones", key: "table.time", language: "en", value: "Time" },
  { namespace: "zones", key: "table.time", language: "fr", value: "Temps" },
  { namespace: "zones", key: "table.status", language: "en", value: "Status" },
  { namespace: "zones", key: "table.status", language: "fr", value: "Statut" },
  { namespace: "zones", key: "table.actions", language: "en", value: "Actions" },
  { namespace: "zones", key: "table.actions", language: "fr", value: "Actions" },
  { namespace: "zones", key: "table.active", language: "en", value: "Active" },
  { namespace: "zones", key: "table.active", language: "fr", value: "Actif" },
  { namespace: "zones", key: "table.inactive", language: "en", value: "Inactive" },
  { namespace: "zones", key: "table.inactive", language: "fr", value: "Inactif" },
  { namespace: "zones", key: "table.base", language: "en", value: "base" },
  { namespace: "zones", key: "table.base", language: "fr", value: "base" },
  { namespace: "zones", key: "table.perKm", language: "en", value: "/km" },
  { namespace: "zones", key: "table.perKm", language: "fr", value: "/km" },
  { namespace: "zones", key: "table.min", language: "en", value: "min" },
  { namespace: "zones", key: "table.min", language: "fr", value: "min" },

  // Toast Messages
  { namespace: "zones", key: "toast.createSuccess", language: "en", value: "Delivery zone created successfully" },
  { namespace: "zones", key: "toast.createSuccess", language: "fr", value: "Zone de livraison créée avec succès" },
  { namespace: "zones", key: "toast.updateSuccess", language: "en", value: "Delivery zone updated successfully" },
  { namespace: "zones", key: "toast.updateSuccess", language: "fr", value: "Zone de livraison mise à jour avec succès" },
  { namespace: "zones", key: "toast.deleteSuccess", language: "en", value: "Delivery zone deleted successfully" },
  { namespace: "zones", key: "toast.deleteSuccess", language: "fr", value: "Zone de livraison supprimée avec succès" },
];

async function seedZonesTranslations() {
  console.log(`🌍 Seeding ${zonesTranslations.length} zones translations...`);

  for (const translation of zonesTranslations) {
    await db.insert(translations).values(translation).onDuplicateKeyUpdate({
      set: { value: translation.value },
    });
  }

  console.log("✅ Zones translations seeded successfully!");
  console.log(`   - Total translations: ${zonesTranslations.length}`);
  console.log(`   - English: ${zonesTranslations.filter(t => t.language === "en").length}`);
  console.log(`   - French: ${zonesTranslations.filter(t => t.language === "fr").length}`);
  process.exit(0);
}

seedZonesTranslations().catch((error) => {
  console.error("❌ Error seeding zones translations:", error);
  process.exit(1);
});
