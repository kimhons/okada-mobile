import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Initialize i18next for multi-language support
// Critical for Cameroon market (60% French-speaking users)
// Translations will be loaded dynamically from database via useI18nLoader hook
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources: {
      en: {
        common: {
          welcome: "Welcome",
          loading: "Loading...",
          error: "Error",
          success: "Success",
          save: "Save",
          cancel: "Cancel",
          delete: "Delete",
          edit: "Edit",
          create: "Create",
          search: "Search",
          filter: "Filter",
          export: "Export",
          import: "Import",
          refresh: "Refresh",
          back: "Back",
          next: "Next",
          previous: "Previous",
          submit: "Submit",
          confirm: "Confirm",
          yes: "Yes",
          no: "No",
        },
        dashboard: {
          title: "Dashboard",
          welcome_message: "Welcome to your admin dashboard",
          total_orders: "Total Orders",
          active_users: "Active Users",
          active_riders: "Active Riders",
          total_revenue: "Total Revenue",
          from_last_month: "from last month",
          recent_orders: "Recent Orders",
          recent_orders_description: "Latest orders from your customers",
          manage_products: "Manage Products",
          manage_products_description: "Add, edit, and organize your product catalog",
          approve_riders: "Approve Riders",
          approve_riders_description: "Review and approve pending rider applications",
          view_analytics: "View Analytics",
          view_analytics_description: "Track performance metrics and insights",
        },
      },
      fr: {
        common: {
          welcome: "Bienvenue",
          loading: "Chargement...",
          error: "Erreur",
          success: "Succès",
          save: "Enregistrer",
          cancel: "Annuler",
          delete: "Supprimer",
          edit: "Modifier",
          create: "Créer",
          search: "Rechercher",
          filter: "Filtrer",
          export: "Exporter",
          import: "Importer",
          refresh: "Actualiser",
          back: "Retour",
          next: "Suivant",
          previous: "Précédent",
          submit: "Soumettre",
          confirm: "Confirmer",
          yes: "Oui",
          no: "Non",
        },
        dashboard: {
          title: "Tableau de bord",
          welcome_message: "Bienvenue sur votre tableau de bord administrateur",
          total_orders: "Total des commandes",
          active_users: "Utilisateurs actifs",
          active_riders: "Livreurs actifs",
          total_revenue: "Revenu total",
          from_last_month: "du mois dernier",
          recent_orders: "Commandes récentes",
          recent_orders_description: "Dernières commandes de vos clients",
          manage_products: "Gérer les produits",
          manage_products_description: "Ajouter, modifier et organiser votre catalogue de produits",
          approve_riders: "Approuver les livreurs",
          approve_riders_description: "Examiner et approuver les candidatures de livreurs en attente",
          view_analytics: "Voir les analyses",
          view_analytics_description: "Suivre les métriques de performance et les insights",
        },
      },
    },
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "dashboard", "orders", "users", "riders", "products", "sellers"],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
