// ============================================
// NEXORA CAPITAL - In-Browser Backend
// ============================================
// A fully functional client-side backend that mirrors the real
// Node/Express API contract. Persists to localStorage so the app
// works end-to-end without a running server. When VITE_API_URL is
// set to a real backend, this is bypassed automatically.
// ============================================

const DB_KEY = 'nexora_db_v2';
const DAILY_RETURN_PERCENTAGE = 0.5;
// Returns are credited at 4:00 PM West African Time (WAT = UTC+1) => 15:00 UTC
const PAYOUT_HOUR_UTC = 15;

// Returns the list of payout moments (16:00 WAT each day) that occur
// after `last` and up to and including `now`.
function payoutsBetween(last: Date, now: Date): Date[] {
  const payouts: Date[] = [];
  let d = new Date(
    Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate(), PAYOUT_HOUR_UTC, 0, 0)
  );
  // Advance to the first payout strictly after `last`
  while (d.getTime() <= last.getTime()) {
    d = new Date(d.getTime() + 86400000);
  }
  while (d.getTime() <= now.getTime()) {
    payouts.push(new Date(d));
    d = new Date(d.getTime() + 86400000);
  }
  return payouts;
}

// ---------- Types (internal storage shape) ----------
interface DBUser {
  id: number;
  email: string;
  password: string; // plain in mock (never exposed except hashed placeholder)
  username: string;
  firstName: string;
  lastName: string;
  country: string;
  preferredCurrency: string;
  role: 'user' | 'admin';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DBPortfolio {
  id: number;
  userId: number;
  currentValue: number;
  totalInvested: number;
  totalProfit: number;
  profitPercentage: number;
  lastCalculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface DBGoal {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  duration: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface DBTransaction {
  id: number;
  userId: number;
  reference: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

interface DBDeposit {
  id: number;
  userId: number;
  transactionId: number;
  amount: number;
  currency: string;
  network: string;
  walletAddress: string;
  txHash: string | null;
  status: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DBWithdrawal {
  id: number;
  userId: number;
  transactionId: number;
  amount: number;
  currency: string;
  network: string;
  destinationAddress: string;
  fee: number;
  status: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DBPerformance {
  id: number;
  userId: number;
  date: string;
  value: number;
  invested: number;
  profit: number;
}

interface DBNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface DBActivity {
  id: number;
  userId: number;
  type: string;
  title: string;
  description: string;
  status?: string;
  createdAt: string;
}

interface DBLog {
  id: number;
  adminId: number;
  action: string;
  targetUserId?: number;
  targetType?: string;
  targetId?: number;
  notes?: string;
  createdAt: string;
  admin?: { firstName: string; lastName: string; email: string };
}

interface DBSession {
  id: number;
  userId: number;
  token: string;
  device: string;
  location: string;
  ipAddress: string;
  current: boolean;
  lastActiveAt: string;
  createdAt: string;
}

interface DBLogin {
  id: number;
  userId: number;
  device: string;
  location: string;
  ipAddress: string;
  status: string;
  createdAt: string;
}

interface Database {
  users: DBUser[];
  portfolios: DBPortfolio[];
  goals: DBGoal[];
  transactions: DBTransaction[];
  deposits: DBDeposit[];
  withdrawals: DBWithdrawal[];
  performance: DBPerformance[];
  notifications: DBNotification[];
  activities: DBActivity[];
  logs: DBLog[];
  sessions: DBSession[];
  logins: DBLogin[];
  counters: Record<string, number>;
}

// ---------- Wallet config (client-provided fixed addresses) ----------
const WALLETS = [
  { currency: 'BTC', network: 'Bitcoin', address: 'bc1q8waqj9qurtpu07q0v826qr60n7jyxw247q8xes' },
  { currency: 'ETH', network: 'ERC20', address: '0x5D1Dea66d22BdA4Bd0C8737CC236A76334326056' },
  { currency: 'SOL', network: 'Solana', address: 'HjWcM41m6aYwZVAESCFrk1EAhqHP6MV9h5pRRtnCmT5m' },
  { currency: 'USDT', network: 'ERC20', address: '0x5d1dea66d22bda4bd0c8737cc236a76334326056' },
  { currency: 'USDC', network: 'ERC20', address: '0x5D1Dea66d22BdA4Bd0C8737CC236A76334326056' },
];

// ---------- Persistence ----------
function loadDB(): Database {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // corrupted, reseed
    }
  }
  const db = seedDB();
  saveDB(db);
  return db;
}

function saveDB(db: Database) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function nextId(db: Database, table: string): number {
  db.counters[table] = (db.counters[table] || 0) + 1;
  return db.counters[table];
}

function now(): string {
  return new Date().toISOString();
}

function ref(prefix: string): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate()
  ).padStart(2, '0')}`;
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${stamp}-${rand}`;
}

// ---------- Seed ----------
function seedDB(): Database {
  const db: Database = {
    users: [],
    portfolios: [],
    goals: [],
    transactions: [],
    deposits: [],
    withdrawals: [],
    performance: [],
    notifications: [],
    activities: [],
    logs: [],
    sessions: [],
    logins: [],
    counters: {},
  };

  // Admin account
  const admin: DBUser = {
    id: nextId(db, 'users'),
    email: 'admin@nexora.com',
    password: 'admin123',
    username: 'admin',
    firstName: 'System',
    lastName: 'Administrator',
    country: 'United States',
    preferredCurrency: 'USD',
    role: 'admin',
    verificationStatus: 'verified',
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: now(),
    updatedAt: now(),
  };
  db.users.push(admin);

  // Demo user
  const demo: DBUser = {
    id: nextId(db, 'users'),
    email: 'eben@nexora.com',
    password: 'password',
    username: 'eben',
    firstName: 'Eben',
    lastName: 'Anderson',
    country: 'United States',
    preferredCurrency: 'USD',
    role: 'user',
    verificationStatus: 'verified',
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: now(),
  };
  db.users.push(demo);

  // Demo portfolio
  const portfolio: DBPortfolio = {
    id: nextId(db, 'portfolios'),
    userId: demo.id,
    currentValue: 46500,
    totalInvested: 42000,
    totalProfit: 4500,
    profitPercentage: 10.71,
    lastCalculatedAt: now(),
    createdAt: demo.createdAt,
    updatedAt: now(),
  };
  db.portfolios.push(portfolio);

  // Admin portfolio (empty)
  db.portfolios.push({
    id: nextId(db, 'portfolios'),
    userId: admin.id,
    currentValue: 0,
    totalInvested: 0,
    totalProfit: 0,
    profitPercentage: 0,
    lastCalculatedAt: now(),
    createdAt: now(),
    updatedAt: now(),
  });

  // Demo goal
  db.goals.push({
    id: nextId(db, 'goals'),
    userId: demo.id,
    name: 'Wealth Building 2024',
    targetAmount: 100000,
    currentAmount: 46500,
    duration: 18,
    startDate: demo.createdAt,
    endDate: new Date(Date.now() + 455 * 86400000).toISOString(),
    status: 'active',
    progress: 46.5,
    createdAt: demo.createdAt,
    updatedAt: now(),
  });

  // Demo transactions
  const t1 = new Date(Date.now() - 90 * 86400000).toISOString();
  const t2 = new Date(Date.now() - 60 * 86400000).toISOString();
  db.transactions.push({
    id: nextId(db, 'transactions'),
    userId: demo.id,
    reference: 'DEP-20240115-0001',
    type: 'deposit',
    amount: 20000,
    currency: 'USDT',
    status: 'completed',
    description: 'Deposit via USDT (ERC20)',
    metadata: { network: 'ERC20' },
    createdAt: t1,
    updatedAt: t1,
  });
  db.transactions.push({
    id: nextId(db, 'transactions'),
    userId: demo.id,
    reference: 'DEP-20240220-0002',
    type: 'deposit',
    amount: 22000,
    currency: 'USDT',
    status: 'completed',
    description: 'Deposit via USDT (ERC20)',
    metadata: { network: 'ERC20' },
    createdAt: t2,
    updatedAt: t2,
  });
  db.transactions.push({
    id: nextId(db, 'transactions'),
    userId: demo.id,
    reference: 'DIV-20240620-0003',
    type: 'dividend',
    amount: 4500,
    currency: 'USD',
    status: 'completed',
    description: 'Portfolio performance gain',
    createdAt: now(),
    updatedAt: now(),
  });

  // Demo performance history (last 6 months)
  const perfValues = [42000, 42800, 43500, 44200, 45800, 46500];
  perfValues.forEach((v, i) => {
    db.performance.push({
      id: nextId(db, 'performance'),
      userId: demo.id,
      date: new Date(Date.now() - (perfValues.length - 1 - i) * 30 * 86400000).toISOString(),
      value: v,
      invested: 42000,
      profit: i === 0 ? 0 : v - perfValues[i - 1],
    });
  });

  // Demo activities
  db.activities.push({
    id: nextId(db, 'activities'),
    userId: demo.id,
    type: 'deposit',
    title: 'Deposit Confirmed',
    description: 'Your deposit of $22,000 has been confirmed',
    status: 'success',
    createdAt: t2,
  });
  db.activities.push({
    id: nextId(db, 'activities'),
    userId: demo.id,
    type: 'goal_created',
    title: 'Investment Goal Created',
    description: 'Wealth Building 2024 goal set for $100,000',
    status: 'success',
    createdAt: t1,
  });

  // Demo notifications
  db.notifications.push({
    id: nextId(db, 'notifications'),
    userId: demo.id,
    title: 'Goal Milestone',
    message: "You've reached 46% of your investment goal. Excellent progress!",
    type: 'success',
    read: false,
    actionUrl: '/portfolio',
    createdAt: now(),
  });
  db.notifications.push({
    id: nextId(db, 'notifications'),
    userId: demo.id,
    title: 'Deposit Confirmed',
    message: 'Your recent deposit of $22,000 has been confirmed and added to your portfolio.',
    type: 'success',
    read: true,
    actionUrl: '/portfolio',
    createdAt: t2,
  });

  return db;
}

// ---------- Daily returns simulation ----------
// Applies compounding 0.5% returns for each 4:00 PM WAT payout that has
// passed since the last calculation.
function applyDailyReturns(db: Database) {
  const today = new Date();
  let changed = false;

  for (const portfolio of db.portfolios) {
    if (portfolio.totalInvested <= 0) continue;

    const last = new Date(portfolio.lastCalculatedAt);
    const payouts = payoutsBetween(last, today);
    if (payouts.length === 0) continue;

    let value = portfolio.currentValue;
    for (const payout of payouts) {
      const gain = value * (DAILY_RETURN_PERCENTAGE / 100);
      value += gain;

      const gainDate = payout.toISOString();
      db.performance.push({
        id: nextId(db, 'performance'),
        userId: portfolio.userId,
        date: gainDate,
        value,
        invested: portfolio.totalInvested,
        profit: gain,
      });

      db.transactions.push({
        id: nextId(db, 'transactions'),
        userId: portfolio.userId,
        reference: ref('DIV'),
        type: 'dividend',
        amount: gain,
        currency: 'USD',
        status: 'completed',
        description: `Daily return (${DAILY_RETURN_PERCENTAGE}%)`,
        createdAt: gainDate,
        updatedAt: gainDate,
      });
    }

    portfolio.currentValue = value;
    portfolio.totalProfit = value - portfolio.totalInvested;
    portfolio.profitPercentage =
      portfolio.totalInvested > 0 ? (portfolio.totalProfit / portfolio.totalInvested) * 100 : 0;
    portfolio.lastCalculatedAt = today.toISOString();
    portfolio.updatedAt = today.toISOString();
    updateGoalProgress(db, portfolio.userId);
    changed = true;
  }

  if (changed) saveDB(db);
}

function updateGoalProgress(db: Database, userId: number) {
  const portfolio = db.portfolios.find((p) => p.userId === userId);
  if (!portfolio) return;
  const goals = db.goals.filter((g) => g.userId === userId && g.status === 'active');
  for (const goal of goals) {
    const progress = goal.targetAmount > 0 ? (portfolio.currentValue / goal.targetAmount) * 100 : 0;
    goal.currentAmount = Math.min(portfolio.currentValue, goal.targetAmount);
    goal.progress = progress;
    if (progress >= 100 && goal.status === 'active') {
      goal.status = 'completed';
      db.notifications.push({
        id: nextId(db, 'notifications'),
        userId,
        title: '🎉 Goal Completed!',
        message: `Congratulations! You've reached your goal: ${goal.name}`,
        type: 'success',
        read: false,
        createdAt: now(),
      });
    }
  }
}

// ---------- Auth helpers ----------
function makeToken(userId: number): string {
  return `mock.${userId}.${Date.now()}`;
}

function userIdFromToken(token: string | null): number | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts[0] !== 'mock') return null;
  const id = parseInt(parts[1]);
  return isNaN(id) ? null : id;
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

