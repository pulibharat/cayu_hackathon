
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
  date: string;
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
  parentName: string;
  parentPhone: string;
  village: string;
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
