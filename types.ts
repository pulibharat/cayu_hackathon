
export enum UserRole {
  NURSE = 'NURSE',
  MIDWIFE = 'MIDWIFE'
}

export enum VaccineStatus {
  COMPLETED = 'COMPLETED',
  DUE = 'DUE',
  MISSED = 'MISSED',
  PENDING = 'PENDING'
}

export interface VaccineRecord {
  id: string;
  name: string;
  shortName: string;
  targetAge: string; // e.g., "At Birth", "6 Weeks"
  dueDate: string;
  completedDate?: string;
  status: VaccineStatus;
  providerId?: string;
  batchNumber?: string;
}

export interface GrowthPoint {
  ageMonths: number;
  weightKg: number;
  heightCm?: number;
  date: string;
}

export interface TrendPoint {
  month: string;
  completed: number;
  missed: number;
  due: number;
}

export interface BabyLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface Baby {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  weightAtBirth?: number;
  heightAtBirth?: number;
  parentName: string;
  parentPhone: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  village: string;
  address?: string;
  registrationDate: string;
  vaccines: VaccineRecord[];
  qrCode: string;
  weightHistory?: GrowthPoint[];
  location?: BabyLocation;
}

export interface ClinicStats {
  totalBabies: number;
  completedVaxCount: number;
  missedDoseCount: number;
  activeOutreachCount: number;
}
