export type PickupLocationItem = {
  id: string;
  label: string;
};

export const DEFAULT_PICKUP_LOCATIONS: PickupLocationItem[] = [
  { id: 'woodlands-tuas', label: 'Woodlands/Tuas Checkpoint' },
  { id: 'ciq', label: 'CIQ (Causeway)' },
  { id: 'senai', label: 'Senai Airport (JHB)' },
  { id: 'hotel-dropoff', label: 'Hotel Drop-off' },
  { id: 'office', label: 'Office Pickup' },
  { id: 'custom', label: 'Custom Location' },
];
