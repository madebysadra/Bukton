export type ServiceCategory = 'hair' | 'skin' | 'massage' | 'fitness' | 'photography' | 'style';

export interface ServiceItem {
  id: string;
  title: string;
  durationMinutes: number;
  priceToman: number;
  description: string;
}

export interface Specialist {
  id: string;
  name: string;
  specialty: string;
  category: ServiceCategory;
  categoryLabel: string;
  location: string;
  area: string;
  city: string;
  rating: number;
  reviewsCount: number;
  bookingCount: number;
  startingPriceToman: number;
  image: string;
  bio: string;
  address: string;
  isVerified?: boolean;
  nextAvailableTime?: string;
  availableDays: {
    dateKey: string;
    dayName: string;
    dayNumber: string;
    monthName: string;
    slots: string[];
  }[];
  services: ServiceItem[];
}

export interface BookingState {
  specialist: Specialist;
  selectedService: ServiceItem;
  selectedDay: string;
  selectedSlot: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  bookingCode?: string;
}

export interface SearchQuery {
  service: string;
  location: string;
  date: string;
}
