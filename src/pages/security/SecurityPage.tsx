// ============================================
// NEXORA CAPITAL - Security Page
// ============================================

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Smartphone,
  Globe,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { userApi } from '@/services/api';
import { format } from 'date-fns';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface SessionRow {
  id: string;
  device: string;
  location: string;
  ip: string;
  current: boolean;
  lastActive: string;
}

interface LoginRow {
  id: string;
  device: string;
  location: string;
  ip: string;
  status: 'success' | 'failed';
  date: string;
}

const SecurityPage = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSessions, setActiveSessions] = useState<SessionRow[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginRow[]>([]);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Load sessions and login history from backend
  useEffect(() => {
    userApi
      .getSessions()
      .then((res) => {
        const data = (res.data as any[]) || [];
        setActiveSessions(
          data.map((s) => ({
            id: s.id.toString(),
            device: s.device || 'Unknown device',
            location: s.location || 'Unknown',
            ip: s.ipAddress || 'Unknown',
            current: s.current,
            lastActive: s.lastActiveAt || s.createdAt,
          }))
        );
      })
      .catch(() => setActiveSessions([]));

    userApi
      .getLoginHistory()
      .then((res) => {
        const data = (res.data as any[]) || [];
        setLoginHistory(
          data.map((l) => ({
            id: l.id.toString(),
            device: l.device || 'Unknown device',
            location: l.location || 'Unknown',
            ip: l.ipAddress || 'Unknown',
            status: l.status,
            date: l.createdAt,
          }))
        );
      })
      .catch(() => setLoginHistory([]));
  }, []);

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsSubmitting(true);
    try {
      await userApi.changePassword(data.currentPassword, data.newPassword);
      reset();
      toast.success('Password updated', 'Your password has been changed successfully');
    } catch (error: any) {
      toast.error('Failed to update password', error.message || 'Please try again later');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#1c1917]">Security</h1>
        <p className="mt-1 text-[#78716c]">
          Manage your account security and authentication settings
        </p>
      </motion.section>

      {/* Security Status */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#1c1917]">
                  Your account is secure
                </h2>
                <p className="text-sm text-[#78716c]">
                  Last security check: {format(new Date(), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Password */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader
            title="Change Password"
            subtitle="Update your password regularly to keep your account secure"
          />
          <form onSubmit={handleSubmit(onSubmitPassword)}>
            <CardContent className="space-y-4">
              <Input
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-[#a8a29e] hover:text-[#78716c]"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
              />
              <Input
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-[#a8a29e] hover:text-[#78716c]"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                helperText="Must be at least 8 characters"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[#a8a29e] hover:text-[#78716c]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={isSubmitting}>Update Password</Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </motion.section>

      {/* Two-Factor Authentication */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card>
          <CardHeader
            title="Two-Factor Authentication"
            subtitle="Add an extra layer of security to your account"
          />
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-[#f5f5f4] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <Smartphone className="h-5 w-5 text-[#78716c]" />
                </div>
                <div>
                  <p className="font-medium text-[#1c1917]">Authenticator App</p>
                  <p className="text-sm text-[#78716c]">
                    Use an authenticator app to generate codes
                  </p>
                </div>
              </div>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Active Sessions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card>
          <CardHeader
            title="Active Sessions"
            subtitle="Manage devices where you're currently logged in"
          />
          <CardContent className="space-y-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-[#f5f5f4] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Globe className="h-5 w-5 text-[#78716c]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#1c1917]">{session.device}</p>
                      {session.current && (
                        <Badge variant="success" size="sm">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#78716c]">
                      {session.location} • {session.ip}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.section>

      {/* Login History */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Card>
          <CardHeader
            title="Login History"
            subtitle="Recent login activity on your account"
          />
          <CardContent className="space-y-3">
            {loginHistory.map((login) => (
              <div
                key={login.id}
                className="flex items-center justify-between p-4 bg-[#f5f5f4] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    {login.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[#1c1917]">{login.device}</p>
                    <p className="text-sm text-[#78716c]">
                      {login.location} • {login.ip}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#44403c]">
                    {format(new Date(login.date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-[#a8a29e]">
                    {format(new Date(login.date), 'h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
};

export default SecurityPage;
