import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Package, Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function Products() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: products = [], isLoading, refetch } = trpc.products.list.useQuery({
    search,
    categoryId: categoryFilter ? parseInt(categoryFilter) : undefined,
  });

  const { data: categories = [] } = trpc.categories.list.useQuery();

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully");
      refetch();
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully");
      refetch();
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    
    createMutation.mutate({
      name,
      slug,
      description: formData.get("description") as string,
      price: parseInt(formData.get("price") as string),
      categoryId: parseInt(formData.get("categoryId") as string),
      imageUrl: formData.get("imageUrl") as string,
      stock: parseInt(formData.get("stock") as string),
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateMutation.mutate({
      id: selectedProduct.id,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseInt(formData.get("price") as string),
      categoryId: parseInt(formData.get("categoryId") as string),
      imageUrl: formData.get("imageUrl") as string,
      stock: parseInt(formData.get("stock") as string),
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const formatPrice = (price: number) => {
    return (price / 100).toLocaleString() + " FCFA";
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('products:title')}</h1>
          <p className="text-gray-600 mt-1">{t('products:description')}</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-[#2D8659] hover:bg-[#236B47]"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('products:add_product')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('products:search_placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('products:filter_by_category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('products:all_categories')}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('products:all_products', { count: products.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D8659] mx-auto"></div>
              <p className="text-gray-600 mt-4">{t('products:loading')}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">{t('products:no_products')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('products:table_product')}</TableHead>
                    <TableHead>{t('products:table_category')}</TableHead>
                    <TableHead>{t('products:table_price')}</TableHead>
                    <TableHead>{t('products:table_stock')}</TableHead>
                    <TableHead>{t('products:table_status')}</TableHead>
                    <TableHead>{t('products:table_actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryName(product.categoryId)}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-[#2D8659]">
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.stock > 10 ? "default" : "destructive"}
                          className={
                            product.stock > 10
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : ""
                          }
                        >
                          {product.stock} units
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.isActive ? "default" : "secondary"}
                          className={
                            product.isActive
                              ? "bg-[#2D8659] hover:bg-[#236B47]"
                              : ""
                          }
                        >
                          {product.isActive ? t('products:active') : t('products:inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id, product.name)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('products:add_new_product')}</DialogTitle>
            <DialogDescription>
              {t('products:add_product_description')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t('products:product_name')}</label>
                <Input name="name" required placeholder={t('products:product_name_placeholder')} />
              </div>
              <div>
                <label className="text-sm font-medium">{t('products:description')}</label>
                <Textarea name="description" placeholder={t('products:description_placeholder')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t('products:price')}</label>
                  <Input
                    name="price"
                    type="number"
                    required
                    placeholder="250000"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">e.g., 250000 for 2500 FCFA</p>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('products:stock')}</label>
                  <Input
                    name="stock"
                    type="number"
                    required
                    placeholder="100"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">{t('products:category')}</label>
                <select
                  name="categoryId"
                  required
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">{t('products:select_category')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">{t('products:image_url')}</label>
                <Input name="imageUrl" type="url" placeholder="https://..." />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                {t('products:cancel')}
              </Button>
              <Button type="submit" className="bg-[#2D8659] hover:bg-[#236B47]">
                {t('products:create_product')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('products:edit_product')}</DialogTitle>
            <DialogDescription>
              {t('products:edit_product_description')}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Product Name</label>
                  <Input
                    name="name"
                    required
                    defaultValue={selectedProduct.name}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    name="description"
                    defaultValue={selectedProduct.description || ""}
                    placeholder="Enter product description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">{t('products:price')}</label>
                    <Input
                      name="price"
                      type="number"
                      required
                      defaultValue={selectedProduct.price}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('products:stock')}</label>
                    <Input
                      name="stock"
                      type="number"
                      required
                      defaultValue={selectedProduct.stock}
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('products:category')}</label>
                  <select
                    name="categoryId"
                    defaultValue={selectedProduct.categoryId}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('products:image_url')}</label>
                  <Input
                    name="imageUrl"
                    type="url"
                    defaultValue={selectedProduct.imageUrl || ""}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedProduct(null);
                  }}
                >
                  {t('products:cancel')}
                </Button>
                <Button type="submit" className="bg-[#2D8659] hover:bg-[#236B47]">
                  {t('products:update_product')}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
