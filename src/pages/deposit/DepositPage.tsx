// ============================================
// NEXORA CAPITAL - Deposit Page
// ============================================

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  QrCode,
  Wallet,
  AlertCircle,
  Clock,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { depositApi } from '@/services/api';

interface WalletInfo {
  currency: string;
  network: string;
  address: string;
}

const depositSchema = z.object({
  currency: z.string().min(1, 'Please select a cryptocurrency'),
  network: z.string().min(1, 'Please select a network'),
  amount: z.number().min(1, 'Amount must be at least 1'),
  txHash: z.string().min(10, 'Transaction hash is required'),
});

type DepositFormData = z.infer<typeof depositSchema>;

const steps = [
  { id: 1, name: 'Select Currency' },
  { id: 2, name: 'Choose Network' },
  { id: 3, name: 'Deposit Details' },
  { id: 4, name: 'Confirm' },
];

const currencies = [
  { value: 'USDT', label: 'Tether (USDT)' },
  { value: 'USDC', label: 'USD Coin (USDC)' },
  { value: 'BTC', label: 'Bitcoin (BTC)' },
  { value: 'ETH', label: 'Ethereum (ETH)' },
  { value: 'SOL', label: 'Solana (SOL)' },
];

// Human-friendly descriptions for each supported network
const networkLabels: Record<string, string> = {
  ERC20: 'Ethereum (ERC20) — reliable, widely supported',
  Bitcoin: 'Bitcoin network — native BTC transfers',
  Solana: 'Solana network — fast & low fee',
};

const DepositPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      currency: '',
      network: '',
      amount: 0,
      txHash: '',
    },
  });

  const selectedCurrency = watch('currency');
  const selectedNetwork = watch('network');

  // Network options are derived from the currencies we actually support,
  // so users can only pick a network we can receive funds on.
  const networkOptions = wallets
    .filter((w) => w.currency === selectedCurrency)
    .map((w) => ({
      value: w.network,
      label: networkLabels[w.network] || w.network,
    }));

  // Fetch wallet addresses from backend
  useEffect(() => {
    depositApi
      .getWallets()
      .then((res) => setWallets(res.data as WalletInfo[]))
      .catch(() => {
        // Fallback wallet addresses (match backend config)
        setWallets([
          { currency: 'BTC', network: 'Bitcoin', address: 'bc1q8waqj9qurtpu07q0v826qr60n7jyxw247q8xes' },
          { currency: 'ETH', network: 'ERC20', address: '0x5D1Dea66d22BdA4Bd0C8737CC236A76334326056' },
          { currency: 'SOL', network: 'Solana', address: 'HjWcM41m6aYwZVAESCFrk1EAhqHP6MV9h5pRRtnCmT5m' },
          { currency: 'USDT', network: 'ERC20', address: '0x5d1dea66d22bda4bd0c8737cc236a76334326056' },
          { currency: 'USDC', network: 'ERC20', address: '0x5D1Dea66d22BdA4Bd0C8737CC236A76334326056' },
        ]);
      });
  }, []);

  // Resolve wallet address based on selected currency/network
  const walletAddress =
    wallets.find(
      (w) =>
        w.currency === selectedCurrency &&
        (w.network === selectedNetwork || selectedCurrency === 'BTC' || selectedCurrency === 'SOL')
    )?.address ||
    wallets.find((w) => w.currency === selectedCurrency)?.address ||
    'Select a currency and network to view the address';

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (data: DepositFormData) => {
    setIsSubmitting(true);
    try {
      await depositApi.createDeposit({
        currency: data.currency,
        network: data.network,
        amount: data.amount,
        txHash: data.txHash,
      });
      setIsSubmitted(true);
      toast.success('Deposit submitted', 'Your deposit is now pending review');
    } catch (error: any) {
      toast.error('Failed to submit deposit', error.message || 'Please try again later');
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
            <Clock className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1c1917] mb-2">
            Deposit Submitted
          </h2>
          <p className="text-[#78716c] mb-6 max-w-md mx-auto">
            Your deposit is now pending review. You will receive a notification once it has been confirmed.
          </p>
          <div className="bg-[#f5f5f4] rounded-lg p-4 max-w-sm mx-auto mb-8">
            <p className="text-sm text-[#78716c]">Transaction Hash</p>
            <p className="font-mono text-sm text-[#1c1917] break-all">
              {watch('txHash')}
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Make Another Deposit
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
        <h1 className="text-2xl font-bold text-[#1c1917]">Deposit Funds</h1>
        <p className="mt-1 text-[#78716c]">
          Add funds to your portfolio securely
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
                        Select Cryptocurrency
                      </h3>
                      <p className="text-[#78716c] mb-6">
                        Choose the cryptocurrency you want to deposit
                      </p>
                      <Select
                        label="Cryptocurrency"
                        options={currencies}
                        placeholder="Select a cryptocurrency"
                        error={errors.currency?.message}
                        {...register('currency')}
                      />
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
                        Choose Network
                      </h3>
                      <p className="text-[#78716c] mb-6">
                        Select the blockchain network for your {selectedCurrency} deposit
                      </p>
                      <Select
                        label="Network"
                        options={networkOptions}
                        placeholder={selectedCurrency ? 'Select a network' : 'Select a currency first'}
                        error={errors.network?.message}
                        {...register('network')}
                      />

                      {/* What is a network? explainer */}
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-blue-800 space-y-1.5">
                            <p className="font-medium">What is a network?</p>
                            <p>
                              A network is the blockchain "road" your funds travel on to
                              reach us. When you send crypto from your wallet or exchange,
                              you choose a network — and it must match the one you select
                              here. The networks we support are:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                              <li>
                                <span className="font-medium">ERC20</span> — the Ethereum
                                network. Used for ETH, USDT and USDC. Reliable and widely
                                supported.
                              </li>
                              <li>
                                <span className="font-medium">Bitcoin</span> — the native
                                Bitcoin network, used for BTC deposits.
                              </li>
                              <li>
                                <span className="font-medium">Solana</span> — the Solana
                                network, used for SOL. Fast with very low fees.
                              </li>
                            </ul>
                            <p className="pt-1">
                              Tip: On your exchange, pick the network that exactly matches
                              your selection here. For USDT/USDC, choose ERC20.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-800">
                            Important: The network you choose here must match the network
                            you send from. Deposits sent on the wrong network cannot be
                            recovered.
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
                        Deposit Details
                      </h3>
                      <p className="text-[#78716c] mb-6">
                        Send your funds to the wallet address below
                      </p>

                      {/* Wallet Address */}
                      <div className="p-6 bg-[#f5f5f4] rounded-xl mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Wallet className="h-5 w-5 text-[#1e3a5f]" />
                            <span className="font-medium text-[#1c1917]">
                              Wallet Address
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 text-sm text-[#1e3a5f] hover:underline"
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="font-mono text-sm text-[#1c1917] break-all bg-white p-3 rounded-lg border border-[#d6d3d1]">
                          {walletAddress}
                        </p>
                      </div>

                      {/* QR Code Placeholder */}
                      <div className="flex justify-center mb-6">
                        <div className="w-40 h-40 bg-white border border-[#d6d3d1] rounded-xl flex items-center justify-center">
                          <QrCode className="h-20 w-20 text-[#a8a29e]" />
                        </div>
                      </div>

                      <Input
                        label="Transaction Hash (TxHash)"
                        placeholder="Enter your transaction hash"
                        helperText="You can find this in your wallet after sending the transaction"
                        error={errors.txHash?.message}
                        {...register('txHash')}
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-[#1c1917] mb-2">
                        Confirm Deposit
                      </h3>
                      <p className="text-[#78716c] mb-6">
                        Review your deposit details before submitting
                      </p>

                      <div className="space-y-4 bg-[#f5f5f4] p-6 rounded-xl">
                        <div className="flex justify-between">
                          <span className="text-[#78716c]">Cryptocurrency</span>
                          <span className="font-medium text-[#1c1917]">
                            {selectedCurrency}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#78716c]">Network</span>
                          <span className="font-medium text-[#1c1917]">
                            {selectedNetwork}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#78716c]">Wallet Address</span>
                          <span className="font-mono text-sm text-[#1c1917]">
                            {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#78716c]">Transaction Hash</span>
                          <span className="font-mono text-sm text-[#1c1917]">
                            {watch('txHash').slice(0, 12)}...
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          Your deposit will be reviewed and confirmed within 1-2 hours. You will receive a notification once processed.
                        </p>
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
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Continue
                </Button>
              ) : (
                <Button type="submit" isLoading={isSubmitting}>
                  Submit Deposit
                </Button>
              )}
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default DepositPage;
