// ============================================
// NEXORA CAPITAL - Admin Deposits Page
// ============================================

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { adminApi } from '@/services/api';
import { format } from 'date-fns';
import { ArrowDownLeft } from 'lucide-react';

interface PendingDeposit {
  id: number;
  amount: string;
  currency: string;
  network: string;
  walletAddress: string;
  txHash: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
}

const AdminDepositsPage = () => {
  const [deposits, setDeposits] = useState<PendingDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<PendingDeposit | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const toast = useToast();

  const load = () => {
    setIsLoading(true);
    adminApi
      .getPendingDeposits()
      .then((res) => setDeposits((res.data as PendingDeposit[]) || []))
      .catch(() => setDeposits([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (deposit: PendingDeposit) => {
    setProcessingId(deposit.id);
    try {
      await adminApi.approveDeposit(deposit.id);
      toast.success('Deposit approved', `$${parseFloat(deposit.amount).toLocaleString()} added to ${deposit.user.firstName}'s portfolio`);
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
      await adminApi.rejectDeposit(rejectModal.id, rejectReason || 'Deposit could not be verified');
      toast.success('Deposit rejected');
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
        <h1 className="text-2xl font-bold text-[#1c1917]">Pending Deposits</h1>
        <p className="mt-1 text-[#78716c]">Review and confirm user deposits</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-[#e7e5e4] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : deposits.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ArrowDownLeft className="h-8 w-8" />}
            title="No pending deposits"
            description="All deposits have been reviewed"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {deposits.map((deposit) => (
            <Card key={deposit.id}>
              <CardContent className="py-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-[#a8a29e] uppercase tracking-wider">User</p>
                      <p className="font-medium text-[#1c1917]">
                        {deposit.user.firstName} {deposit.user.lastName}
                      </p>
                      <p className="text-xs text-[#78716c]">{deposit.user.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#a8a29e] uppercase tracking-wider">Amount</p>
                      <p className="font-semibold text-[#1c1917]">
                        ${parseFloat(deposit.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-[#78716c]">
                        {deposit.currency} · {deposit.network}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#a8a29e] uppercase tracking-wider">Tx Hash</p>
                      <p className="font-mono text-xs text-[#44403c] break-all">
                        {deposit.txHash || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#a8a29e] uppercase tracking-wider">Date</p>
                      <p className="text-sm text-[#44403c]">
                        {format(new Date(deposit.createdAt), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-[#78716c]">
                        {format(new Date(deposit.createdAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<X className="h-4 w-4" />}
                      onClick={() => setRejectModal(deposit)}
                      disabled={processingId === deposit.id}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<Check className="h-4 w-4" />}
                      onClick={() => handleApprove(deposit)}
                      isLoading={processingId === deposit.id}
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
        title="Reject Deposit"
        description="The user will be notified with your reason"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectModal(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} isLoading={processingId === rejectModal?.id}>
              Reject Deposit
            </Button>
          </>
        }
      >
        <Input
          label="Reason for rejection"
          placeholder="e.g. Transaction hash could not be verified on-chain"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default AdminDepositsPage;
