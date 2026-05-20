export type PickupLocationItem = {
  id: string;
  label: string;
};

export const DEFAULT_PICKUP_LOCATIONS: PickupLocationItem[] = [
  { id: 'office', label: 'Office Pickup' },
  { id: 'airport', label: 'Airport Pickup' },
  { id: 'custom', label: 'Custom Location' },
];
