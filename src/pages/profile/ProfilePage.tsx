// ============================================
// NEXORA CAPITAL - Profile Page
// ============================================

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Mail, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { userApi } from '@/services/api';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  country: z.string().min(1, 'Country is required'),
  preferredCurrency: z.string().min(1, 'Preferred currency is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const countries = [
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'SG', label: 'Singapore' },
  { value: 'JP', label: 'Japan' },
  { value: 'AE', label: 'United Arab Emirates' },
];

const currencies = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'AUD', label: 'Australian Dollar (AUD)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
  { value: 'SGD', label: 'Singapore Dollar (SGD)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'AED', label: 'UAE Dirham (AED)' },
];

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      country: user?.country || '',
      preferredCurrency: user?.preferredCurrency || 'USD',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        preferredCurrency: user.preferredCurrency,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await userApi.updateProfile(data);
      updateUser(data);
      toast.success('Profile updated', 'Your changes have been saved successfully');
    } catch (error: any) {
      toast.error('Failed to update profile', error.message || 'Please try again later');
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
        <h1 className="text-2xl font-bold text-[#1c1917]">Profile</h1>
        <p className="mt-1 text-[#78716c]">
          Manage your personal information and preferences
        </p>
      </motion.section>

      {/* Profile Overview */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-semibold text-[#1c1917]">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-[#78716c]">{user?.email}</p>
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                  <Badge variant="success" dot>
                    {user?.verificationStatus === 'verified'
                      ? 'Verified'
                      : 'Pending Verification'}
                  </Badge>
                  <span className="text-sm text-[#a8a29e]">
                    Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Edit Profile Form */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader title="Personal Information" />
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
                <Input
                  label="Last Name"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>

              <Input
                label="Email Address"
                leftIcon={<Mail className="h-4 w-4" />}
                value={user?.email}
                disabled
                helperText="Email cannot be changed. Contact support for assistance."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Select
                  label="Country"
                  options={countries}
                  error={errors.country?.message}
                  {...register('country')}
                />
                <Select
                  label="Preferred Currency"
                  options={currencies}
                  error={errors.preferredCurrency?.message}
                  {...register('preferredCurrency')}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-[#e7e5e4]">
                <Button type="submit" isLoading={false} disabled={!isDirty}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </motion.section>

      {/* Account Status */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card>
          <CardHeader title="Account Status" />
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Email Verified</p>
                  <p className="text-sm text-green-700">
                    Your email address has been verified
                  </p>
                </div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Identity Verified</p>
                  <p className="text-sm text-green-700">
                    Your identity has been verified
                  </p>
                </div>
              </div>
              <Badge variant="success">Verified</Badge>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
};

export default ProfilePage;
