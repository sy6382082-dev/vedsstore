export function validateEmail(email: string): string | null {
  if (!email?.trim()) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return 'Please enter a valid email address';
  if (email.length > 254) return 'Email address is too long';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 128) return 'Password is too long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone) return null; // phone is optional
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (!/^(\+91|91)?[6-9]\d{9}$/.test(cleaned)) {
    return 'Please enter a valid Indian mobile number (10 digits starting with 6–9)';
  }
  return null;
}

export function validateName(name: string, field = 'Name'): string | null {
  if (!name?.trim() || name.trim().length < 2) return `${field} must be at least 2 characters`;
  if (name.trim().length > 100) return `${field} is too long`;
  return null;
}

export function passwordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}

