import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Download, FileUp, Globe, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Translation Management Page
 * Allows admins to manage translations for multi-language support
 * Critical for Cameroon market (60% French-speaking users)
 */
export default function TranslationManagement() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [selectedNamespace, setSelectedNamespace] = useState<string>("common");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: languages } = trpc.i18n.getLanguages.useQuery();
  const { data: translations, refetch: refetchTranslations } = trpc.i18n.getTranslations.useQuery({
    languageCode: selectedLanguage,
    namespace: selectedNamespace,
  });
  const { data: coverage } = trpc.i18n.getTranslationCoverage.useQuery();

  // Mutations
  const upsertMutation = trpc.i18n.upsertTranslation.useMutation({
    onSuccess: () => {
      toast.success("Translation saved successfully");
      refetchTranslations();
      setIsAddDialogOpen(false);
      setEditingId(null);
    },
    onError: (error) => {
      toast.error(`Failed to save translation: ${error.message}`);
    },
  });

  const bulkUpsertMutation = trpc.i18n.bulkUpsertTranslations.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully imported ${data.count} translations`);
      refetchTranslations();
      setIsImportDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to import translations: ${error.message}`);
    },
  });

  const deleteMutation = trpc.i18n.deleteTranslation.useMutation({
    onSuccess: () => {
      toast.success("Translation deleted successfully");
      refetchTranslations();
    },
    onError: (error) => {
      toast.error(`Failed to delete translation: ${error.message}`);
    },
  });

  // Available namespaces
  const namespaces = ["common", "dashboard", "orders", "products", "users", "riders", "sellers", "financial", "settings"];

  // Handle CSV Export
  const handleExportCSV = () => {
    if (!translations || translations.length === 0) {
      toast.error("No translations to export");
      return;
    }

    // Create CSV content
    const headers = ["Language Code", "Namespace", "Key", "Value", "Context"];
    const rows = translations.map((t) => [
      t.languageCode,
      t.namespace,
      t.key,
      `"${t.value.replace(/"/g, '""')}"`, // Escape quotes
      t.context ? `"${t.context.replace(/"/g, '""')}"` : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `translations_${selectedLanguage}_${selectedNamespace}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Translations exported successfully");
  };

  // Handle CSV Import
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n");
        
        // Skip header row
        const dataLines = lines.slice(1).filter((line) => line.trim());
        
        const parsedTranslations = dataLines.map((line) => {
          // Simple CSV parsing (handles quoted values)
          const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
          if (!matches || matches.length < 4) {
            throw new Error("Invalid CSV format");
          }

          const [languageCode, namespace, key, value, context] = matches.map((m) =>
            m.replace(/^"|"$/g, "").replace(/""/g, '"')
          );

          return {
            languageCode: languageCode.trim(),
            namespace: namespace.trim(),
            key: key.trim(),
            value: value.trim(),
            context: context?.trim() || undefined,
          };
        });

        if (parsedTranslations.length === 0) {
          toast.error("No valid translations found in CSV");
          return;
        }

        // Import translations
        bulkUpsertMutation.mutate(parsedTranslations);
      } catch (error) {
        toast.error(`Failed to parse CSV: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    };

    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle inline edit
  const handleStartEdit = (id: number, currentValue: string) => {
    setEditingId(id);
    setEditValue(currentValue);
  };

  const handleSaveEdit = (translation: any) => {
    upsertMutation.mutate({
      languageCode: translation.languageCode,
      namespace: translation.namespace,
      key: translation.key,
      value: editValue,
      context: translation.context,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // Calculate coverage stats
  const coverageStats = coverage?.reduce((acc, item) => {
    if (!acc[item.languageCode]) {
      acc[item.languageCode] = { total: 0, namespaces: {} };
    }
    acc[item.languageCode].total += Number(item.count);
    acc[item.languageCode].namespaces[item.namespace] = Number(item.count);
    return acc;
  }, {} as Record<string, { total: number; namespaces: Record<string, number> }>);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8" />
            Translation Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage translations for multi-language support (EN/FR)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Translations from CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file with columns: Language Code, Namespace, Key, Value, Context
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 hover:border-primary transition-colors">
                  <FileUp className="h-12 w-12 text-muted-foreground mb-4" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleImportCSV}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload">
                    <Button variant="secondary" asChild>
                      <span>Choose CSV File</span>
                    </Button>
                  </label>
                  <p className="text-sm text-muted-foreground mt-2">
                    or drag and drop
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">CSV Format Example:</p>
                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                    Language Code,Namespace,Key,Value,Context{"\n"}
                    en,common,welcome,"Welcome",""{"\n"}
                    fr,common,welcome,"Bienvenue",""
                  </pre>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Coverage Statistics */}
      {coverageStats && (
        <Card>
          <CardHeader>
            <CardTitle>Translation Coverage</CardTitle>
            <CardDescription>Number of translations per language and namespace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(coverageStats).map(([langCode, data]) => {
                const language = languages?.find((l) => l.code === langCode);
                return (
                  <Card key={langCode}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        {language?.nativeName || langCode.toUpperCase()}
                      </CardTitle>
                      <CardDescription>
                        Total: {data.total} translations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 text-sm">
                        {Object.entries(data.namespaces).map(([ns, count]) => (
                          <div key={ns} className="flex justify-between">
                            <span className="text-muted-foreground">{ns}:</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Add Button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Translations</CardTitle>
              <CardDescription>View and edit translations by language and namespace</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Translation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Translation</DialogTitle>
                  <DialogDescription>
                    Create a new translation entry
                  </DialogDescription>
                </DialogHeader>
                <AddTranslationForm
                  languages={languages || []}
                  namespaces={namespaces}
                  onSubmit={(data) => upsertMutation.mutate(data)}
                  isLoading={upsertMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="language-filter">Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger id="language-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages?.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="namespace-filter">Namespace</Label>
              <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                <SelectTrigger id="namespace-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {namespaces.map((ns) => (
                    <SelectItem key={ns} value={ns}>
                      {ns}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Translations Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-[200px]">Context</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {translations && translations.length > 0 ? (
                  translations.map((translation) => (
                    <TableRow key={translation.id}>
                      <TableCell className="font-mono text-sm">
                        {translation.key}
                      </TableCell>
                      <TableCell>
                        {editingId === translation.id ? (
                          <div className="flex gap-2">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(translation)}
                              disabled={upsertMutation.isPending}
                            >
                              {upsertMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer hover:bg-muted p-2 rounded"
                            onClick={() => handleStartEdit(translation.id, translation.value)}
                          >
                            {translation.value}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {translation.context || "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this translation?")) {
                              deleteMutation.mutate({ id: translation.id });
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No translations found for this language and namespace
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add Translation Form Component
function AddTranslationForm({
  languages,
  namespaces,
  onSubmit,
  isLoading,
}: {
  languages: any[];
  namespaces: string[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    languageCode: "en",
    namespace: "common",
    key: "",
    value: "",
    context: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key || !formData.value) {
      toast.error("Key and value are required");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="add-language">Language</Label>
        <Select
          value={formData.languageCode}
          onValueChange={(value) => setFormData({ ...formData, languageCode: value })}
        >
          <SelectTrigger id="add-language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.nativeName} ({lang.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="add-namespace">Namespace</Label>
        <Select
          value={formData.namespace}
          onValueChange={(value) => setFormData({ ...formData, namespace: value })}
        >
          <SelectTrigger id="add-namespace">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {namespaces.map((ns) => (
              <SelectItem key={ns} value={ns}>
                {ns}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="add-key">Key *</Label>
        <Input
          id="add-key"
          value={formData.key}
          onChange={(e) => setFormData({ ...formData, key: e.target.value })}
          placeholder="e.g., welcome_message"
          required
        />
      </div>

      <div>
        <Label htmlFor="add-value">Value *</Label>
        <Textarea
          id="add-value"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          placeholder="e.g., Welcome to Okada"
          required
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="add-context">Context (Optional)</Label>
        <Input
          id="add-context"
          value={formData.context}
          onChange={(e) => setFormData({ ...formData, context: e.target.value })}
          placeholder="e.g., Shown on homepage"
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Translation
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
