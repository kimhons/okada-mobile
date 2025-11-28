import { BackendModule, ReadCallback } from 'i18next';

/**
 * Custom i18next backend that loads translations from our database via tRPC
 * Supports the namespace + key structure in our translations table
 */
export class DatabaseBackend implements BackendModule {
  type: 'backend' = 'backend';
  private trpcClient: any;

  constructor(trpcClient: any) {
    this.trpcClient = trpcClient;
  }

  init() {
    // No initialization needed
  }

  read(language: string, namespace: string, callback: ReadCallback) {
    // Fetch translations from database via tRPC
    this.trpcClient.i18n.getTranslations
      .query({ languageCode: language, namespace })
      .then((translations: Array<{ key: string; value: string }>) => {
        // Convert array of {key, value} to flat object
        const resources = translations.reduce((acc: Record<string, string>, t) => {
          acc[t.key] = t.value;
          return acc;
        }, {});
        callback(null, resources);
      })
      .catch((error: Error) => {
        console.error(`Failed to load translations for ${language}/${namespace}:`, error);
        callback(error, null);
      });
  }

  // Optional: implement save for translation management UI
  create(languages: string[], namespace: string, key: string, fallbackValue: string) {
    // Not implemented - use Translation Management UI
  }
}
