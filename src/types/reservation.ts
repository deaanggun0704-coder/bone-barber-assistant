export type ReservationDraft = {
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  barber: string;
  notes: string;
};

export type ReservationField = keyof ReservationDraft;
export type ReservationErrors = Partial<Record<ReservationField, string>>;
