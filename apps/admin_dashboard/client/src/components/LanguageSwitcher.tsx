import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Language Switcher Component
 * Allows users to switch between English and French
 * Critical for Cameroon market (60% French-speaking users)
 */
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { data: languages, isLoading } = trpc.i18n.getLanguages.useQuery();

  const currentLanguage = languages?.find((lang) => lang.code === i18n.language);

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem("i18nextLng", languageCode);
  };

  if (isLoading || !languages || languages.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={
              currentLanguage?.code === language.code
                ? "bg-accent font-medium"
                : ""
            }
          >
            <span className="mr-2">{language.nativeName}</span>
            {currentLanguage?.code === language.code && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
