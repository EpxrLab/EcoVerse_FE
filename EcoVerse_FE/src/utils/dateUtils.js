/**
 * Converts a UTC date (from BE) to a local ISO string (for datetime-local input).
 * Format: YYYY-MM-DDTHH:mm
 * @param {string|Date} date 
 * @returns {string}
 */
export const toLocalISO = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  
  // Shift by timezone offset to get local time in ISO format
  const offset = d.getTimezoneOffset() * 60000;
  const localDate = new Date(d.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};

/**
 * Converts a local datetime-local value to a UTC ISO string (for BE).
 * @param {string} localString 
 * @returns {string|null}
 */
export const toUTCISO = (localString) => {
  if (!localString) return null;
  const d = new Date(localString);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
};

/**
 * Gets currently local time in datetime-local format.
 * @returns {string}
 */
export const getLocalNow = () => {
  return toLocalISO(new Date());
};
