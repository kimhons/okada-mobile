import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Export orders to PDF
export function exportOrdersToPDF(orders: any[], filename = "orders-report.pdf") {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text("Orders Report", 14, 22);
  
  // Add generation date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Prepare table data
  const tableData = orders.map((order) => [
    order.orderNumber,
    order.customerName || "N/A",
    order.riderName || "Unassigned",
    order.status.replace(/_/g, " ").toUpperCase(),
    `${(order.totalAmount / 100).toLocaleString()} FCFA`,
    new Date(order.createdAt).toLocaleDateString(),
  ]);
  
  // Add table
  autoTable(doc, {
    head: [["Order #", "Customer", "Rider", "Status", "Amount", "Date"]],
    body: tableData,
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [45, 134, 89] },
  });
  
  // Add summary
  const finalY = (doc as any).lastAutoTable.finalY || 35;
  doc.setFontSize(10);
  doc.text(`Total Orders: ${orders.length}`, 14, finalY + 10);
  
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  doc.text(
    `Total Revenue: ${(totalRevenue / 100).toLocaleString()} FCFA`,
    14,
    finalY + 16
  );
  
  // Save PDF
  doc.save(filename);
}

// Export orders to Excel
export function exportOrdersToExcel(orders: any[], filename = "orders-report.xlsx") {
  const worksheetData = orders.map((order) => ({
    "Order Number": order.orderNumber,
    Customer: order.customerName || "N/A",
    Rider: order.riderName || "Unassigned",
    Status: order.status.replace(/_/g, " ").toUpperCase(),
    "Amount (FCFA)": order.totalAmount / 100,
    "Pickup Location": order.pickupLocation,
    "Delivery Location": order.deliveryLocation,
    "Created At": new Date(order.createdAt).toLocaleString(),
    "Updated At": new Date(order.updatedAt).toLocaleString(),
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
  
  // Auto-size columns
  const maxWidth = 50;
  const colWidths = Object.keys(worksheetData[0] || {}).map((key) => ({
    wch: Math.min(
      Math.max(
        key.length,
        ...worksheetData.map((row) => String(row[key as keyof typeof row]).length)
      ),
      maxWidth
    ),
  }));
  worksheet["!cols"] = colWidths;
  
  XLSX.writeFile(workbook, filename);
}

// Export analytics to PDF
export function exportAnalyticsToPDF(
  analytics: {
    totalOrders: number;
    totalRevenue: number;
    activeUsers: number;
    activeRiders: number;
    ordersByStatus: Record<string, number>;
    revenueByPeriod: { date: string; revenue: number }[];
  },
  filename = "analytics-report.pdf"
) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text("Analytics Report", 14, 22);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Key Metrics
  doc.setFontSize(14);
  doc.text("Key Metrics", 14, 45);
  
  doc.setFontSize(11);
  let yPos = 55;
  doc.text(`Total Orders: ${analytics.totalOrders.toLocaleString()}`, 14, yPos);
  yPos += 8;
  doc.text(
    `Total Revenue: ${(analytics.totalRevenue / 100).toLocaleString()} FCFA`,
    14,
    yPos
  );
  yPos += 8;
  doc.text(`Active Users: ${analytics.activeUsers.toLocaleString()}`, 14, yPos);
  yPos += 8;
  doc.text(`Active Riders: ${analytics.activeRiders.toLocaleString()}`, 14, yPos);
  
  // Orders by Status
  yPos += 15;
  doc.setFontSize(14);
  doc.text("Orders by Status", 14, yPos);
  
  yPos += 10;
  const statusData = Object.entries(analytics.ordersByStatus).map(([status, count]) => [
    status.replace(/_/g, " ").toUpperCase(),
    count.toString(),
  ]);
  
  autoTable(doc, {
    head: [["Status", "Count"]],
    body: statusData,
    startY: yPos,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [45, 134, 89] },
  });
  
  // Revenue Trend
  const finalY = (doc as any).lastAutoTable.finalY || yPos;
  doc.setFontSize(14);
  doc.text("Revenue Trend (Last 7 Days)", 14, finalY + 15);
  
  const revenueData = analytics.revenueByPeriod.map((item) => [
    item.date,
    `${(item.revenue / 100).toLocaleString()} FCFA`,
  ]);
  
  autoTable(doc, {
    head: [["Date", "Revenue"]],
    body: revenueData,
    startY: finalY + 20,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [45, 134, 89] },
  });
  
  doc.save(filename);
}

// Export riders to Excel
export function exportRidersToExcel(riders: any[], filename = "riders-report.xlsx") {
  const worksheetData = riders.map((rider) => ({
    Name: rider.name,
    Phone: rider.phone,
    Email: rider.email || "N/A",
    "Vehicle Type": rider.vehicleType || "N/A",
    "Vehicle Number": rider.vehicleNumber || "N/A",
    Status: rider.status.toUpperCase(),
    Rating: rider.rating / 10,
    "Total Deliveries": rider.totalDeliveries,
    "Acceptance Rate": `${rider.acceptanceRate}%`,
    "Created At": new Date(rider.createdAt).toLocaleString(),
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Riders");
  
  const maxWidth = 30;
  const colWidths = Object.keys(worksheetData[0] || {}).map((key) => ({
    wch: Math.min(
      Math.max(
        key.length,
        ...worksheetData.map((row) => String(row[key as keyof typeof row]).length)
      ),
      maxWidth
    ),
  }));
  worksheet["!cols"] = colWidths;
  
  XLSX.writeFile(workbook, filename);
}

// Export users to Excel
export function exportUsersToExcel(users: any[], filename = "users-report.xlsx") {
  const worksheetData = users.map((user) => ({
    Name: user.name || "N/A",
    Email: user.email || "N/A",
    Phone: user.phone || "N/A",
    Role: user.role.toUpperCase(),
    "Login Method": user.loginMethod || "N/A",
    "Created At": new Date(user.createdAt).toLocaleString(),
    "Last Signed In": new Date(user.lastSignedIn).toLocaleString(),
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
  
  const maxWidth = 30;
  const colWidths = Object.keys(worksheetData[0] || {}).map((key) => ({
    wch: Math.min(
      Math.max(
        key.length,
        ...worksheetData.map((row) => String(row[key as keyof typeof row]).length)
      ),
      maxWidth
    ),
  }));
  worksheet["!cols"] = colWidths;
  
  XLSX.writeFile(workbook, filename);
}

