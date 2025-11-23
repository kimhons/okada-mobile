import * as XLSX from "xlsx";

export interface ProductCSVRow {
  name: string;
  slug: string;
  description?: string;
  price: number;
  categoryId: number;
  imageUrl?: string;
  stock: number;
}

// Export products to CSV
export function exportProductsToCSV(products: any[], filename = "products.csv") {
  const worksheetData = products.map((product) => ({
    ID: product.id,
    Name: product.name,
    Slug: product.slug,
    Description: product.description || "",
    "Price (FCFA)": product.price / 100,
    "Category ID": product.categoryId,
    "Image URL": product.imageUrl || "",
    Stock: product.stock,
    "Created At": new Date(product.createdAt).toISOString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  XLSX.writeFile(workbook, filename);
}

// Parse CSV file for product import
export function parseProductsCSV(file: File): Promise<ProductCSVRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const products: ProductCSVRow[] = jsonData.map((row: any) => ({
          name: String(row.Name || row.name || ""),
          slug: String(row.Slug || row.slug || ""),
          description: row.Description || row.description || "",
          price: parseFloat(row["Price (FCFA)"] || row.price || 0) * 100, // Convert to cents
          categoryId: parseInt(row["Category ID"] || row.categoryId || 0),
          imageUrl: row["Image URL"] || row.imageUrl || "",
          stock: parseInt(row.Stock || row.stock || 0),
        }));

        // Validate required fields
        const validProducts = products.filter(
          (p) => p.name && p.slug && p.price > 0 && p.categoryId > 0
        );

        if (validProducts.length === 0) {
          reject(new Error("No valid products found in CSV"));
          return;
        }

        resolve(validProducts);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsBinaryString(file);
  });
}

// Generate CSV template for product import
export function downloadProductTemplate() {
  const templateData = [
    {
      Name: "Example Product",
      Slug: "example-product",
      Description: "This is an example product description",
      "Price (FCFA)": 5000,
      "Category ID": 1,
      "Image URL": "https://example.com/image.jpg",
      Stock: 100,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  XLSX.writeFile(workbook, "product-import-template.csv");
}

// Bulk price update
export interface PriceUpdate {
  productId: number;
  newPrice: number;
}

export function parsePriceUpdateCSV(file: File): Promise<PriceUpdate[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const updates: PriceUpdate[] = jsonData.map((row: any) => ({
          productId: parseInt(row["Product ID"] || row.productId || 0),
          newPrice: parseFloat(row["New Price (FCFA)"] || row.newPrice || 0) * 100,
        }));

        const validUpdates = updates.filter(
          (u) => u.productId > 0 && u.newPrice > 0
        );

        if (validUpdates.length === 0) {
          reject(new Error("No valid price updates found in CSV"));
          return;
        }

        resolve(validUpdates);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsBinaryString(file);
  });
}

// Download price update template
export function downloadPriceUpdateTemplate() {
  const templateData = [
    {
      "Product ID": 1,
      "Product Name": "Example Product (for reference only)",
      "New Price (FCFA)": 6000,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Price Updates");

  XLSX.writeFile(workbook, "price-update-template.csv");
}

