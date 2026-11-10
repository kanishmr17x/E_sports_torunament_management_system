/**
 * Indian Localization Formatters for Esports Management System
 * 
 * Enforces Indian localization standards:
 *  - Currency: INR (₹) with Indian digit grouping (e.g. ₹15,000, ₹1,00,000, ₹10,00,000, ₹1,00,00,000)
 *  - Locale: en-IN
 *  - Timezone: Asia/Kolkata (Indian Standard Time - IST)
 *  - Dates: DD MMM YYYY or DD/MM/YYYY
 *  - Times: 12-hour format with AM/PM and IST timezone designation
 *  - Numbers: Indian grouping (lakhs, crores)
 */

/**
 * Format monetary values into Indian Rupees (INR / ₹)
 * Handles numbers, strings, and non-monetary fallback text gracefully.
 * 
 * @param {number|string} amount - Monetary amount to format
 * @param {object} options - Formatting options
 * @param {string} [options.fallback] - Value to return if amount is falsy or invalid
 * @param {number} [options.decimals] - Force specific fraction digits
 * @param {boolean} [options.compact] - Use compact notation (e.g. ₹1.5L, ₹1Cr)
 * @returns {string} Formatted INR currency string (e.g. "₹1,50,000")
 */
export const formatINR = (amount, options = {}) => {
  if (amount === null || amount === undefined || amount === "") {
    return options.fallback !== undefined ? options.fallback : "₹0";
  }

  // Handle strings like "Free Entry", "Trophy / Glory", "Ranked", "TBA"
  if (typeof amount === "string") {
    const trimmed = amount.trim();
    // If it's pure non-numeric text without numbers, preserve it
    if (/^[A-Za-z\s/&—•-]+$/.test(trimmed)) {
      return trimmed;
    }
    // Clean currency prefixes ($ or ₹ or commas or USD) to parse numeric value
    const cleaned = trimmed.replace(/[^0-9.-]/g, "");
    if (cleaned === "" || isNaN(Number(cleaned))) {
      return trimmed;
    }
    amount = Number(cleaned);
  }

  const num = Number(amount);
  if (isNaN(num)) {
    return options.fallback !== undefined ? options.fallback : "₹0";
  }

  // Determine decimals: if whole number, 0 decimals; if floating point, 2 decimals (standard currency display)
  const isWhole = num % 1 === 0;
  const maxDigits = options.decimals !== undefined 
    ? options.decimals 
    : (isWhole ? 0 : 2);
  const minDigits = options.decimals !== undefined 
    ? options.decimals 
    : (isWhole ? 0 : 2);

  try {
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: maxDigits,
      minimumFractionDigits: minDigits,
    });
    return formatter.format(num);
  } catch (err) {
    // Robust fallback with Indian regex grouping if Intl fails
    const parts = num.toFixed(maxDigits).split(".");
    let intPart = parts[0];
    const decPart = parts.length > 1 ? `.${parts[1]}` : "";
    const lastThree = intPart.substring(intPart.length - 3);
    const otherNumbers = intPart.substring(0, intPart.length - 3);
    if (otherNumbers !== "") {
      intPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
    }
    return `₹${intPart}${decPart}`;
  }
};

/**
 * Format large numbers using Indian numbering system (Lakhs, Crores)
 * e.g. 1,000 | 10,000 | 1,00,000 | 10,00,000 | 1,00,00,000
 * 
 * @param {number|string} value - Number to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted number string
 */
export const formatIndianNumber = (value, options = {}) => {
  if (value === null || value === undefined || value === "") {
    return options.fallback !== undefined ? options.fallback : "0";
  }
  const num = Number(value);
  if (isNaN(num)) return String(value);

  try {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: options.decimals !== undefined ? options.decimals : 0,
    }).format(num);
  } catch (e) {
    return String(num);
  }
};

/**
 * Format date in Indian Standard Time (IST / Asia/Kolkata)
 * Default display: "08 Nov 2026" or "08/11/2026"
 * 
 * @param {Date|string|number} date - Date to format
 * @param {object} options - Formatting options
 * @param {string} [options.format="medium"] - "short" (DD/MM/YYYY), "medium" (DD MMM YYYY), "long" (DD MMMM YYYY)
 * @param {string} [options.fallback="TBD"] - Fallback string if date is missing/invalid
 * @returns {string} Formatted date string in IST
 */
export const formatDateIST = (date, options = {}) => {
  const fallback = options.fallback || "TBD";
  if (!date) return fallback;

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return fallback;

  const style = options.format || "medium";

  try {
    if (style === "short") {
      return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }).format(parsed);
    }

    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: style === "long" ? "long" : "short",
      year: "numeric"
    }).format(parsed);
  } catch (e) {
    return parsed.toLocaleDateString();
  }
};

/**
 * Format time in 12-hour AM/PM format in Indian Standard Time (IST)
 * 
 * @param {Date|string|number} date - Date/time to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted time string (e.g. "04:30 PM")
 */
export const formatTimeIST = (date, options = {}) => {
  const fallback = options.fallback || "TBD";
  if (!date) return fallback;

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return fallback;

  try {
    const formatted = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(parsed).replace(/\b(am|pm)\b/gi, (m) => m.toUpperCase());
    return formatted;
  } catch (e) {
    return fallback;
  }
};

/**
 * Format date and time together with IST timezone marker
 * e.g. "08 Nov 2026, 04:30 PM IST"
 * 
 * @param {Date|string|number} date - Date/time to format
 * @param {object} options - Formatting options
 * @param {boolean} [options.includeZone=true] - Whether to append "IST"
 * @param {string} [options.fallback="TBD"] - Fallback string
 * @returns {string} Formatted datetime string in IST
 */
export const formatDateTimeIST = (date, options = {}) => {
  const fallback = options.fallback || "TBD";
  if (!date) return fallback;

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return fallback;

  const includeZone = options.includeZone !== false;

  try {
    const formatted = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: options.month || "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(parsed).replace(/\b(am|pm)\b/gi, (m) => m.toUpperCase());

    return includeZone ? `${formatted} IST` : formatted;
  } catch (e) {
    return parsed.toLocaleString();
  }
};

/**
 * Format date range for tournament schedules in IST
 * e.g. "12 Nov 2026 – 16 Nov 2026 IST" or "12 – 16 Nov 2026 IST"
 * 
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {string} Formatted schedule interval
 */
export const formatScheduleIST = (startDate, endDate) => {
  if (!startDate && !endDate) return "Schedule TBD";
  if (!endDate) return `${formatDateIST(startDate)} (Kickoff)`;
  if (!startDate) return `Until ${formatDateIST(endDate)}`;

  const s = formatDateIST(startDate);
  const e = formatDateIST(endDate);
  if (s === e) return `${s} (Single Day)`;
  return `${s} – ${e}`;
};

export default {
  formatINR,
  formatIndianNumber,
  formatDateIST,
  formatTimeIST,
  formatDateTimeIST,
  formatScheduleIST
};
