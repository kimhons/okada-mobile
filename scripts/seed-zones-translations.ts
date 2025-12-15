/**
 * Seed script for Delivery Zones page translations
 * Run with: pnpm tsx scripts/seed-zones-translations.ts
 */

import { getDb } from "../server/db";
import { translations } from "../drizzle/schema";

const zonesTranslations = [
  // Header Section (10 translations)
  { namespace: "zones", key: "title", languageCode: "en", value: "Delivery Zones" },
  { namespace: "zones", key: "title", languageCode: "fr", value: "Zones de Livraison" },
  { namespace: "zones", key: "subtitle", languageCode: "en", value: "Configure delivery zones for Douala and Yaoundé with pricing tiers and time estimates" },
  { namespace: "zones", key: "subtitle", languageCode: "fr", value: "Configurez les zones de livraison pour Douala et Yaoundé avec les tarifs et les délais estimés" },
  { namespace: "zones", key: "addZone", languageCode: "en", value: "Add Zone" },
  { namespace: "zones", key: "addZone", languageCode: "fr", value: "Ajouter une Zone" },
  { namespace: "zones", key: "loading", languageCode: "en", value: "Loading delivery zones..." },
  { namespace: "zones", key: "loading", languageCode: "fr", value: "Chargement des zones de livraison..." },
  { namespace: "zones", key: "deleteConfirm", languageCode: "en", value: "Are you sure you want to delete this delivery zone?" },
  { namespace: "zones", key: "deleteConfirm", languageCode: "fr", value: "Êtes-vous sûr de vouloir supprimer cette zone de livraison ?" },

  // Dialog Section (26 translations)
  { namespace: "zones", key: "dialog.createTitle", languageCode: "en", value: "Create Delivery Zone" },
  { namespace: "zones", key: "dialog.createTitle", languageCode: "fr", value: "Créer une Zone de Livraison" },
  { namespace: "zones", key: "dialog.createDescription", languageCode: "en", value: "Add a new delivery zone with pricing and time estimates" },
  { namespace: "zones", key: "dialog.createDescription", languageCode: "fr", value: "Ajouter une nouvelle zone de livraison avec tarifs et délais estimés" },
  { namespace: "zones", key: "dialog.editTitle", languageCode: "en", value: "Edit Delivery Zone" },
  { namespace: "zones", key: "dialog.editTitle", languageCode: "fr", value: "Modifier la Zone de Livraison" },
  { namespace: "zones", key: "dialog.editDescription", languageCode: "en", value: "Update delivery zone pricing and time estimates" },
  { namespace: "zones", key: "dialog.editDescription", languageCode: "fr", value: "Mettre à jour les tarifs et délais de la zone de livraison" },
  { namespace: "zones", key: "dialog.zoneName", languageCode: "en", value: "Zone Name" },
  { namespace: "zones", key: "dialog.zoneName", languageCode: "fr", value: "Nom de la Zone" },
  { namespace: "zones", key: "dialog.zoneNamePlaceholder", languageCode: "en", value: "e.g., Akwa, Bonanjo" },
  { namespace: "zones", key: "dialog.zoneNamePlaceholder", languageCode: "fr", value: "ex: Akwa, Bonanjo" },
  { namespace: "zones", key: "dialog.city", languageCode: "en", value: "City" },
  { namespace: "zones", key: "dialog.city", languageCode: "fr", value: "Ville" },
  { namespace: "zones", key: "dialog.baseFee", languageCode: "en", value: "Base Fee (FCFA)" },
  { namespace: "zones", key: "dialog.baseFee", languageCode: "fr", value: "Tarif de Base (FCFA)" },
  { namespace: "zones", key: "dialog.perKmFee", languageCode: "en", value: "Per KM Fee (FCFA)" },
  { namespace: "zones", key: "dialog.perKmFee", languageCode: "fr", value: "Tarif par KM (FCFA)" },
  { namespace: "zones", key: "dialog.estimatedTime", languageCode: "en", value: "Estimated Delivery Time (minutes)" },
  { namespace: "zones", key: "dialog.estimatedTime", languageCode: "fr", value: "Temps de Livraison Estimé (minutes)" },
  { namespace: "zones", key: "dialog.cancel", languageCode: "en", value: "Cancel" },
  { namespace: "zones", key: "dialog.cancel", languageCode: "fr", value: "Annuler" },
  { namespace: "zones", key: "dialog.create", languageCode: "en", value: "Create Zone" },
  { namespace: "zones", key: "dialog.create", languageCode: "fr", value: "Créer la Zone" },
  { namespace: "zones", key: "dialog.update", languageCode: "en", value: "Update Zone" },
  { namespace: "zones", key: "dialog.update", languageCode: "fr", value: "Mettre à Jour" },

  // Cities (4 translations)
  { namespace: "zones", key: "cities.douala", languageCode: "en", value: "Douala" },
  { namespace: "zones", key: "cities.douala", languageCode: "fr", value: "Douala" },
  { namespace: "zones", key: "cities.yaounde", languageCode: "en", value: "Yaoundé" },
  { namespace: "zones", key: "cities.yaounde", languageCode: "fr", value: "Yaoundé" },

  // Cards Section (10 translations)
  { namespace: "zones", key: "cards.doualaZones", languageCode: "en", value: "Douala Zones" },
  { namespace: "zones", key: "cards.doualaZones", languageCode: "fr", value: "Zones de Douala" },
  { namespace: "zones", key: "cards.yaoundeZones", languageCode: "en", value: "Yaoundé Zones" },
  { namespace: "zones", key: "cards.yaoundeZones", languageCode: "fr", value: "Zones de Yaoundé" },
  { namespace: "zones", key: "cards.zonesConfigured", languageCode: "en", value: "delivery zones configured" },
  { namespace: "zones", key: "cards.zonesConfigured", languageCode: "fr", value: "zones de livraison configurées" },
  { namespace: "zones", key: "cards.noZonesDouala", languageCode: "en", value: "No delivery zones configured for Douala" },
  { namespace: "zones", key: "cards.noZonesDouala", languageCode: "fr", value: "Aucune zone de livraison configurée pour Douala" },
  { namespace: "zones", key: "cards.noZonesYaounde", languageCode: "en", value: "No delivery zones configured for Yaoundé" },
  { namespace: "zones", key: "cards.noZonesYaounde", languageCode: "fr", value: "Aucune zone de livraison configurée pour Yaoundé" },

  // Table Section (20 translations)
  { namespace: "zones", key: "table.zone", languageCode: "en", value: "Zone" },
  { namespace: "zones", key: "table.zone", languageCode: "fr", value: "Zone" },
  { namespace: "zones", key: "table.pricing", languageCode: "en", value: "Pricing" },
  { namespace: "zones", key: "table.pricing", languageCode: "fr", value: "Tarification" },
  { namespace: "zones", key: "table.time", languageCode: "en", value: "Time" },
  { namespace: "zones", key: "table.time", languageCode: "fr", value: "Temps" },
  { namespace: "zones", key: "table.status", languageCode: "en", value: "Status" },
  { namespace: "zones", key: "table.status", languageCode: "fr", value: "Statut" },
  { namespace: "zones", key: "table.actions", languageCode: "en", value: "Actions" },
  { namespace: "zones", key: "table.actions", languageCode: "fr", value: "Actions" },
  { namespace: "zones", key: "table.active", languageCode: "en", value: "Active" },
  { namespace: "zones", key: "table.active", languageCode: "fr", value: "Actif" },
  { namespace: "zones", key: "table.inactive", languageCode: "en", value: "Inactive" },
  { namespace: "zones", key: "table.inactive", languageCode: "fr", value: "Inactif" },
  { namespace: "zones", key: "table.base", languageCode: "en", value: "base" },
  { namespace: "zones", key: "table.base", languageCode: "fr", value: "base" },
  { namespace: "zones", key: "table.perKm", languageCode: "en", value: "/km" },
  { namespace: "zones", key: "table.perKm", languageCode: "fr", value: "/km" },
  { namespace: "zones", key: "table.min", languageCode: "en", value: "min" },
  { namespace: "zones", key: "table.min", languageCode: "fr", value: "min" },

  // Toast Messages (6 translations)
  { namespace: "zones", key: "toast.createSuccess", languageCode: "en", value: "Delivery zone created successfully" },
  { namespace: "zones", key: "toast.createSuccess", languageCode: "fr", value: "Zone de livraison créée avec succès" },
  { namespace: "zones", key: "toast.updateSuccess", languageCode: "en", value: "Delivery zone updated successfully" },
  { namespace: "zones", key: "toast.updateSuccess", languageCode: "fr", value: "Zone de livraison mise à jour avec succès" },
  { namespace: "zones", key: "toast.deleteSuccess", languageCode: "en", value: "Delivery zone deleted successfully" },
  { namespace: "zones", key: "toast.deleteSuccess", languageCode: "fr", value: "Zone de livraison supprimée avec succès" },
];

async function seedZonesTranslations() {
  console.log(`\n🌍 Seeding Delivery Zones translations...`);
  console.log(`   Total translations: ${zonesTranslations.length}`);
  console.log(`   English: ${zonesTranslations.filter(t => t.languageCode === "en").length}`);
  console.log(`   French: ${zonesTranslations.filter(t => t.languageCode === "fr").length}\n`);

  const dbInstance = await getDb();
  if (!dbInstance) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  let successCount = 0;
  let errorCount = 0;

  for (const translation of zonesTranslations) {
    try {
      await dbInstance.insert(translations).values(translation).onDuplicateKeyUpdate({
        set: { value: translation.value },
      });
      successCount++;
    } catch (error) {
      console.error(`❌ Error seeding ${translation.key}:`, error);
      errorCount++;
    }
  }

  console.log(`\n✅ Zones translations seeded successfully!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}\n`);
  
  process.exit(0);
}

seedZonesTranslations().catch((error) => {
  console.error("❌ Fatal error seeding zones translations:", error);
  process.exit(1);
});
