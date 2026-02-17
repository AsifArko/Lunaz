// Value formatters for settings

export const formatters = {
  currency: (
    value: number,
    currency: string = 'BDT',
    position: 'before' | 'after' = 'before'
  ): string => {
    const symbols: Record<string, string> = {
      BDT: '৳',
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      JPY: '¥',
      CNY: '¥',
    };

    const symbol = symbols[currency] || currency;
    const formatted = value.toLocaleString();

    return position === 'before' ? `${symbol}${formatted}` : `${formatted}${symbol}`;
  },

  percentage: (value: number): string => {
    return `${value}%`;
  },

  phone: (value: string): string => {
    // Basic formatting - remove non-digits and format
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 10)
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `+${digits.slice(0, digits.length - 10)} ${digits.slice(-10, -7)}-${digits.slice(-7, -4)}-${digits.slice(-4)}`;
  },

  date: (value: string | Date, format: string = 'DD/MM/YYYY'): string => {
    const date = typeof value === 'string' ? new Date(value) : value;
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`;
      case 'DD.MM.YYYY':
        return `${day}.${month}.${year}`;
      default:
        return `${day}/${month}/${year}`;
    }
  },

  time: (value: string, format: '12h' | '24h' = '12h'): string => {
    const [hours, minutes] = value.split(':').map(Number);

    if (format === '24h') {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  },

  bytes: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  truncate: (value: string, maxLength: number): string => {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength)}...`;
  },

  capitalize: (value: string): string => {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  },

  slugify: (value: string): string => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  maskSecret: (value: string, visibleChars: number = 4): string => {
    if (value.length <= visibleChars) return '*'.repeat(value.length);
    return '*'.repeat(value.length - visibleChars) + value.slice(-visibleChars);
  },

  maskEmail: (email: string): string => {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal =
      local.length > 2
        ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
        : '*'.repeat(local.length);
    return `${maskedLocal}@${domain}`;
  },
};

export default formatters;
