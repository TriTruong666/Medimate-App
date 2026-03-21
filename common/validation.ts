/**
 * Validation utility for the Medimate App
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (
  password: string
): { isValid: boolean; message: string } => {
  if (!password) {
    return { isValid: false, message: "Mật khẩu không được để trống" };
  }
  if (password.length < 8) {
    return { isValid: false, message: "Mật khẩu phải có ít nhất 8 ký tự" };
  }
  return { isValid: true, message: "" };
};

export const validateLogin = (
  identifier: string,
  password: string
): { isValid: boolean; message: string; field?: "identifier" | "password" } => {
  const trimmedIdentifier = identifier.trim();

  if (!trimmedIdentifier) {
    return {
      isValid: false,
      message: "Vui lòng nhập Email",
      field: "identifier",
    };
  }

  if (!validateEmail(trimmedIdentifier)) {
    return {
      isValid: false,
      message: "Định dạng Email không hợp lệ",
      field: "identifier",
    };
  }

  if (!password) {
    return {
      isValid: false,
      message: "Vui lòng nhập mật khẩu",
      field: "password",
    };
  }

  // const passwordCheck = validatePassword(password);
  // if (!passwordCheck.isValid) {
  //   return { isValid: false, message: passwordCheck.message, field: 'password' };
  // }

  return { isValid: true, message: "" };
};

export const validateRegister = (form: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}): { isValid: boolean; message: string; field?: string } => {
  if (!form.fullName.trim()) {
    return {
      isValid: false,
      message: "Họ và tên không được để trống",
      field: "fullName",
    };
  }

  if (!form.email.trim()) {
    return {
      isValid: false,
      message: "Email không được để trống",
      field: "email",
    };
  }

  if (!validateEmail(form.email.trim())) {
    return {
      isValid: false,
      message: "Định dạng Email không hợp lệ",
      field: "email",
    };
  }

  const phoneRegex = /^(0|84)(3|5|7|8|9)([0-9]{8})$/;
  if (form.phoneNumber && !phoneRegex.test(form.phoneNumber)) {
    return {
      isValid: false,
      message: "Số điện thoại không hợp lệ",
      field: "phoneNumber",
    };
  }

  const passwordCheck = validatePassword(form.password);
  if (!passwordCheck.isValid) {
    return {
      isValid: false,
      message: passwordCheck.message,
      field: "password",
    };
  }

  if (form.password !== form.confirmPassword) {
    return {
      isValid: false,
      message: "Mật khẩu nhập lại không khớp",
      field: "confirmPassword",
    };
  }

  return { isValid: true, message: "" };
};

export const validateHealthProfile = (
  height: string,
  weight: string
): { isValid: boolean; message: string } => {
  const h = Number(height);
  const w = Number(weight);
  if (!height || isNaN(h) || h <= 0) {
    return { isValid: false, message: "Chiều cao không hợp lệ" };
  }
  if (!weight || isNaN(w) || w <= 0) {
    return { isValid: false, message: "Cân nặng không hợp lệ" };
  }
  return { isValid: true, message: "" };
};

export const validateHealthCondition = (
  name: string
): { isValid: boolean; message: string } => {
  if (!name.trim()) {
    return { isValid: false, message: "Tên bệnh/tình trạng không được để trống" };
  }
  return { isValid: true, message: "" };
};

export const validateMemberProfile = (
  fullName: string,
  dateOfBirth: string
): { isValid: boolean; message: string } => {
  if (!fullName.trim()) {
    return { isValid: false, message: "Họ và tên không được để trống" };
  }

  if (dateOfBirth) {
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(dateOfBirth)) {
      return { isValid: false, message: "Ngày sinh không đúng định dạng YYYY-MM-DD" };
    }
  }

  return { isValid: true, message: "" };
};

