import { useState } from 'react';
import axios from '@/services/api';

interface UpdateProfileInput {
  name?: string;
  email?: string;
}

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const useProfileSettings = () => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (input: UpdateProfileInput) => {
    setSaving(true);
    setError(null);
    try {
      const response = await axios.put('/api/auth/profile', input);
      return { success: true, user: response.data?.user };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update profile';
      setError(message);
      return { success: false, message };
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (input: ChangePasswordInput) => {
    setSaving(true);
    setError(null);
    try {
      await axios.put('/api/auth/profile', {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      });
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to change password';
      setError(message);
      return { success: false, message };
    } finally {
      setSaving(false);
    }
  };

  return { saving, error, updateProfile, changePassword };
};

export default useProfileSettings;
