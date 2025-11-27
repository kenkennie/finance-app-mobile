/* import * as XLSX from "xlsx";
import Share from "react-native-share";
import { Transaction } from "../types/filter.types";

// Dynamic import for react-native-fs to avoid initialization issues
let RNFS: any = null;
try {
  RNFS = require("react-native-fs");
} catch (error) {
  console.warn("react-native-fs not available:", error);
}

export interface ExportOptions {
  includeSummary: boolean;
  groupByCategory: boolean;
  includeCharts: boolean;
}

// PDF export removed due to compatibility issues with react-native-html-to-pdf
// export const exportToPDF = async (
//   transactions: Transaction[],
//   options: ExportOptions,
//   dateRange: string
// ): Promise<string> => {
//   // Implementation removed
//   throw new Error("PDF export is currently not available");
// };

export const exportToExcel = async (
  transactions: Transaction[],
  dateRange: string
): Promise<string> => {
  if (!RNFS || !RNFS.DocumentDirectoryPath) {
    throw new Error("React Native FS is not available");
  }

  // Summary Sheet
  const totalIncome = transactions
    .filter((t) => t.transactionType === "INCOME")
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  const totalExpenses = Math.abs(
    transactions
      .filter((t) => t.transactionType === "EXPENSE")
      .reduce((sum, t) => sum + (t.totalAmount || 0), 0)
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
    ["Date", "Title", "Notes", "Amount", "Type", "Status"],
    ...transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.title,
      t.notes,
      Math.abs(t.totalAmount || 0).toFixed(2),
      t.transactionType === "INCOME" ? "Income" : "Expense",
      typeof t.status === "string" ? t.status : t.status?.name || "",
    ]),
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  const wsTransactions = XLSX.utils.aoa_to_sheet(transactionsData);

  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
  XLSX.utils.book_append_sheet(wb, wsTransactions, "Transactions");

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
  if (!RNFS || !RNFS.DocumentDirectoryPath) {
    throw new Error("React Native FS is not available");
  }

  const csvData = [
    ["Date", "Title", "Notes", "Amount", "Type", "Status"],
    ...transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.title,
      t.notes,
      Math.abs(t.totalAmount || 0).toFixed(2),
      t.transactionType,
      typeof t.status === "string" ? t.status : t.status?.name || "",
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
 */
