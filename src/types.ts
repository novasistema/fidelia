export type UserRole = 'client' | 'admin' | 'creator';

export interface CustomerUser {
  id: string;
  name: string;
  lastName: string;
  email: string;
  dni: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  points: number;
  totalSpent: number;
  tierId: string; // e.g. 'bronce', 'plata', 'oro', 'diamante'
  createdAt: string;
  referralCode: string;
  referredBy?: string;
  referralRewarded?: boolean;
  totalEarned?: number; // puntos ganados en toda la historia (define el nivel)
  avatarUrl?: string;
}

export interface StoreSettings {
  id?: string;
  name: string;
  brandName: string;
  logoUrl?: string;
  primaryColor: string;
  pointsPerPeso: number; // e.g. 1 point for every $100 spent
  welcomePoints?: number;
  referralPoints?: number;
  currencySymbol: string;
  whatsappNumber?: string;
  contactEmail?: string;
  address?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  poweredByText?: string;
  poweredByUrl?: string;
  isSystemActive?: boolean;
  suspensionReason?: string;
  subscriptionDueDate?: string;
  clientPlanName?: string;
  monthlyFee?: number;
  branches?: Branch[];
  bonusRules?: BonusRule[];
  tiers?: TierLevel[];
  popupBanner?: PopupBanner;
  createdAt?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  isMain?: boolean;
}

export interface RewardItem {
  id: string;
  title: string;
  category: string;
  description: string;
  pointsCost: number;
  imageUrl: string;
  stock: number;
  isActive: boolean;
  terms?: string;
  originalPrice?: number; // monetary value equivalence
}

export interface RedemptionVoucher {
  id: string;
  code: string; // e.g. CANJE-88291
  customerId: string;
  customerName: string;
  rewardId: string;
  rewardTitle: string;
  pointsSpent: number;
  createdAt: string;
  status: 'pending' | 'used' | 'cancelled';
  usedAt?: string;
  usedBy?: string;
  createdAtIso?: string;
}

export interface PointMovement {
  id: string;
  customerId: string;
  customerName: string;
  type: 'earned_purchase' | 'earned_bonus' | 'earned_referral' | 'earned_survey' | 'spent_redemption' | 'spent_raffle' | 'admin_adjust';
  points: number; // positive for earned, negative for spent
  description: string;
  date: string;
  createdAt?: string;
  amountPeso?: number;
  detail?: string;
  staffEmail?: string;
}

export interface PopupBanner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaAction?: 'catalog' | 'surveys' | 'raffles' | 'link';
  ctaLink?: string;
  isActive: boolean;
  showOncePerSession?: boolean;
}

export interface BonusRule {
  id: string;
  title: string;
  description: string;
  multiplier: number; // e.g. 2 for 2x points
  extraPoints: number; // fixed extra points
  daysOfWeek: number[]; // 0=Sun, 1=Mon, 2=Tue...
  isActive: boolean;
  minPurchaseAmount?: number;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'text' | 'rating';
  options?: string[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  isActive: boolean;
  questions: SurveyQuestion[];
  completedCustomerIds: string[];
}

export interface Raffle {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  entryCostPoints: number;
  startDate: string;
  endDate: string;
  winnerCustomerName?: string;
  winnerCustomerId?: string;
  isActive: boolean;
  participants: { customerId: string; customerName: string; entries: number; date: string }[];
  drawnAt?: string;
}

export interface StaffMember {
  email: string;
  role: 'owner' | 'cashier';
  name?: string;
  addedAt?: string;
}

export interface StaffStore {
  storeId: string;
  role: 'owner' | 'cashier';
  name: string;
  isSystemActive: boolean;
}

export interface TierLevel {
  id: string;
  name: string; // Bronce, Plata, Oro, Diamante
  minPoints: number;
  color: string;
  badgeBg: string;
  multiplier: number; // e.g. 1.0, 1.2, 1.5, 2.0
  perks: string[];
}
