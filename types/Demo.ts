export type DemoUser = {
  userId: string;
  phoneNumber: string;
  fullName: string;
  email: string;
  dateOfBirth: string | null;
  gender: "male" | "female" | null;
  avatarUrl: string | null;
  isActive: boolean;
  role: "User" | "Admin";
  createdAt: string;
};

export type PostDemo = {
  phoneNumber: string;
  fullName: string;
  email: string;
  dateOfBirth: string | null;
  gender: "male" | "female" | null;
  avatarUrl: string | null;
  isActive: boolean;
  role: "User" | "Admin";
}