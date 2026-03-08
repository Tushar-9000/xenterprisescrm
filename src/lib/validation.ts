export const isValidEmail = (email: string): boolean => {
  if (!email) return true; // optional fields
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const sanitizePhone = (value: string): string => {
  return value.replace(/[^0-9+\- ]/g, '');
};

export const isValidPhone = (phone: string): boolean => {
  if (!phone) return true;
  return /^[+]?[\d\s-]{7,15}$/.test(phone.trim());
};
