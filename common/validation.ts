export function isRequired(value: string) {
  return value.trim().length > 0;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhoneVN(phone: string) {
  // Cho phép 10-11 số, bỏ khoảng trắng/dấu chấm/dấu gạch
  const normalized = phone.replace(/[^\d]/g, "");
  return (
    /^(0|\+84)\d{9,10}$/.test(normalized) || /^\d{10,11}$/.test(normalized)
  );
}
