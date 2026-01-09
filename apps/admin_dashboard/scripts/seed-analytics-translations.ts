import { drizzle } from "drizzle-orm/mysql2";
import { translations } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const analyticsTranslations = [
  // Revenue Analytics - English
  { languageCode: "en", namespace: "revenue", key: "title", value: "Revenue Analytics" },
  { languageCode: "en", namespace: "revenue", key: "subtitle", value: "Track revenue performance, growth trends, and commission earnings" },
  { languageCode: "en", namespace: "revenue", key: "loading", value: "Loading revenue analytics..." },
  { languageCode: "en", namespace: "revenue", key: "stats.totalRevenue", value: "Total Revenue" },
  { languageCode: "en", namespace: "revenue", key: "stats.commissionEarned", value: "Commission Earned" },
  { languageCode: "en", namespace: "revenue", key: "stats.growthRate", value: "Growth Rate" },
  { languageCode: "en", namespace: "revenue", key: "stats.thisMonth", value: "This Month" },
  { languageCode: "en", namespace: "revenue", key: "stats.fromLastMonth", value: "from last month" },
  { languageCode: "en", namespace: "revenue", key: "charts.monthlyTrend.title", value: "Monthly Revenue Trend" },
  { languageCode: "en", namespace: "revenue", key: "charts.monthlyTrend.description", value: "Revenue and commission earnings over the last 6 months" },
  { languageCode: "en", namespace: "revenue", key: "charts.monthlyTrend.totalRevenue", value: "Total Revenue" },
  { languageCode: "en", namespace: "revenue", key: "charts.monthlyTrend.commissionEarned", value: "Commission Earned" },
  { languageCode: "en", namespace: "revenue", key: "charts.revenueByCategory.title", value: "Revenue by Category" },
  { languageCode: "en", namespace: "revenue", key: "charts.revenueByCategory.description", value: "Distribution of revenue across product categories" },
  { languageCode: "en", namespace: "revenue", key: "charts.topCategories.title", value: "Top Categories" },
  { languageCode: "en", namespace: "revenue", key: "charts.topCategories.description", value: "Revenue comparison across product categories" },

  // Revenue Analytics - French
  { languageCode: "fr", namespace: "revenue", key: "title", value: "Analyse des Revenus" },
  { languageCode: "fr", namespace: "revenue", key: "subtitle", value: "Suivre les performances des revenus, les tendances de croissance et les commissions" },
  { languageCode: "fr", namespace: "revenue", key: "loading", value: "Chargement de l'analyse des revenus..." },
  { languageCode: "fr", namespace: "revenue", key: "stats.totalRevenue", value: "Revenu Total" },
  { languageCode: "fr", namespace: "revenue", key: "stats.commissionEarned", value: "Commission Gagnée" },
  { languageCode: "fr", namespace: "revenue", key: "stats.growthRate", value: "Taux de Croissance" },
  { languageCode: "fr", namespace: "revenue", key: "stats.thisMonth", value: "Ce Mois-ci" },
  { languageCode: "fr", namespace: "revenue", key: "stats.fromLastMonth", value: "par rapport au mois dernier" },
  { languageCode: "fr", namespace: "revenue", key: "charts.monthlyTrend.title", value: "Tendance Mensuelle des Revenus" },
  { languageCode: "fr", namespace: "revenue", key: "charts.monthlyTrend.description", value: "Revenus et commissions au cours des 6 derniers mois" },
  { languageCode: "fr", namespace: "revenue", key: "charts.monthlyTrend.totalRevenue", value: "Revenu Total" },
  { languageCode: "fr", namespace: "revenue", key: "charts.monthlyTrend.commissionEarned", value: "Commission Gagnée" },
  { languageCode: "fr", namespace: "revenue", key: "charts.revenueByCategory.title", value: "Revenus par Catégorie" },
  { languageCode: "fr", namespace: "revenue", key: "charts.revenueByCategory.description", value: "Distribution des revenus par catégorie de produits" },
  { languageCode: "fr", namespace: "revenue", key: "charts.topCategories.title", value: "Meilleures Catégories" },
  { languageCode: "fr", namespace: "revenue", key: "charts.topCategories.description", value: "Comparaison des revenus par catégorie de produits" },

  // Mobile Money Analytics - English
  { languageCode: "en", namespace: "mobileMoney", key: "title", value: "Mobile Money Analytics" },
  { languageCode: "en", namespace: "mobileMoney", key: "subtitle", value: "Track MTN Money and Orange Money performance, transaction success rates, and trends" },
  { languageCode: "en", namespace: "mobileMoney", key: "loading", value: "Loading mobile money analytics..." },
  { languageCode: "en", namespace: "mobileMoney", key: "exportCSV", value: "Export to CSV" },
  { languageCode: "en", namespace: "mobileMoney", key: "fromDate", value: "From Date" },
  { languageCode: "en", namespace: "mobileMoney", key: "toDate", value: "To Date" },
  { languageCode: "en", namespace: "mobileMoney", key: "apply", value: "Apply" },
  { languageCode: "en", namespace: "mobileMoney", key: "stats.mtnVolume", value: "MTN Money Volume" },
  { languageCode: "en", namespace: "mobileMoney", key: "stats.orangeVolume", value: "Orange Money Volume" },
  { languageCode: "en", namespace: "mobileMoney", key: "stats.successRate", value: "Success Rate" },
  { languageCode: "en", namespace: "mobileMoney", key: "stats.totalTransactions", value: "Total Transactions" },

  // Mobile Money Analytics - French
  { languageCode: "fr", namespace: "mobileMoney", key: "title", value: "Analyse Mobile Money" },
  { languageCode: "fr", namespace: "mobileMoney", key: "subtitle", value: "Suivre les performances MTN Money et Orange Money, taux de réussite et tendances" },
  { languageCode: "fr", namespace: "mobileMoney", key: "loading", value: "Chargement de l'analyse mobile money..." },
  { languageCode: "fr", namespace: "mobileMoney", key: "exportCSV", value: "Exporter en CSV" },
  { languageCode: "fr", namespace: "mobileMoney", key: "fromDate", value: "Date de Début" },
  { languageCode: "fr", namespace: "mobileMoney", key: "toDate", value: "Date de Fin" },
  { languageCode: "fr", namespace: "mobileMoney", key: "apply", value: "Appliquer" },
  { languageCode: "fr", namespace: "mobileMoney", key: "stats.mtnVolume", value: "Volume MTN Money" },
  { languageCode: "fr", namespace: "mobileMoney", key: "stats.orangeVolume", value: "Volume Orange Money" },
  { languageCode: "fr", namespace: "mobileMoney", key: "stats.successRate", value: "Taux de Réussite" },
  { languageCode: "fr", namespace: "mobileMoney", key: "stats.totalTransactions", value: "Total des Transactions" },
];

async function seed() {
  console.log("🌱 Seeding analytics translations...");

  for (const translation of analyticsTranslations) {
    await db
      .insert(translations)
      .values(translation)
      .onDuplicateKeyUpdate({
        set: { value: translation.value },
      });
  }

  console.log(`✅ Seeded ${analyticsTranslations.length} translations`);
  console.log("   - Revenue Analytics: 32 translations (16 EN + 16 FR)");
  console.log("   - Mobile Money Analytics: 22 translations (11 EN + 11 FR)");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Error seeding translations:", error);
  process.exit(1);
});
