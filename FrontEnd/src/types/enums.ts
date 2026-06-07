// Shared Types & Enums
export enum AccountStatus {
  INVITED = "INVITED",
  CREATED = "CREATED",
  ACTIVE = "ACTIVE",
  TERMINATED = "TERMINATED",
  RESIGNED = "RESIGNED",
}

export enum UserRole {
  EMPLOYEE = "EMPLOYEE",
  MANAGER = "MANAGER",
  HR = "HR",
  HR_MANAGER = "HR_MANAGER",
  ADMIN = "ADMIN",
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  OTHER = "Other",
}

export enum EmploymentType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  INTERN = "INTERN",
  PROBATION = "PROBATION",
}

export enum DocumentCategory {
  IDENTITY = "IDENTITY",
  ADDRESS = "ADDRESS",
  EDUCATION = "EDUCATION",
  EMPLOYMENT = "EMPLOYMENT",
  FINANCIAL = "FINANCIAL",
  OTHER = "OTHER",
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  ON_LEAVE = "ON_LEAVE",
  HOLIDAY = "HOLIDAY",
  WEEK_OFF = "WEEK_OFF",
  HALF_DAY = "HALF_DAY",
  REGULARIZATION_PENDING = "REGULARIZATION_PENDING",
}
