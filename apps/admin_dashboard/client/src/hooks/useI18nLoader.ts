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
    "dashboard", "financial", "commission", "payment", "payout",
    "leaderboard", "quality", "revenue", "mobileMoney"
  ];
  
  // Load English translations for all namespaces
  const enQueries = namespacesToLoad.map(ns => ({
    namespace: ns,
    query: trpc.i18n.getTranslations.useQuery(
      { languageCode: "en", namespace: ns },
      { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
    )
  }));
  
  // Load French translations for all namespaces
  const frQueries = namespacesToLoad.map(ns => ({
    namespace: ns,
    query: trpc.i18n.getTranslations.useQuery(
      { languageCode: "fr", namespace: ns },
      { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
    )
  }));

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

    // Process English translations
    enQueries.forEach(({ namespace, query }) => {
      if (query.data) {
        addTranslations("en", namespace, query.data);
      }
    });

    // Process French translations
    frQueries.forEach(({ namespace, query }) => {
      if (query.data) {
        addTranslations("fr", namespace, query.data);
      }
    });
  }, [
    i18n,
    ...enQueries.map(q => q.query.data),
    ...frQueries.map(q => q.query.data)
  ]);
  
  // Return loading state
  const isLoading = enQueries.some(q => q.query.isLoading) || frQueries.some(q => q.query.isLoading);
  const hasError = enQueries.some(q => q.query.isError) || frQueries.some(q => q.query.isError);
  
  return { isLoading, hasError };
}
