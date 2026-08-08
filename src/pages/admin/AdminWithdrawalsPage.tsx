// ============================================
// NEXORA CAPITAL - Admin Withdrawals Page
// ============================================

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { adminApi } from '@/services/api';
import { format } from 'date-fns';

interface PendingWithdrawal {
  id: number;
  amount: string;
  currency: string;
  network: string;
  destinationAddress: string;
  fee: string;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
}

const AdminWithdrawalsPage = () => {
  const [withdrawals, setWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<PendingWithdrawal | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const toast = useToast();

  const load = () => {
    setIsLoading(true);
    adminApi
      .getPendingWithdrawals()
      .then((res) => setWithdrawals((res.data as PendingWithdrawal[]) || []))
      .catch(() => setWithdrawals([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (withdrawal: PendingWithdrawal) => {
    setProcessingId(withdrawal.id);
    try {
      await adminApi.approveWithdrawal(withdrawal.id);
      toast.success('Withdrawal approved', `$${parseFloat(withdrawal.amount).toLocaleString()} processed for ${withdrawal.user.firstName}`);
      load();
    } catch (error: any) {
      toast.error('Failed to approve', error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessingId(rejectModal.id);
    try {
      await adminApi.rejectWithdrawal(rejectModal.id, rejectReason || 'Withdrawal could not be processed');
      toast.success('Withdrawal rejected');
      setRejectModal(null);
      setRejectReason('');
      load();
    } catch (error: any) {
      toast.error('Failed to reject', error.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#1c1917]">Pending Withdrawals</h1>
        <p className="mt-1 text-[#78716c]">Review and approve user withdrawal requests</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-[#e7e5e4] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : withdrawals.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ArrowUpRight className="h-8 w-8" />}
            title="No pending withdrawals"
            description="All withdrawal requests have been processed"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((withdrawal) => (
            <Card key={withdrawal.id}>
              <CardContent className="py-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-[#a8a29e] uppercase tracking-wider">User</p>
                      <p className="font-medium text-[#1c1917]">
                        {withdrawal.user.firstName} {withdrawal.user.lastName}
                      </p>
                      <p className="text-xs text-[#78716c]">{withdrawal.user.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#a8a29e] uppercase tracking-wider">Amount</p>
                      <p className="font-semibold text-[#1c1917]">
                        ${parseFloat(withdrawal.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-[#78716c]">
                        Fee: ${parseFloat(withdrawal.fee).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#a8a29e] uppercase tracking-wider">Destination</p>
                      <p className="font-mono text-xs text-[#44403c] break-all">
                        {withdrawal.destinationAddress}
                      </p>
                      <p className="text-xs text-[#78716c]">
                        {withdrawal.currency} · {withdrawal.network}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#a8a29e] uppercase tracking-wider">Date</p>
                      <p className="text-sm text-[#44403c]">
                        {format(new Date(withdrawal.createdAt), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-[#78716c]">
                        {format(new Date(withdrawal.createdAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<X className="h-4 w-4" />}
                      onClick={() => setRejectModal(withdrawal)}
                      disabled={processingId === withdrawal.id}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<Check className="h-4 w-4" />}
                      onClick={() => handleApprove(withdrawal)}
                      isLoading={processingId === withdrawal.id}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="Reject Withdrawal"
        description="The user will be notified with your reason"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectModal(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} isLoading={processingId === rejectModal?.id}>
              Reject Withdrawal
            </Button>
          </>
        }
      >
        <Input
          label="Reason for rejection"
          placeholder="e.g. Withdrawal eligibility requirements not met"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default AdminWithdrawalsPage;
