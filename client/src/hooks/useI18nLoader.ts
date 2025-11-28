import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";

/**
 * Hook to load translations from database into i18next
 * Call this once in App.tsx to populate all namespaces
 */
export function useI18nLoader() {
  const { i18n } = useTranslation();
  
  // Load Orders namespace translations
  const { data: ordersEn } = trpc.i18n.getTranslations.useQuery({ languageCode: "en", namespace: "orders" });
  const { data: ordersFr } = trpc.i18n.getTranslations.useQuery({ languageCode: "fr", namespace: "orders" });
  
  // Load Users namespace translations
  const { data: usersEn } = trpc.i18n.getTranslations.useQuery({ languageCode: "en", namespace: "users" });
  const { data: usersFr } = trpc.i18n.getTranslations.useQuery({ languageCode: "fr", namespace: "users" });
  
  // Load Riders namespace translations
  const { data: ridersEn } = trpc.i18n.getTranslations.useQuery({ languageCode: "en", namespace: "riders" });
  const { data: ridersFr } = trpc.i18n.getTranslations.useQuery({ languageCode: "fr", namespace: "riders" });
  
  // Load Products namespace translations
  const { data: productsEn } = trpc.i18n.getTranslations.useQuery({ languageCode: "en", namespace: "products" });
  const { data: productsFr } = trpc.i18n.getTranslations.useQuery({ languageCode: "fr", namespace: "products" });
  
  // Load Sellers namespace translations
  const { data: sellersEn } = trpc.i18n.getTranslations.useQuery({ languageCode: "en", namespace: "sellers" });
  const { data: sellersFr } = trpc.i18n.getTranslations.useQuery({ languageCode: "fr", namespace: "sellers" });

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

    if (ordersEn) addTranslations("en", "orders", ordersEn);
    if (ordersFr) addTranslations("fr", "orders", ordersFr);
    if (usersEn) addTranslations("en", "users", usersEn);
    if (usersFr) addTranslations("fr", "users", usersFr);
    if (ridersEn) addTranslations("en", "riders", ridersEn);
    if (ridersFr) addTranslations("fr", "riders", ridersFr);
    if (productsEn) addTranslations("en", "products", productsEn);
    if (productsFr) addTranslations("fr", "products", productsFr);
    if (sellersEn) addTranslations("en", "sellers", sellersEn);
    if (sellersFr) addTranslations("fr", "sellers", sellersFr);
  }, [i18n, ordersEn, ordersFr, usersEn, usersFr, ridersEn, ridersFr, productsEn, productsFr, sellersEn, sellersFr]);
}
