// ============================================
// NEXORA CAPITAL - Withdraw Page
// ============================================

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Check,
  Wallet,
  Lock,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useToast } from '@/components/ui/Toast';
import { useDashboardStore } from '@/store/dashboardStore';
import { withdrawalApi } from '@/services/api';

interface EligibilityInfo {
  eligible: boolean;
  reason?: string;
  daysUntil?: number;
  progress?: number;
}

const withdrawalSchema = z.object({
  amount: z.number().min(100, 'Minimum withdrawal is $100'),
  currency: z.string().min(1, 'Please select a currency'),
  network: z.string().min(1, 'Please select a network'),
  destinationAddress: z.string().min(10, 'Please enter a valid wallet address'),
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

const steps = [
  { id: 1, name: 'Eligibility' },
  { id: 2, name: 'Details' },
  { id: 3, name: 'Confirm' },
];

const currencies = [
  { value: 'USDT', label: 'Tether (USDT)' },
  { value: 'USDC', label: 'USD Coin (USDC)' },
];

const networks = [
  { value: 'TRC20', label: 'Tron (TRC20) - Fast & Low Fee' },
  { value: 'ERC20', label: 'Ethereum (ERC20)' },
];

const WithdrawPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilityInfo | null>(null);
  const { dashboardData } = useDashboardStore();
  const toast = useToast();

  const portfolio = dashboardData?.portfolio;
  const goal = dashboardData?.goal;

  // Fetch real withdrawal eligibility from backend
  useEffect(() => {
    withdrawalApi
      .checkEligibility()
      .then((res) => setEligibility(res.data as EligibilityInfo))
      .catch(() => {
        setEligibility({
          eligible: false,
          reason: 'Unable to verify eligibility. Please try again later.',
        });
      });
  }, []);

  const isEligible = eligibility?.eligible ?? false;
  const daysUntilEligible = eligibility?.daysUntil ?? 0;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      currency: '',
      network: '',
      destinationAddress: '',
    },
  });

  const withdrawalAmount = watch('amount');
  const withdrawalFee = withdrawalAmount * 0.005; // 0.5% fee
  const receiveAmount = withdrawalAmount - withdrawalFee;

  const onSubmit = async (data: WithdrawalFormData) => {
    setIsSubmitting(true);
    try {
      await withdrawalApi.createWithdrawal({
        amount: data.amount,
        currency: data.currency,
        network: data.network,
        destinationAddress: data.destinationAddress,
      });
      setIsSubmitted(true);
      toast.success('Withdrawal submitted', 'Your request is being processed');
    } catch (error: any) {
      toast.error('Failed to submit withdrawal', error.message || 'Please try again later');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1c1917] mb-2">
            Withdrawal Submitted
          </h2>
          <p className="text-[#78716c] mb-6 max-w-md mx-auto">
            Your withdrawal request has been received and is being processed. You will receive a confirmation email shortly.
          </p>
          <Button onClick={() => window.location.reload()}>
            Make Another Withdrawal
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-[#1c1917]">Withdraw Funds</h1>
        <p className="mt-1 text-[#78716c]">
          Request a withdrawal from your portfolio
        </p>
      </motion.section>

      {/* Step Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${
                  currentStep >= step.id
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-[#e7e5e4] text-[#78716c]'
                }`}
              >
                {step.id}
              </div>
              <div className="ml-3 hidden sm:block">
                <p
                  className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-[#1c1917]' : 'text-[#a8a29e]'
                  }`}
                >
                  {step.name}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-[#1e3a5f]' : 'bg-[#e7e5e4]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Form Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-[#1c1917] mb-2">
                        Eligibility Check
                      </h3>
                      <p className="text-[#78716c] mb-6">
                        Review your withdrawal eligibility status
                      </p>

                      {/* Portfolio Summary */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-[#f5f5f4] rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Wallet className="h-4 w-4 text-[#1e3a5f]" />
                            <span className="text-sm text-[#78716c]">Available</span>
                          </div>
                          <p className="text-xl font-semibold text-[#1c1917]">
                            ${(portfolio?.currentValue || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 bg-[#f5f5f4] rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-[#78716c]">Profit</span>
                          </div>
                          <p className="text-xl font-semibold text-green-600">
                            +${(portfolio?.totalProfit || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Goal Progress */}
                      <div className="p-4 bg-[#f5f5f4] rounded-lg mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-[#78716c]">Goal Progress</span>
                          <span className="font-medium text-[#1c1917]">
                            {goal?.progress || 0}%
                          </span>
                        </div>
                        <ProgressBar value={goal?.progress || 0} showValue={false} />
                        <p className="mt-2 text-xs text-[#a8a29e]">
                          Target: ${(goal?.targetAmount || 0).toLocaleString()}
                        </p>
                      </div>

                      {/* Eligibility Status */}
                      {isEligible ? (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-green-800">
                                You are eligible to withdraw
                              </p>
                              <p className="text-sm text-green-700 mt-1">
                                You have reached the minimum goal progress required for withdrawals.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-amber-800">
                                Withdrawal not yet available
                              </p>
                              <p className="text-sm text-amber-700 mt-1">
                                You need to reach 50% of your investment goal before withdrawals are enabled. 
                                Estimated time remaining: {daysUntilEligible} days.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-[#1c1917] mb-2">
                        Withdrawal Details
                      </h3>
                      <p className="text-[#78716c] mb-6">
                        Enter the details for your withdrawal
                      </p>

                      <div className="space-y-4">
                        <Input
                          label="Amount (USD)"
                          type="number"
                          placeholder="Enter withdrawal amount"
                          helperText={`Available: $${(portfolio?.currentValue || 0).toLocaleString()}`}
                          error={errors.amount?.message}
                          {...register('amount', { valueAsNumber: true })}
                        />

                        <Select
                          label="Currency"
                          options={currencies}
                          placeholder="Select currency"
                          error={errors.currency?.message}
                          {...register('currency')}
                        />

                        <Select
                          label="Network"
                          options={networks}
                          placeholder="Select network"
                          error={errors.network?.message}
                          {...register('network')}
                        />

                        <Input
                          label="Destination Wallet Address"
                          placeholder="Enter your wallet address"
                          helperText="Double-check your address - withdrawals cannot be reversed"
                          error={errors.destinationAddress?.message}
                          {...register('destinationAddress')}
                        />
                      </div>

                      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-800">
                            Withdrawal fee: 0.5%. Minimum withdrawal: $100.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-[#1c1917] mb-2">
                        Confirm Withdrawal
                      </h3>
                      <p className="text-[#78716c] mb-6">
                        Review your withdrawal details before confirming
                      </p>

                      <div className="space-y-4 bg-[#f5f5f4] p-6 rounded-xl">
                        <div className="flex justify-between">
                          <span className="text-[#78716c]">Withdrawal Amount</span>
                          <span className="font-medium text-[#1c1917]">
                            ${withdrawalAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#78716c]">Network Fee (0.5%)</span>
                          <span className="font-medium text-red-600">
                            -${withdrawalFee.toLocaleString()}
                          </span>
                        </div>
                        <div className="border-t border-[#d6d3d1] pt-3">
                          <div className="flex justify-between">
                            <span className="font-medium text-[#1c1917]">You Will Receive</span>
                            <span className="font-semibold text-green-600">
                              ${receiveAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between pt-2">
                          <span className="text-[#78716c]">Currency</span>
                          <span className="font-medium text-[#1c1917]">
                            {watch('currency')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#78716c]">Network</span>
                          <span className="font-medium text-[#1c1917]">
                            {watch('network')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#78716c]">Destination</span>
                          <span className="font-mono text-sm text-[#1c1917]">
                            {watch('destinationAddress').slice(0, 8)}...{watch('destinationAddress').slice(-8)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-blue-800">
                            Withdrawals are processed within 24-48 hours. You will receive an email confirmation once processed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between p-6 border-t border-[#e7e5e4]">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Back
              </Button>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={currentStep === 1 && !isEligible}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Continue
                </Button>
              ) : (
                <Button type="submit" isLoading={isSubmitting}>
                  Confirm Withdrawal
                </Button>
              )}
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default WithdrawPage;