function publicUser(u: DBUser) {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName,
    country: u.country,
    preferredCurrency: u.preferredCurrency,
    role: u.role,
    verificationStatus: u.verificationStatus,
    emailVerified: u.emailVerified,
    twoFactorEnabled: u.twoFactorEnabled,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

// ---------- Response helpers ----------
class MockError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function ok<T>(data: T, message = 'Success') {
  return { success: true, message, data };
}

function requireAuth(): { db: Database; user: DBUser } {
  const db = loadDB();
  const uid = userIdFromToken(getToken());
  const user = db.users.find((u) => u.id === uid);
  if (!user) throw new MockError('Access denied. Please sign in.', 401);
  return { db, user };
}

function requireAdmin(): { db: Database; user: DBUser } {
  const { db, user } = requireAuth();
  if (user.role !== 'admin') throw new MockError('Admin privileges required.', 403);
  return { db, user };
}

// ---------- Serializers (match Postgres decimal-as-string output) ----------
function serializePortfolio(p: DBPortfolio) {
  return {
    id: p.id,
    userId: p.userId,
    currentValue: p.currentValue.toFixed(2),
    totalInvested: p.totalInvested.toFixed(2),
    totalProfit: p.totalProfit.toFixed(2),
    profitPercentage: p.profitPercentage.toFixed(2),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

function serializeGoal(g: DBGoal) {
  return {
    id: g.id,
    userId: g.userId,
    name: g.name,
    targetAmount: g.targetAmount.toFixed(2),
    currentAmount: g.currentAmount.toFixed(2),
    duration: g.duration,
    startDate: g.startDate,
    endDate: g.endDate,
    status: g.status,
    progress: g.progress.toFixed(2),
  };
}

function serializeTx(t: DBTransaction) {
  return {
    id: t.id,
    userId: t.userId,
    reference: t.reference,
    type: t.type,
    amount: t.amount.toFixed(2),
    currency: t.currency,
    status: t.status,
    description: t.description,
    metadata: t.metadata,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

function serializePerf(p: DBPerformance) {
  return {
    date: p.date,
    value: p.value.toFixed(2),
    invested: p.invested.toFixed(2),
  };
}

// ---------- Router ----------
async function handle(method: string, endpoint: string, body?: any): Promise<any> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 300));

  const [path, query] = endpoint.split('?');
  const params = new URLSearchParams(query || '');
  const segments = path.split('/').filter(Boolean); // e.g. ['auth','login']

  // ===== AUTH =====
  if (segments[0] === 'auth') {
    if (segments[1] === 'login' && method === 'POST') {
      const db = loadDB();
      const user = db.users.find((u) => u.email.toLowerCase() === (body.email || '').toLowerCase());
      if (!user || user.password !== body.password) {
        db.logins.push({
          id: nextId(db, 'logins'),
          userId: user?.id ?? 0,
          device: navigator.userAgent,
          location: 'Local',
          ipAddress: '127.0.0.1',
          status: 'failed',
          createdAt: now(),
        });
        saveDB(db);
        throw new MockError('Invalid email or password', 401);
      }
      user.updatedAt = now();
      db.logins.push({
        id: nextId(db, 'logins'),
        userId: user.id,
        device: navigator.userAgent,
        location: 'Local',
        ipAddress: '127.0.0.1',
        status: 'success',
        createdAt: now(),
      });
      // ensure a current session exists
      db.sessions = db.sessions.filter((s) => s.userId !== user.id);
      db.sessions.push({
        id: nextId(db, 'sessions'),
        userId: user.id,
        token: makeToken(user.id),
        device: navigator.userAgent,
        location: 'Local',
        ipAddress: '127.0.0.1',
        current: true,
        lastActiveAt: now(),
        createdAt: now(),
      });
      saveDB(db);
      return ok({ user: publicUser(user), token: makeToken(user.id) }, 'Login successful');
    }

    if (segments[1] === 'register' && method === 'POST') {
      const db = loadDB();
      if (db.users.some((u) => u.email.toLowerCase() === (body.email || '').toLowerCase())) {
        throw new MockError('Email already registered', 400);
      }
      if (db.users.some((u) => u.username.toLowerCase() === (body.username || '').toLowerCase())) {
        throw new MockError('Username already taken', 400);
      }
      const user: DBUser = {
        id: nextId(db, 'users'),
        email: body.email,
        password: body.password,
        username: body.username,
        firstName: body.firstName,
        lastName: body.lastName,
        country: body.country,
        preferredCurrency: 'USD',
        role: 'user',
        verificationStatus: 'pending',
        emailVerified: false,
        twoFactorEnabled: false,
        createdAt: now(),
        updatedAt: now(),
      };
      db.users.push(user);

      db.portfolios.push({
        id: nextId(db, 'portfolios'),
        userId: user.id,
        currentValue: 0,
        totalInvested: 0,
        totalProfit: 0,
        profitPercentage: 0,
        lastCalculatedAt: now(),
        createdAt: now(),
        updatedAt: now(),
      });

      db.goals.push({
        id: nextId(db, 'goals'),
        userId: user.id,
        name: 'Wealth Building',
        targetAmount: 100000,
        currentAmount: 0,
        duration: 12,
        startDate: now(),
        endDate: new Date(Date.now() + 365 * 86400000).toISOString(),
        status: 'active',
        progress: 0,
        createdAt: now(),
        updatedAt: now(),
      });

      db.activities.push({
        id: nextId(db, 'activities'),
        userId: user.id,
        type: 'profile_updated',
        title: 'Account Created',
        description: 'Welcome to Nexora Capital! Your account has been created.',
        status: 'success',
        createdAt: now(),
      });

      db.notifications.push({
        id: nextId(db, 'notifications'),
        userId: user.id,
        title: 'Welcome to Nexora Capital',
        message: 'Your account is ready. Set a goal and make your first deposit to start earning.',
        type: 'info',
        read: false,
        createdAt: now(),
      });

      saveDB(db);
      return ok({ user: publicUser(user), token: makeToken(user.id) }, 'Registration successful');
    }

    if (segments[1] === 'me' && method === 'GET') {
      const { user } = requireAuth();
      return ok(publicUser(user));
    }

    if (segments[1] === 'logout' && method === 'POST') {
      return ok(null, 'Logout successful');
    }
  }

  // ===== USERS =====
  if (segments[0] === 'users') {
    if (segments[1] === 'profile' && method === 'PUT') {
      const { db, user } = requireAuth();
      if (body.firstName) user.firstName = body.firstName;
      if (body.lastName) user.lastName = body.lastName;
      if (body.country) user.country = body.country;
      if (body.preferredCurrency) user.preferredCurrency = body.preferredCurrency;
      user.updatedAt = now();
      db.activities.push({
        id: nextId(db, 'activities'),
        userId: user.id,
        type: 'profile_updated',
        title: 'Profile Updated',
        description: 'Your profile information has been updated',
        status: 'success',
        createdAt: now(),
      });
      saveDB(db);
      return ok(publicUser(user), 'Profile updated successfully');
    }

    if (segments[1] === 'password' && method === 'PUT') {
      const { db, user } = requireAuth();
      if (user.password !== body.currentPassword) {
        throw new MockError('Current password is incorrect', 401);
      }
      user.password = body.newPassword;
      user.updatedAt = now();
      db.activities.push({
        id: nextId(db, 'activities'),
        userId: user.id,
        type: 'security_updated',
        title: 'Password Changed',
        description: 'Your password has been changed successfully',
        status: 'success',
        createdAt: now(),
      });
      saveDB(db);
      return ok(null, 'Password changed successfully');
    }

    if (segments[1] === 'login-history' && method === 'GET') {
      const { db, user } = requireAuth();
      const history = db.logins
        .filter((l) => l.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 20);
      return ok(history);
    }

    if (segments[1] === 'sessions' && method === 'GET') {
      const { db, user } = requireAuth();
      const sessions = db.sessions.filter((s) => s.userId === user.id);
      return ok(sessions);
    }
  }

  // ===== PORTFOLIO =====
  if (segments[0] === 'portfolio') {
    const { db, user } = requireAuth();
    applyDailyReturns(db);

    if (segments.length === 1 && method === 'GET') {
      const p = db.portfolios.find((x) => x.userId === user.id);
      return ok(p ? serializePortfolio(p) : null);
    }

    if (segments[1] === 'dashboard' && method === 'GET') {
      const p = db.portfolios.find((x) => x.userId === user.id);
      const goal = db.goals.find((g) => g.userId === user.id && g.status === 'active') ||
        db.goals.find((g) => g.userId === user.id);
      const recentTransactions = db.transactions
        .filter((t) => t.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5)
        .map(serializeTx);
      const perf = db.performance
        .filter((x) => x.userId === user.id)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30)
        .map(serializePerf);
      return ok({
        user: publicUser(user),
        portfolio: p ? serializePortfolio(p) : null,
        goal: goal ? serializeGoal(goal) : null,
        recentTransactions,
        performance: perf,
      });
    }

    if (segments[1] === 'performance' && method === 'GET') {
      const perf = db.performance
        .filter((x) => x.userId === user.id)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(serializePerf);
      return ok(perf);
    }

    if (segments[1] === 'goal' && method === 'GET') {
      const goal = db.goals.find((g) => g.userId === user.id && g.status === 'active');
      if (!goal) throw new MockError('No active goal found', 404);
      return ok(serializeGoal(goal));
    }

    if (segments[1] === 'goal' && method === 'POST') {
      const p = db.portfolios.find((x) => x.userId === user.id);
      db.goals
        .filter((g) => g.userId === user.id && g.status === 'active')
        .forEach((g) => (g.status = 'cancelled'));
      const goal: DBGoal = {
        id: nextId(db, 'goals'),
        userId: user.id,
        name: body.name,
        targetAmount: parseFloat(body.targetAmount),
        currentAmount: p?.currentValue || 0,
        duration: parseInt(body.duration),
        startDate: now(),
        endDate: new Date(Date.now() + parseInt(body.duration) * 30 * 86400000).toISOString(),
        status: 'active',
        progress: p && p.currentValue > 0 ? (p.currentValue / parseFloat(body.targetAmount)) * 100 : 0,
        createdAt: now(),
        updatedAt: now(),
      };
      db.goals.push(goal);
      db.activities.push({
        id: nextId(db, 'activities'),
        userId: user.id,
        type: 'goal_created',
        title: 'Investment Goal Created',
        description: `${goal.name} goal set for $${goal.targetAmount.toLocaleString()}`,
        status: 'success',
        createdAt: now(),
      });
      saveDB(db);
      return ok(serializeGoal(goal), 'Investment goal created successfully');
    }
  }

  // ===== DEPOSITS =====
  if (segments[0] === 'deposits') {
    if (segments[1] === 'wallets' && method === 'GET') {
      return ok(WALLETS);
    }

    const { db, user } = requireAuth();

    if (segments.length === 1 && method === 'POST') {
      const amount = parseFloat(body.amount);
      if (amount < 100) throw new MockError('Minimum deposit is $100', 400);
      const wallet =
        WALLETS.find((w) => w.currency === body.currency && w.network === body.network) ||
        WALLETS.find((w) => w.currency === body.currency);

      const tx: DBTransaction = {
        id: nextId(db, 'transactions'),
        userId: user.id,
        reference: ref('DEP'),
        type: 'deposit',
        amount,
        currency: body.currency,
        status: 'pending',
        description: `Deposit via ${body.currency} (${body.network})`,
        metadata: { txHash: body.txHash, network: body.network },
        createdAt: now(),
        updatedAt: now(),
      };
      db.transactions.push(tx);

      const deposit: DBDeposit = {
        id: nextId(db, 'deposits'),
        userId: user.id,
        transactionId: tx.id,
        amount,
        currency: body.currency,
        network: body.network,
        walletAddress: wallet?.address || '',
        txHash: body.txHash || null,
        status: 'pending',
        createdAt: now(),
        updatedAt: now(),
      };
      db.deposits.push(deposit);

      db.activities.push({
        id: nextId(db, 'activities'),
        userId: user.id,
        type: 'deposit',
        title: 'Deposit Requested',
        description: `Deposit of $${amount.toLocaleString()} ${body.currency} is pending confirmation`,
        status: 'pending',
        createdAt: now(),
      });
      db.notifications.push({
        id: nextId(db, 'notifications'),
        userId: user.id,
        title: 'Deposit Pending',
        message: `Your deposit of $${amount.toLocaleString()} ${body.currency} is being reviewed.`,
        type: 'info',
        read: false,
        createdAt: now(),
      });
      saveDB(db);
      return ok({ deposit, transaction: tx, walletAddress: wallet?.address }, 'Deposit request created');
    }

    if (segments.length === 1 && method === 'GET') {
      const list = db.deposits
        .filter((d) => d.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return ok(list);
    }
  }

  // ===== WITHDRAWALS =====
  if (segments[0] === 'withdrawals') {
    const { db, user } = requireAuth();
    applyDailyReturns(db);

    if (segments[1] === 'eligibility' && method === 'GET') {
      return ok(computeEligibility(db, user.id));
    }

    if (segments.length === 1 && method === 'POST') {
      const eligibility = computeEligibility(db, user.id);
      if (!eligibility.eligible) {
        throw new MockError(eligibility.reason || 'Not eligible for withdrawal', 400);
      }
      const amount = parseFloat(body.amount);
      if (amount < 100) throw new MockError('Minimum withdrawal is $100', 400);
      const p = db.portfolios.find((x) => x.userId === user.id);
      if (!p || p.currentValue < amount) throw new MockError('Insufficient balance', 400);

      const fee = amount * 0.005;
      const tx: DBTransaction = {
        id: nextId(db, 'transactions'),
        userId: user.id,
        reference: ref('WDR'),
        type: 'withdrawal',
        amount,
        currency: body.currency,
        status: 'pending',
        description: `Withdrawal to ${String(body.destinationAddress).slice(0, 8)}...`,
        metadata: { network: body.network, destinationAddress: body.destinationAddress, fee },
        createdAt: now(),
        updatedAt: now(),
      };
      db.transactions.push(tx);

      const withdrawal: DBWithdrawal = {
        id: nextId(db, 'withdrawals'),
        userId: user.id,
        transactionId: tx.id,
        amount,
        currency: body.currency,
        network: body.network,
        destinationAddress: body.destinationAddress,
        fee,
        status: 'pending',
        createdAt: now(),
        updatedAt: now(),
      };
      db.withdrawals.push(withdrawal);

      db.activities.push({
        id: nextId(db, 'activities'),
        userId: user.id,
        type: 'withdrawal',
        title: 'Withdrawal Requested',
        description: `Withdrawal of $${amount.toLocaleString()} ${body.currency} is pending approval`,
        status: 'pending',
        createdAt: now(),
      });
      db.notifications.push({
        id: nextId(db, 'notifications'),
        userId: user.id,
        title: 'Withdrawal Pending',
        message: `Your withdrawal request of $${amount.toLocaleString()} ${body.currency} is being reviewed.`,
        type: 'info',
        read: false,
        createdAt: now(),
      });
      saveDB(db);
      return ok({ withdrawal, transaction: tx, fee, receiveAmount: amount - fee }, 'Withdrawal request created');
    }

    if (segments.length === 1 && method === 'GET') {
      const list = db.withdrawals
        .filter((w) => w.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return ok(list);
    }
  }

  // ===== TRANSACTIONS =====
  if (segments[0] === 'transactions') {
    const { db, user } = requireAuth();
    applyDailyReturns(db);

    if (segments[1] === 'stats' && segments[2] === 'summary' && method === 'GET') {
      const txs = db.transactions.filter((t) => t.userId === user.id);
      const sum = (type: string, status?: string) =>
        txs
          .filter((t) => t.type === type && (!status || t.status === status))
          .reduce((a, t) => a + t.amount, 0);
      return ok({
        totalDeposits: sum('deposit', 'completed'),
        totalWithdrawals: sum('withdrawal', 'completed'),
        totalDividends: sum('dividend'),
        transactionCount: txs.length,
      });
    }

    if (segments.length === 1 && method === 'GET') {
      let txs = db.transactions
        .filter((t) => t.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const type = params.get('type');
      const status = params.get('status');
      if (type) txs = txs.filter((t) => t.type === type);
      if (status) txs = txs.filter((t) => t.status === status);
      const limit = parseInt(params.get('limit') || '20');
      const offset = parseInt(params.get('offset') || '0');
      const paged = txs.slice(offset, offset + limit).map(serializeTx);
      return ok({ transactions: paged, total: txs.length, limit, offset });
    }
  }

  // ===== NOTIFICATIONS =====
  if (segments[0] === 'notifications') {
    const { db, user } = requireAuth();

    if (segments[1] === 'activities' && method === 'GET') {
      const list = db.activities
        .filter((a) => a.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 20);
      return ok(list);
    }

    if (segments[1] === 'read-all' && method === 'PUT') {
      db.notifications.filter((n) => n.userId === user.id).forEach((n) => (n.read = true));
      saveDB(db);
      return ok(null, 'All notifications marked as read');
    }

    if (segments.length === 2 && segments[1] !== 'read-all' && method === 'PUT') {
      // /notifications/:id/read handled below (3 segments), skip
    }

    if (segments.length === 3 && segments[2] === 'read' && method === 'PUT') {
      const id = parseInt(segments[1]);
      const n = db.notifications.find((x) => x.id === id && x.userId === user.id);
      if (n) {
        n.read = true;
        saveDB(db);
      }
      return ok(null, 'Notification marked as read');
    }

    if (segments.length === 1 && method === 'GET') {
      let list = db.notifications
        .filter((n) => n.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      if (params.get('unread') === 'true') list = list.filter((n) => !n.read);
      const unreadCount = db.notifications.filter((n) => n.userId === user.id && !n.read).length;
      return ok({ notifications: list.slice(0, 20), unreadCount });
    }
  }

  // ===== ADMIN =====
  if (segments[0] === 'admin') {
    const { db, user: admin } = requireAdmin();
    applyDailyReturns(db);

    if (segments[1] === 'stats' && method === 'GET') {
      const regularUsers = db.users.filter((u) => u.role === 'user');
      const totalAum = db.portfolios.reduce((a, p) => a + p.currentValue, 0);
      const totalInvested = db.portfolios.reduce((a, p) => a + p.totalInvested, 0);
      const totalProfit = db.portfolios.reduce((a, p) => a + p.totalProfit, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newToday = db.users.filter(
        (u) => u.role === 'user' && new Date(u.createdAt) >= today
      ).length;
      return ok({
        users: { total: regularUsers.length, admins: db.users.filter((u) => u.role === 'admin').length, newToday },
        portfolio: {
          totalAum,
          totalInvested,
          totalProfit,
          averageReturn: totalInvested > 0 ? parseFloat(((totalProfit / totalInvested) * 100).toFixed(2)) : 0,
        },
        pending: {
          deposits: db.deposits.filter((d) => d.status === 'pending').length,
          withdrawals: db.withdrawals.filter((w) => w.status === 'pending').length,
        },
      });
    }

    if (segments[1] === 'users' && segments.length === 2 && method === 'GET') {
      let users = db.users.filter((u) => u.role === 'user');
      const search = params.get('search');
      if (search) {
        const s = search.toLowerCase();
        users = users.filter(
          (u) =>
            u.email.toLowerCase().includes(s) ||
            u.username.toLowerCase().includes(s) ||
            u.firstName.toLowerCase().includes(s) ||
            u.lastName.toLowerCase().includes(s)
        );
      }
      users.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const enriched = users.map((u) => ({
        ...publicUser(u),
        passwordHash: `bcrypt$${btoa(u.password).slice(0, 20)}...`,
        portfolio: (() => {
          const p = db.portfolios.find((x) => x.userId === u.id);
          return p
            ? { currentValue: p.currentValue.toFixed(2), totalInvested: p.totalInvested.toFixed(2), totalProfit: p.totalProfit.toFixed(2) }
            : undefined;
        })(),
      }));
      return ok({ users: enriched, total: enriched.length });
    }

    if (segments[1] === 'users' && segments.length === 3 && method === 'GET') {
      const id = parseInt(segments[2]);
      const u = db.users.find((x) => x.id === id);
      if (!u) throw new MockError('User not found', 404);
      const p = db.portfolios.find((x) => x.userId === id);
      return ok({
        user: { ...publicUser(u), passwordHash: `bcrypt$${btoa(u.password).slice(0, 20)}...`, portfolio: p ? serializePortfolio(p) : null },
        deposits: db.deposits.filter((d) => d.userId === id),
        withdrawals: db.withdrawals.filter((w) => w.userId === id),
        transactions: db.transactions.filter((t) => t.userId === id).slice(0, 20),
        goals: db.goals.filter((g) => g.userId === id),
      });
    }

    if (segments[1] === 'users' && segments[3] === 'balance' && method === 'PUT') {
      const id = parseInt(segments[2]);
      const p = db.portfolios.find((x) => x.userId === id);
      if (!p) throw new MockError('User portfolio not found', 404);
      const amount = parseFloat(body.amount);
      const oldValue = p.currentValue;
      if (body.type === 'add') {
        p.currentValue += amount;
        p.totalInvested += amount;
      } else if (body.type === 'subtract') {
        p.currentValue = Math.max(0, p.currentValue - amount);
        p.totalInvested = Math.max(0, p.totalInvested - amount);
      } else if (body.type === 'set') {
        const diff = amount - p.currentValue;
        p.currentValue = amount;
        p.totalInvested = Math.max(0, p.totalInvested + diff);
      }
      p.totalProfit = p.currentValue - p.totalInvested;
      p.profitPercentage = p.totalInvested > 0 ? (p.totalProfit / p.totalInvested) * 100 : 0;
      p.updatedAt = now();

      db.transactions.push({
        id: nextId(db, 'transactions'),
        userId: id,
        reference: ref('ADJ'),
        type: 'adjustment',
        amount,
        currency: 'USD',
        status: 'completed',
        description: `Balance adjustment by admin: ${body.reason}`,
        metadata: { type: body.type, reason: body.reason },
        createdAt: now(),
        updatedAt: now(),
      });
      db.notifications.push({
        id: nextId(db, 'notifications'),
        userId: id,
        title: 'Balance Updated',
        message: `Your portfolio balance has been updated by an administrator.`,
        type: 'info',
        read: false,
        createdAt: now(),
      });
      db.logs.push({
        id: nextId(db, 'logs'),
        adminId: admin.id,
        action: 'balance_adjustment',
        targetUserId: id,
        targetType: 'portfolio',
        targetId: p.id,
        notes: body.reason,
        createdAt: now(),
        admin: { firstName: admin.firstName, lastName: admin.lastName, email: admin.email },
      });
      updateGoalProgress(db, id);
      saveDB(db);
      return ok({ oldValue: oldValue.toFixed(2), newValue: p.currentValue.toFixed(2) }, 'Balance updated successfully');
    }

    if (segments[1] === 'deposits' && segments[2] === 'pending' && method === 'GET') {
      const pending = db.deposits
        .filter((d) => d.status === 'pending')
        .map((d) => ({
          ...d,
          amount: d.amount.toFixed(2),
          user: (() => {
            const u = db.users.find((x) => x.id === d.userId)!;
            return { firstName: u.firstName, lastName: u.lastName, email: u.email };
          })(),
        }));
      return ok(pending);
    }

    if (segments[1] === 'deposits' && segments[3] === 'approve' && method === 'PUT') {
      const id = parseInt(segments[2]);
      const deposit = db.deposits.find((d) => d.id === id);
      if (!deposit) throw new MockError('Deposit not found', 404);
      if (deposit.status !== 'pending') throw new MockError(`Deposit is already ${deposit.status}`, 400);
      const p = db.portfolios.find((x) => x.userId === deposit.userId)!;
      p.currentValue += deposit.amount;
      p.totalInvested += deposit.amount;
      p.totalProfit = p.currentValue - p.totalInvested;
      p.profitPercentage = p.totalInvested > 0 ? (p.totalProfit / p.totalInvested) * 100 : 0;
      p.updatedAt = now();
      deposit.status = 'completed';
      deposit.updatedAt = now();
      const tx = db.transactions.find((t) => t.id === deposit.transactionId);
      if (tx) tx.status = 'completed';
      db.activities.push({
        id: nextId(db, 'activities'),
        userId: deposit.userId,
        type: 'deposit',
        title: 'Deposit Confirmed',
        description: `Your deposit of $${deposit.amount.toLocaleString()} has been confirmed`,
        status: 'success',
        createdAt: now(),
      });
      db.notifications.push({
        id: nextId(db, 'notifications'),
        userId: deposit.userId,
        title: 'Deposit Confirmed',
        message: `Your deposit of $${deposit.amount.toLocaleString()} ${deposit.currency} has been confirmed and added to your portfolio.`,
        type: 'success',
        read: false,
        createdAt: now(),
      });
      db.logs.push({
        id: nextId(db, 'logs'),
        adminId: admin.id,
        action: 'deposit_approved',
        targetUserId: deposit.userId,
        targetType: 'deposit',
        targetId: deposit.id,
        notes: 'Deposit approved',
        createdAt: now(),
        admin: { firstName: admin.firstName, lastName: admin.lastName, email: admin.email },
      });
      updateGoalProgress(db, deposit.userId);
      saveDB(db);
      return ok(null, 'Deposit approved successfully');
    }

    if (segments[1] === 'deposits' && segments[3] === 'reject' && method === 'PUT') {
      const id = parseInt(segments[2]);
      const deposit = db.deposits.find((d) => d.id === id);
      if (!deposit) throw new MockError('Deposit not found', 404);
      deposit.status = 'rejected';
      deposit.adminNotes = body?.reason;
      deposit.updatedAt = now();
      const tx = db.transactions.find((t) => t.id === deposit.transactionId);
      if (tx) tx.status = 'failed';
      db.notifications.push({
        id: nextId(db, 'notifications'),
        userId: deposit.userId,
        title: 'Deposit Rejected',
        message: body?.reason || 'Your deposit was rejected. Please contact support.',
        type: 'error',
        read: false,
        createdAt: now(),
      });
      db.logs.push({
        id: nextId(db, 'logs'),
        adminId: admin.id,
        action: 'deposit_rejected',
        targetUserId: deposit.userId,
        targetType: 'deposit',
        targetId: deposit.id,
        notes: body?.reason,
        createdAt: now(),
        admin: { firstName: admin.firstName, lastName: admin.lastName, email: admin.email },
      });
      saveDB(db);
      return ok(null, 'Deposit rejected successfully');
    }

    if (segments[1] === 'withdrawals' && segments[2] === 'pending' && method === 'GET') {
      const pending = db.withdrawals
        .filter((w) => w.status === 'pending')
        .map((w) => ({
          ...w,
          amount: w.amount.toFixed(2),
          fee: w.fee.toFixed(2),
          user: (() => {
            const u = db.users.find((x) => x.id === w.userId)!;
            return { firstName: u.firstName, lastName: u.lastName, email: u.email };
          })(),
        }));
      return ok(pending);
    }

    if (segments[1] === 'withdrawals' && segments[3] === 'approve' && method === 'PUT') {
      const id = parseInt(segments[2]);
      const w = db.withdrawals.find((x) => x.id === id);
      if (!w) throw new MockError('Withdrawal not found', 404);
      if (w.status !== 'pending') throw new MockError(`Withdrawal is already ${w.status}`, 400);
      const p = db.portfolios.find((x) => x.userId === w.userId)!;
      if (p.currentValue < w.amount) throw new MockError('Insufficient user balance', 400);
      p.currentValue -= w.amount;
      p.totalInvested = Math.max(0, p.totalInvested - w.amount);
      p.totalProfit = p.currentValue - p.totalInvested;
      p.profitPercentage = p.totalInvested > 0 ? (p.totalProfit / p.totalInvested) * 100 : 0;
      p.updatedAt = now();
      w.status = 'completed';
      w.updatedAt = now();
      const tx = db.transactions.find((t) => t.id === w.transactionId);
      if (tx) tx.status = 'completed';
      db.activities.push({
        id: nextId(db, 'activities'),
        userId: w.userId,
        type: 'withdrawal',
        title: 'Withdrawal Processed',
        description: `Your withdrawal of $${w.amount.toLocaleString()} has been processed`,
        status: 'success',
        createdAt: now(),
      });
      db.notifications.push({
        id: nextId(db, 'notifications'),
        userId: w.userId,
        title: 'Withdrawal Completed',
        message: `Your withdrawal of $${w.amount.toLocaleString()} ${w.currency} has been processed.`,
        type: 'success',
        read: false,
        createdAt: now(),
      });
      db.logs.push({
        id: nextId(db, 'logs'),
        adminId: admin.id,
        action: 'withdrawal_approved',
        targetUserId: w.userId,
        targetType: 'withdrawal',
        targetId: w.id,
        notes: 'Withdrawal approved',
        createdAt: now(),
        admin: { firstName: admin.firstName, lastName: admin.lastName, email: admin.email },
      });
      updateGoalProgress(db, w.userId);
      saveDB(db);
      return ok(null, 'Withdrawal approved and processed successfully');
    }

    if (segments[1] === 'withdrawals' && segments[3] === 'reject' && method === 'PUT') {
      const id = parseInt(segments[2]);
      const w = db.withdrawals.find((x) => x.id === id);
      if (!w) throw new MockError('Withdrawal not found', 404);
      w.status = 'rejected';
      w.adminNotes = body?.reason;
      w.updatedAt = now();
      const tx = db.transactions.find((t) => t.id === w.transactionId);
      if (tx) tx.status = 'failed';
      db.notifications.push({
        id: nextId(db, 'notifications'),
        userId: w.userId,
        title: 'Withdrawal Rejected',
        message: body?.reason || 'Your withdrawal was rejected. Please contact support.',
        type: 'error',
        read: false,
        createdAt: now(),
      });
      db.logs.push({
        id: nextId(db, 'logs'),
        adminId: admin.id,
        action: 'withdrawal_rejected',
        targetUserId: w.userId,
        targetType: 'withdrawal',
        targetId: w.id,
        notes: body?.reason,
        createdAt: now(),
        admin: { firstName: admin.firstName, lastName: admin.lastName, email: admin.email },
      });
      saveDB(db);
      return ok(null, 'Withdrawal rejected successfully');
    }

    if (segments[1] === 'notifications' && method === 'POST') {
      const targetId = parseInt(body.userId);
      const n: DBNotification = {
        id: nextId(db, 'notifications'),
        userId: targetId,
        title: body.title,
        message: body.message,
        type: body.type,
        read: false,
        createdAt: now(),
      };
      db.notifications.push(n);
      db.logs.push({
        id: nextId(db, 'logs'),
        adminId: admin.id,
        action: 'notification_sent',
        targetUserId: targetId,
        targetType: 'notification',
        targetId: n.id,
        notes: body.title,
        createdAt: now(),
        admin: { firstName: admin.firstName, lastName: admin.lastName, email: admin.email },
      });
      saveDB(db);
      return ok(n, 'Notification sent successfully');
    }

    if (segments[1] === 'logs' && method === 'GET') {
      const logs = [...db.logs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 100);
      return ok(logs);
    }
  }

  throw new MockError(`Mock endpoint not found: ${method} ${path}`, 404);
}

function computeEligibility(db: Database, userId: number) {
  const portfolio = db.portfolios.find((p) => p.userId === userId);
  const goal = db.goals.find((g) => g.userId === userId && g.status === 'active');

  if (!portfolio || portfolio.totalInvested <= 0) {
    return { eligible: false, reason: 'No active investment found', progress: 0, daysUntil: 0 };
  }

  const minDays = 180;
  const firstDeposit = db.deposits
    .filter((d) => d.userId === userId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  const anchor = firstDeposit ? new Date(firstDeposit.createdAt) : new Date(portfolio.createdAt);
  const daysInvested = Math.floor((Date.now() - anchor.getTime()) / 86400000);
  const daysUntil = Math.max(0, minDays - daysInvested);
  const progress = goal ? goal.progress : 0;

  const goalMet = progress >= 100;
  const timeMet = daysInvested >= minDays;

  if (!goalMet && !timeMet) {
    return {
      eligible: false,
      reason: `Withdrawal available when you reach 100% goal progress OR after ${minDays} days of investment.`,
      progress,
      daysUntil,
    };
  }

  return { eligible: true, progress, daysUntil: 0 };
}

// Reset helper (exposed for debugging)
export function resetMockBackend() {
  localStorage.removeItem(DB_KEY);
}

export const mockBackend = { handle };
