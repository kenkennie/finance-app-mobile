/**
 * Utility functions for formatting data, especially for on-the-fly calculations
 * and data not sourced from the database.
 */

/**
 * Safely adds an amount to a sum, ensuring the amount is a number.
 * @param sum - The current sum
 * @param amount - The amount to add (can be any type)
 * @returns The updated sum
 */
export const safeAdd = (sum: number, amount: any): number => {
  return sum + (typeof amount === "number" ? amount : 0);
};

/**
 * Formats a number as currency.
 * @param amount - The amount to format
 * @param currency - The currency code
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string,
  locale: string = "en-US"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Formats a date.
 * @param date - The date to format (Date object or string)
 * @param options - Intl.DateTimeFormatOptions for customization
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
  locale: string = "en-US"
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, options);
};

/**
 * Safely sums an array of numbers, ignoring non-numeric values.
 * @param amounts - Array of amounts to sum
 * @returns The total sum
 */
export const safeSum = (amounts: any[]): number => {
  return amounts.reduce((sum, amount) => safeAdd(sum, amount), 0);
};

/**
 * Formats a number with a fixed number of decimal places and thousands separators.
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns Formatted number string
 */
export const formatNumber = (
  num: number,
  decimals: number = 2,
  locale: string = "en-US"
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};
