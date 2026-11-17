import { useState } from 'react';
import { Alert, DeviceEventEmitter } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from '@/services/api';
import { getCachedUser, updateCachedUser } from '@/hooks/auth/useProfile';
import { showToast } from '@/utils/toast';

const MAX_BYTES = 2 * 1024 * 1024; // same limit as the server

/** Pick a photo from the phone and upload it as the profile picture. */
export const useAvatarUpload = () => {
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: 'image/*', copyToCacheDirectory: true, multiple: false });
    if (res.canceled || !res.assets?.[0]) return;
    const asset = res.assets[0];

    if (asset.size && asset.size > MAX_BYTES) {
      return Alert.alert('Image too large', 'Please choose an image that is 2 MB or smaller.');
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', { uri: asset.uri, name: asset.name || 'profile.jpg', type: asset.mimeType || 'image/jpeg' } as any);
      const { data } = await axios.post('/api/auth/profile/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });

      // Update the shared profile so Settings, the sidebar and this screen change at once.
      const current = getCachedUser();
      if (current && data?.image) {
        const next = { ...current, image: data.image };
        updateCachedUser(next);
        DeviceEventEmitter.emit('auth.changed', { user: next });
      }
      showToast('success', 'Profile picture updated');
    } catch (e: any) {
      Alert.alert('Upload failed', e?.response?.data?.message || 'Could not upload the image.');
    } finally {
      setUploading(false);
    }
  };

  return { uploading, pickAndUpload };
};
