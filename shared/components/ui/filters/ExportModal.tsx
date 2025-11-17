import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";

import { Transaction } from "@/shared/types/filter.types";
import { Typography } from "../Typography";
import { colors } from "@/theme/colors";
import { borderRadius, shadows, spacing } from "@/theme/spacing";
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  shareFile,
} from "@/shared/utils/exportUtils";

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  transactions: Transaction[];
  dateRange: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  transactions,
  dateRange,
}) => {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    includeSummary: true,
    groupByCategory: true,
    includeCharts: false,
  });
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportedFile, setExportedFile] = useState("");

  const handleExport = async (format: "pdf" | "excel" | "csv") => {
    setLoading(true);
    try {
      let filePath = "";

      if (format === "pdf") {
        filePath = await exportToPDF(transactions, options, dateRange);
      } else if (format === "excel") {
        filePath = await exportToExcel(transactions, dateRange);
      } else {
        filePath = await exportToCSV(transactions);
      }

      setExportedFile(filePath);
      setExportSuccess(true);
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    await shareFile(exportedFile, "Transaction Report");
    handleClose();
  };

  const handleClose = () => {
    setExportSuccess(false);
    setExportedFile("");
    onClose();
  };

  if (exportSuccess) {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent
      >
        <View style={styles.overlay}>
          <View style={styles.successModal}>
            <Typography variant="h1">✅</Typography>
            <Typography
              variant="h3"
              weight="bold"
              style={styles.successTitle}
            >
              Export Successful!
            </Typography>
            <Typography
              variant="body2"
              color={colors.gray[600]}
              align="center"
            >
              Your report has been generated
            </Typography>

            <View style={styles.successActions}>
              <TouchableOpacity
                style={styles.successButton}
                onPress={handleShare}
              >
                <Typography
                  variant="body1"
                  weight="semibold"
                  color={colors.primary}
                >
                  Share
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.successButton}
                onPress={handleClose}
              >
                <Typography
                  variant="body1"
                  weight="semibold"
                  color={colors.gray[600]}
                >
                  Done
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Typography
              variant="h3"
              weight="bold"
            >
              Export Transactions
            </Typography>
            <TouchableOpacity onPress={handleClose}>
              <Typography variant="h4">✕</Typography>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.summary}>
              <Typography
                variant="body1"
                weight="semibold"
                style={styles.summaryTitle}
              >
                📊 Report Summary
              </Typography>
              <Typography
                variant="body2"
                color={colors.gray[600]}
              >
                • {transactions.length} transactions
              </Typography>
              <Typography
                variant="body2"
                color={colors.gray[600]}
              >
                • {dateRange}
              </Typography>
            </View>

            <Typography
              variant="body1"
              weight="semibold"
              style={styles.sectionTitle}
            >
              Export Format
            </Typography>

            <TouchableOpacity
              style={styles.formatOption}
              onPress={() => handleExport("pdf")}
              disabled={loading}
            >
              <View style={styles.formatLeft}>
                <Typography variant="h3">📄</Typography>
                <View style={styles.formatInfo}>
                  <Typography
                    variant="body1"
                    weight="semibold"
                  >
                    PDF Report
                  </Typography>
                  <Typography
                    variant="caption"
                    color={colors.gray[500]}
                  >
                    Professional formatted report
                  </Typography>
                </View>
              </View>
              <Typography
                variant="body1"
                color={colors.gray[400]}
              >
                ›
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.formatOption}
              onPress={() => handleExport("excel")}
              disabled={loading}
            >
              <View style={styles.formatLeft}>
                <Typography variant="h3">📊</Typography>
                <View style={styles.formatInfo}>
                  <Typography
                    variant="body1"
                    weight="semibold"
                  >
                    Excel Spreadsheet
                  </Typography>
                  <Typography
                    variant="caption"
                    color={colors.gray[500]}
                  >
                    Editable format (.xlsx)
                  </Typography>
                </View>
              </View>
              <Typography
                variant="body1"
                color={colors.gray[400]}
              >
                ›
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.formatOption}
              onPress={() => handleExport("csv")}
              disabled={loading}
            >
              <View style={styles.formatLeft}>
                <Typography variant="h3">📋</Typography>
                <View style={styles.formatInfo}>
                  <Typography
                    variant="body1"
                    weight="semibold"
                  >
                    CSV File
                  </Typography>
                  <Typography
                    variant="caption"
                    color={colors.gray[500]}
                  >
                    Simple comma-separated values
                  </Typography>
                </View>
              </View>
              <Typography
                variant="body1"
                color={colors.gray[400]}
              >
                ›
              </Typography>
            </TouchableOpacity>

            <Typography
              variant="body1"
              weight="semibold"
              style={styles.sectionTitle}
            >
              Options (PDF only)
            </Typography>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() =>
                setOptions({
                  ...options,
                  includeSummary: !options.includeSummary,
                })
              }
            >
              <View
                style={[
                  styles.checkbox,
                  options.includeSummary && styles.checkboxActive,
                ]}
              >
                {options.includeSummary && (
                  <Typography
                    variant="body2"
                    color={colors.text.white}
                  >
                    ✓
                  </Typography>
                )}
              </View>
              <Typography variant="body1">
                Include summary statistics
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() =>
                setOptions({
                  ...options,
                  groupByCategory: !options.groupByCategory,
                })
              }
            >
              <View
                style={[
                  styles.checkbox,
                  options.groupByCategory && styles.checkboxActive,
                ]}
              >
                {options.groupByCategory && (
                  <Typography
                    variant="body2"
                    color={colors.text.white}
                  >
                    ✓
                  </Typography>
                )}
              </View>
              <Typography variant="body1">Group by category</Typography>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />
              <Typography
                variant="body1"
                weight="semibold"
                style={styles.loadingText}
              >
                Generating export...
              </Typography>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: colors.text.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    padding: spacing.base,
  },
  summary: {
    backgroundColor: colors.gray[50],
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  formatOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.text.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  formatLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  formatInfo: {
    flex: 1,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
  },
  successModal: {
    backgroundColor: colors.text.white,
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    margin: spacing.base,
    alignItems: "center",
  },
  successTitle: {
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  successActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
    width: "100%",
  },
  successButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
