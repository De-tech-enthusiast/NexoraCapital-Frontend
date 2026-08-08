// ============================================
// NEXORA CAPITAL - Type Definitions
// ============================================

// API Response Format (Backend Contract)
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  country: string;
  preferredCurrency: string;
  role?: 'user' | 'admin';
  verificationStatus: 'verified' | 'pending' | 'unverified';
  createdAt: string;
  updatedAt: string;
}

// Investment Goal Types
export interface InvestmentGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  duration: number; // in months
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: number; // percentage
}

// Portfolio Types
export interface Portfolio {
  id: string;
  userId: string;
  currentValue: number;
  totalInvested: number;
  totalProfit: number;
  profitPercentage: number;
  goalId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioAllocation {
  asset: string;
  percentage: number;
  value: number;
  color: string;
}

export interface PortfolioPerformance {
  date: string;
  value: number;
  invested: number;
}

// Transaction Types
export type TransactionType = 'deposit' | 'withdrawal' | 'dividend' | 'fee' | 'adjustment';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  userId: string;
  reference: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  metadata?: {
    txHash?: string;
    network?: string;
    walletAddress?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Deposit Types
export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  network: string;
  walletAddress: string;
  txHash: string | null;
  status: 'pending' | 'confirming' | 'completed' | 'failed';
  confirmations: number;
  requiredConfirmations: number;
  createdAt: string;
  updatedAt: string;
}

export interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  networks: CryptoNetwork[];
}

export interface CryptoNetwork {
  id: string;
  name: string;
  symbol: string;
  confirmationTime: string;
  minDeposit: number;
}

// Withdrawal Types
export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  destinationAddress: string;
  network: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fee: number;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalEligibility {
  eligible: boolean;
  reason?: string;
  goalProgress: number;
  daysUntilEligible: number;
  minimumWithdrawal: number;
}

// Notification Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// Activity Types
export interface Activity {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'goal_created' | 'goal_updated' | 'profile_updated' | 'security_updated';
  title: string;
  description: string;
  status?: 'success' | 'pending' | 'error';
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Security Types
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'app' | 'sms' | null;
  passwordLastChanged: string;
  activeSessions: Session[];
  loginHistory: LoginRecord[];
}

export interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  current: boolean;
  lastActive: string;
  createdAt: string;
}

export interface LoginRecord {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  status: 'success' | 'failed';
  createdAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  country: string;
  agreeToTerms: boolean;
}

// Dashboard Types
export interface DashboardData {
  user: User;
  portfolio: Portfolio | null;
  goal: InvestmentGoal | null;
  recentTransactions: Transaction[];
  recentActivity: Activity[];
  notifications: Notification[];
  unreadNotificationsCount: number;
  performance: PortfolioPerformance[];
}

// Stats Types
export interface StatCardData {
  title: string;
  value: number;
  currency?: string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
  subtitle?: string;
}

// Form Types
export interface DepositFormData {
  currency: string;
  network: string;
  amount: number;
  txHash: string;
}

export interface WithdrawalFormData {
  amount: number;
  currency: string;
  network: string;
  destinationAddress: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  country: string;
  preferredCurrency: string;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
