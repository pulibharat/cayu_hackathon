
import { VaccineStatus, VaccineRecord } from './types';

// Cameroon EPI Schedule (WHO Aligned)
export const EPI_SCHEDULE_CONFIG = [
  { name: 'BCG', short: 'BCG', ageDays: 0 },
  { name: 'Oral Polio Vaccine 0', short: 'OPV-0', ageDays: 0 },
  { name: 'Penta 1', short: 'Penta-1', ageDays: 42 }, // 6 weeks
  { name: 'Pneumo 1', short: 'PCV-1', ageDays: 42 },
  { name: 'Rotarix 1', short: 'Rota-1', ageDays: 42 },
  { name: 'Oral Polio 1', short: 'OPV-1', ageDays: 42 },
  { name: 'Penta 2', short: 'Penta-2', ageDays: 70 }, // 10 weeks
  { name: 'Pneumo 2', short: 'PCV-2', ageDays: 70 },
  { name: 'Rotarix 2', short: 'Rota-2', ageDays: 70 },
  { name: 'Oral Polio 2', short: 'OPV-2', ageDays: 70 },
  { name: 'Penta 3', short: 'Penta-3', ageDays: 98 }, // 14 weeks
  { name: 'Pneumo 3', short: 'PCV-3', ageDays: 98 },
  { name: 'Inactivated Polio', short: 'IPV', ageDays: 98 },
  { name: 'Oral Polio 3', short: 'OPV-3', ageDays: 98 },
  { name: 'Measles-Rubella 1', short: 'MR-1', ageDays: 270 }, // 9 months
  { name: 'Yellow Fever', short: 'YF', ageDays: 270 },
];

export const calculateDueDate = (dob: string, ageDays: number): string => {
  const date = new Date(dob);
  date.setDate(date.getDate() + ageDays);
  return date.toISOString().split('T')[0];
};

export const generateInitialVaxRecord = (dob: string): VaccineRecord[] => {
  return EPI_SCHEDULE_CONFIG.map((vax, index) => {
    const dueDate = calculateDueDate(dob, vax.ageDays);
    const today = new Date().toISOString().split('T')[0];
    
    let status = VaccineStatus.PENDING;
    if (dueDate <= today) {
       status = VaccineStatus.DUE;
    }

    return {
      id: `v-${index}-${Math.random().toString(36).substr(2, 5)}`,
      name: vax.name,
      shortName: vax.short,
      targetAge: vax.ageDays === 0 ? 'Birth' : `${vax.ageDays / 7} Weeks`,
      dueDate,
      status
    };
  });
};
