import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Initialize i18next for multi-language support
// Critical for Cameroon market (60% French-speaking users)
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
          overview: "Overview",
          analytics: "Analytics",
          reports: "Reports",
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
          overview: "Vue d'ensemble",
          analytics: "Analytique",
          reports: "Rapports",
        },
      },
    },
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "dashboard"],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
