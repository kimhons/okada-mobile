import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";

/**
 * Hook to load translations from database into i18next
 * @param namespaces - Array of namespaces to load (e.g., ['orders', 'users'])
 * If not provided, loads all core namespaces
 */
export function useI18nLoader(namespaces?: string[]) {
  const { i18n } = useTranslation();
  
  // Default to all core namespaces if none specified
  const namespacesToLoad = namespaces || [
    "orders", "users", "riders", "products", "sellers", 
    "dashboard", "financial", "commission", "payment", "payout"
  ];
  
  // Dynamically create queries for each namespace
  const queries = namespacesToLoad.flatMap(ns => [
    trpc.i18n.getTranslations.useQuery({ languageCode: "en", namespace: ns }),
    trpc.i18n.getTranslations.useQuery({ languageCode: "fr", namespace: ns }),
  ]);

  // Add translations to i18next when data is loaded
  useEffect(() => {
    const addTranslations = (lang: string, ns: string, data: any[]) => {
      if (!data || data.length === 0) return;
      
      const resources = data.reduce((acc: Record<string, string>, t: any) => {
        acc[t.key] = t.value;
        return acc;
      }, {});
      
      i18n.addResourceBundle(lang, ns, resources, true, true);
      console.log(`[i18n] Loaded ${data.length} translations for ${lang}/${ns}`);
    };

    // Process all loaded queries
    queries.forEach((query, index) => {
      if (query.data) {
        const nsIndex = Math.floor(index / 2);
        const lang = index % 2 === 0 ? "en" : "fr";
        const ns = namespacesToLoad[nsIndex];
        addTranslations(lang, ns, query.data);
      }
    });
  }, [i18n, ...queries.map(q => q.data)]);
}
