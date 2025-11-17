import * as XLSX from "xlsx";
import {
  generatePDF,
  type PDFOptions,
  type PDFResult,
} from "react-native-html-to-pdf";
import * as RNFS from "react-native-fs";
import Share from "react-native-share";
import { Transaction } from "../types/filter.types";

export interface ExportOptions {
  includeSummary: boolean;
  groupByCategory: boolean;
  includeCharts: boolean;
}

export const exportToPDF = async (
  transactions: Transaction[],
  options: ExportOptions,
  dateRange: string
): Promise<string> => {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(
    transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const netAmount = totalIncome - totalExpenses;

  // Group by category
  const categoryBreakdown = transactions.reduce((acc, t) => {
    if (!acc[t.category]) {
      acc[t.category] = { count: 0, total: 0 };
    }
    acc[t.category].count++;
    acc[t.category].total += Math.abs(t.amount);
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  // Generate HTML
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Transaction Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 40px;
            color: #111827;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #E5E7EB;
          }
          .header h1 {
            color: #0066FF;
            margin: 0;
            font-size: 32px;
          }
          .header p {
            color: #6B7280;
            margin: 10px 0 0 0;
          }
          .summary {
            background: #F9FAFB;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #E5E7EB;
          }
          .summary-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 18px;
          }
          .summary-label {
            color: #6B7280;
          }
          .amount-positive {
            color: #10B981;
            font-weight: 600;
          }
          .amount-negative {
            color: #EF4444;
            font-weight: 600;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            margin: 30px 0 15px 0;
            color: #111827;
          }
          .category-item {
            display: flex;
            justify-content: space-between;
            padding: 12px;
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            margin-bottom: 8px;
          }
          .transaction-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .transaction-table th {
            background: #F3F4F6;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #E5E7EB;
          }
          .transaction-table td {
            padding: 12px;
            border-bottom: 1px solid #E5E7EB;
          }
          .date-group {
            font-weight: bold;
            background: #F9FAFB;
            padding: 8px 12px;
            margin-top: 15px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #9CA3AF;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Transaction Report</h1>
          <p>${dateRange}</p>
          <p>Generated on ${new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</p>
        </div>

        ${
          options.includeSummary
            ? `
          <div class="summary">
            <div class="summary-row">
              <span class="summary-label">Total Transactions</span>
              <span>${transactions.length}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Total Income</span>
              <span class="amount-positive">+${totalIncome.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Total Expenses</span>
              <span class="amount-negative">-${totalExpenses.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Net Amount</span>
              <span class="${
                netAmount >= 0 ? "amount-positive" : "amount-negative"
              }">
                ${netAmount >= 0 ? "+" : ""}${netAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <h2 class="section-title">Top Categories</h2>
          ${topCategories
            .map(
              ([category, data]) => `
            <div class="category-item">
              <div>
                <strong>${category}</strong>
                <span style="color: #6B7280; margin-left: 8px;">${
                  data.count
                } transactions</span>
              </div>
              <div>${data.total.toFixed(2)}</div>
            </div>
          `
            )
            .join("")}
        `
            : ""
        }

        <h2 class="section-title">Transaction Details</h2>
        <table class="transaction-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Account</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${transactions
              .map(
                (t) => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}</td>
                <td>${t.description}</td>
                <td>${t.category}</td>
                <td>${t.account}</td>
                <td class="${
                  t.type === "income" ? "amount-positive" : "amount-negative"
                }">
                  ${t.type === "income" ? "+" : "-"}${Math.abs(
                  t.amount
                ).toFixed(2)}
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          <p>This report was generated by Finance Tracker App</p>
        </div>
      </body>
    </html>
  `;

  const options_pdf: PDFOptions = {
    html,
    fileName: `Transactions_${Date.now()}`,
    directory: "Documents",
  };

  const file: PDFResult = await generatePDF(options_pdf);
  return file.filePath || "";
};

export const exportToExcel = async (
  transactions: Transaction[],
  dateRange: string
): Promise<string> => {
  // Summary Sheet
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(
    transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const summaryData = [
    ["Transaction Report"],
    ["Period", dateRange],
    ["Generated", new Date().toLocaleDateString()],
    [],
    ["Summary"],
    ["Total Transactions", transactions.length],
    ["Total Income", `${totalIncome.toFixed(2)}`],
    ["Total Expenses", `${totalExpenses.toFixed(2)}`],
    ["Net Amount", `${(totalIncome - totalExpenses).toFixed(2)}`],
  ];

  // Transactions Sheet
  const transactionsData = [
    [
      "Date",
      "Description",
      "Category",
      "Account",
      "Amount",
      "Type",
      "Status",
      "Tags",
    ],
    ...transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.category,
      t.account,
      Math.abs(t.amount).toFixed(2),
      t.type === "income" ? "Income" : "Expense",
      t.status,
      t.tags?.join(", ") || "",
    ]),
  ];

  // Category Breakdown Sheet
  const categoryBreakdown = transactions.reduce((acc, t) => {
    if (!acc[t.category]) {
      acc[t.category] = { count: 0, total: 0 };
    }
    acc[t.category].count++;
    acc[t.category].total += Math.abs(t.amount);
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  const categoryData = [
    ["Category", "Transaction Count", "Total Amount"],
    ...Object.entries(categoryBreakdown).map(([category, data]) => [
      category,
      data.count,
      `${data.total.toFixed(2)}`,
    ]),
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  const wsTransactions = XLSX.utils.aoa_to_sheet(transactionsData);
  const wsCategories = XLSX.utils.aoa_to_sheet(categoryData);

  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
  XLSX.utils.book_append_sheet(wb, wsTransactions, "Transactions");
  XLSX.utils.book_append_sheet(wb, wsCategories, "Category Breakdown");

  // Write to file
  const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

  // Save file (using react-native-fs)
  const filePath = `${
    RNFS.DocumentDirectoryPath
  }/Transactions_${Date.now()}.xlsx`;
  await RNFS.writeFile(filePath, wbout, "base64");

  return filePath;
};

export const exportToCSV = async (
  transactions: Transaction[]
): Promise<string> => {
  const csvData = [
    ["Date", "Description", "Category", "Account", "Amount", "Type", "Status"],
    ...transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.category,
      t.account,
      Math.abs(t.amount).toFixed(2),
      t.type,
      t.status,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(csvData);
  const csv = XLSX.utils.sheet_to_csv(ws);

  const filePath = `${
    RNFS.DocumentDirectoryPath
  }/Transactions_${Date.now()}.csv`;
  await RNFS.writeFile(filePath, csv, "utf8");

  return filePath;
};

export const shareFile = async (filePath: string, title: string) => {
  try {
    await Share.open({
      url: `file://${filePath}`,
      title,
      subject: title,
    });
  } catch (error) {
    console.log("Share cancelled or error:", error);
  }
};
