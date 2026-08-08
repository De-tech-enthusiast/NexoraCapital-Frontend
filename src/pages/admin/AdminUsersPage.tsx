// ============================================
// NEXORA CAPITAL - Admin Users Page
// ============================================

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Wallet, Bell, Eye, Mail, Globe, ShieldCheck, KeyRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { adminApi } from '@/services/api';
import { format } from 'date-fns';

interface UserDetails {
  user: AdminUser & {
    passwordHash: string;
    portfolio?: {
      currentValue: string;
      totalInvested: string;
      totalProfit: string;
      profitPercentage?: string;
    } | null;
  };
  deposits: any[];
  withdrawals: any[];
  transactions: any[];
  goals: any[];
}

interface AdminUser {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  country: string;
  role: string;
  verificationStatus: string;
  passwordHash: string;
  createdAt: string;
  portfolio?: {
    currentValue: string;
    totalInvested: string;
    totalProfit: string;
  };
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const toast = useToast();

  // Balance form
  const [balanceType, setBalanceType] = useState<'add' | 'subtract' | 'set'>('add');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceReason, setBalanceReason] = useState('');
  const [savingBalance, setSavingBalance] = useState(false);

  // Notification form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [sendingNotif, setSendingNotif] = useState(false);

  // User details view
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const openDetailsModal = async (user: AdminUser) => {
    setSelectedUser(user);
    setUserDetails(null);
    setDetailsModalOpen(true);
    setLoadingDetails(true);
    try {
      const res = await adminApi.getUser(user.id);
      setUserDetails(res.data as UserDetails);
    } catch (error: any) {
      toast.error('Failed to load user details', error.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadUsers = () => {
    setIsLoading(true);
    adminApi
      .getUsers({ search, limit: 100 })
      .then((res) => {
        const data = res.data as any;
        setUsers(data.users || []);
      })
      .catch(() => setUsers([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(loadUsers, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openBalanceModal = (user: AdminUser) => {
    setSelectedUser(user);
    setBalanceType('add');
    setBalanceAmount('');
    setBalanceReason('');
    setBalanceModalOpen(true);
  };

  const openNotifyModal = (user: AdminUser) => {
    setSelectedUser(user);
    setNotifTitle('');
    setNotifMessage('');
    setNotifType('info');
    setNotifyModalOpen(true);
  };

  const handleUpdateBalance = async () => {
    if (!selectedUser || !balanceAmount || !balanceReason) {
      toast.error('Missing information', 'Please fill in amount and reason');
      return;
    }
    setSavingBalance(true);
    try {
      await adminApi.updateBalance(selectedUser.id, {
        amount: parseFloat(balanceAmount),
        type: balanceType,
        reason: balanceReason,
      });
      toast.success('Balance updated', `${selectedUser.firstName}'s balance has been updated`);
      setBalanceModalOpen(false);
      loadUsers();
    } catch (error: any) {
      toast.error('Failed to update balance', error.message);
    } finally {
      setSavingBalance(false);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedUser || !notifTitle || !notifMessage) {
      toast.error('Missing information', 'Please fill in title and message');
      return;
    }
    setSendingNotif(true);
    try {
      await adminApi.sendNotification({
        userId: selectedUser.id,
        title: notifTitle,
        message: notifMessage,
        type: notifType,
      });
      toast.success('Notification sent', `Sent to ${selectedUser.firstName}`);
      setNotifyModalOpen(false);
    } catch (error: any) {
      toast.error('Failed to send notification', error.message);
    } finally {
      setSendingNotif(false);
    }
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'user',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white text-sm font-medium">
            {u.firstName?.[0] || u.email[0]}
          </div>
          <div>
            <p className="font-medium text-[#1c1917]">
              {u.firstName} {u.lastName}
            </p>
            <p className="text-xs text-[#a8a29e]">@{u.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (u) => <span className="text-sm text-[#44403c]">{u.email}</span>,
    },
    {
      key: 'balance',
      header: 'Portfolio',
      align: 'right',
      render: (u) => (
        <span className="font-medium text-[#1c1917]">
          ${parseFloat(u.portfolio?.currentValue || '0').toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => <StatusBadge status={u.verificationStatus} />,
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (u) => (
        <span className="text-sm text-[#78716c]">
          {format(new Date(u.createdAt), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => openDetailsModal(u)} title="View details">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => openBalanceModal(u)} title="Edit balance">
            <Wallet className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => openNotifyModal(u)} title="Send notification">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#1c1917]">Users</h1>
        <p className="mt-1 text-[#78716c]">Manage all platform users and their portfolios</p>
      </motion.div>

      <Card>
        <CardContent className="py-4">
          <Input
            placeholder="Search by name, email, or username..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(u) => u.id.toString()}
        loading={isLoading}
        emptyMessage="No users found"
      />

      {/* Balance Modal */}
      <Modal
        isOpen={balanceModalOpen}
        onClose={() => setBalanceModalOpen(false)}
        title="Update User Balance"
        description={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.email})` : ''}
        footer={
          <>
            <Button variant="outline" onClick={() => setBalanceModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBalance} isLoading={savingBalance}>
              Update Balance
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {selectedUser && (
            <div className="p-4 bg-[#f5f5f4] rounded-lg">
              <p className="text-sm text-[#78716c]">Current Portfolio Value</p>
              <p className="text-2xl font-bold text-[#1c1917]">
                ${parseFloat(selectedUser.portfolio?.currentValue || '0').toLocaleString()}
              </p>
            </div>
          )}
          <Select
            label="Action"
            options={[
              { value: 'add', label: 'Add to balance' },
              { value: 'subtract', label: 'Subtract from balance' },
              { value: 'set', label: 'Set exact balance' },
            ]}
            value={balanceType}
            onChange={(e) => setBalanceType(e.target.value as any)}
          />
          <Input
            label="Amount (USD)"
            type="number"
            placeholder="0.00"
            value={balanceAmount}
            onChange={(e) => setBalanceAmount(e.target.value)}
          />
          <Input
            label="Reason (required)"
            placeholder="e.g. Confirmed deposit of $5,000 via BTC"
            value={balanceReason}
            onChange={(e) => setBalanceReason(e.target.value)}
          />
        </div>
      </Modal>

      {/* Notification Modal */}
      <Modal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        title="Send Notification"
        description={selectedUser ? `To ${selectedUser.firstName} ${selectedUser.lastName}` : ''}
        footer={
          <>
            <Button variant="outline" onClick={() => setNotifyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification} isLoading={sendingNotif}>
              Send Notification
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="Notification title"
            value={notifTitle}
            onChange={(e) => setNotifTitle(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-[#44403c] mb-2">Message</label>
            <textarea
              className="block w-full rounded-lg border border-[#d6d3d1] bg-white p-4 text-sm text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] min-h-[100px]"
              placeholder="Notification message"
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
            />
          </div>
          <Select
            label="Type"
            options={[
              { value: 'info', label: 'Info' },
              { value: 'success', label: 'Success' },
              { value: 'warning', label: 'Warning' },
              { value: 'error', label: 'Error' },
            ]}
            value={notifType}
            onChange={(e) => setNotifType(e.target.value as any)}
          />
        </div>
      </Modal>

      {/* User Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="User Details"
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
            Close
          </Button>
        }
      >
        {loadingDetails || !userDetails ? (
          <div className="py-12 text-center text-[#78716c]">Loading user details…</div>
        ) : (
          <div className="space-y-6">
            {/* Profile header */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white text-lg font-semibold">
                {userDetails.user.firstName?.[0] || userDetails.user.email[0]}
              </div>
              <div>
                <p className="text-lg font-semibold text-[#1c1917]">
                  {userDetails.user.firstName} {userDetails.user.lastName}
                </p>
                <p className="text-sm text-[#78716c]">@{userDetails.user.username}</p>
              </div>
              <div className="ml-auto">
                <StatusBadge status={userDetails.user.verificationStatus} />
              </div>
            </div>

            {/* Account info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-[#f5f5f4] rounded-lg">
                <Mail className="h-4 w-4 text-[#78716c]" />
                <div className="min-w-0">
                  <p className="text-xs text-[#a8a29e]">Email</p>
                  <p className="text-sm text-[#1c1917] truncate">{userDetails.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[#f5f5f4] rounded-lg">
                <Globe className="h-4 w-4 text-[#78716c]" />
                <div className="min-w-0">
                  <p className="text-xs text-[#a8a29e]">Country</p>
                  <p className="text-sm text-[#1c1917] truncate">{userDetails.user.country || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[#f5f5f4] rounded-lg">
                <ShieldCheck className="h-4 w-4 text-[#78716c]" />
                <div className="min-w-0">
                  <p className="text-xs text-[#a8a29e]">Role</p>
                  <p className="text-sm text-[#1c1917] capitalize">{userDetails.user.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[#f5f5f4] rounded-lg">
                <KeyRound className="h-4 w-4 text-[#78716c]" />
                <div className="min-w-0">
                  <p className="text-xs text-[#a8a29e]">Password (hashed)</p>
                  <p className="text-xs font-mono text-[#1c1917] truncate">
                    {userDetails.user.passwordHash}
                  </p>
                </div>
              </div>
            </div>

            {/* Portfolio summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-[#f5f5f4] rounded-lg">
                <p className="text-xs text-[#78716c] uppercase tracking-wider">Current Value</p>
                <p className="mt-1 text-lg font-semibold text-[#1c1917]">
                  ${parseFloat(userDetails.user.portfolio?.currentValue || '0').toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-[#f5f5f4] rounded-lg">
                <p className="text-xs text-[#78716c] uppercase tracking-wider">Invested</p>
                <p className="mt-1 text-lg font-semibold text-[#1c1917]">
                  ${parseFloat(userDetails.user.portfolio?.totalInvested || '0').toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-[#f5f5f4] rounded-lg">
                <p className="text-xs text-[#78716c] uppercase tracking-wider">Profit</p>
                <p className="mt-1 text-lg font-semibold text-green-600">
                  ${parseFloat(userDetails.user.portfolio?.totalProfit || '0').toLocaleString()}
                </p>
              </div>
            </div>

            {/* Recent transactions */}
            <div>
              <p className="text-sm font-semibold text-[#1c1917] mb-2">
                Recent Transactions ({userDetails.transactions.length})
              </p>
              {userDetails.transactions.length === 0 ? (
                <p className="text-sm text-[#78716c]">No transactions yet.</p>
              ) : (
                <div className="border border-[#e7e5e4] rounded-lg divide-y divide-[#e7e5e4] max-h-48 overflow-y-auto">
                  {userDetails.transactions.slice(0, 10).map((t) => (
                    <div key={t.id} className="flex items-center justify-between px-3 py-2">
                      <div>
                        <p className="text-sm text-[#1c1917] capitalize">{t.type}</p>
                        <p className="text-xs text-[#a8a29e]">
                          {format(new Date(t.createdAt), 'MMM d, yyyy')} · {t.reference}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#1c1917]">
                          ${parseFloat(t.amount).toLocaleString()}
                        </p>
                        <StatusBadge status={t.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deposits & Withdrawals counts */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-[#f5f5f4] rounded-lg text-center">
                <p className="text-2xl font-bold text-[#1c1917]">{userDetails.deposits.length}</p>
                <p className="text-xs text-[#78716c]">Total Deposits</p>
              </div>
              <div className="p-4 bg-[#f5f5f4] rounded-lg text-center">
                <p className="text-2xl font-bold text-[#1c1917]">{userDetails.withdrawals.length}</p>
                <p className="text-xs text-[#78716c]">Total Withdrawals</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
