import React from 'react';
import { View, Text, Image } from 'react-native';
import { IP } from '@/utils/IP';

/** A stored profile picture is an https URL or a path on the server. */
export const resolveImageUrl = (image?: string | null): string | null => {
  if (!image) return null;
  return /^(https?:|data:)/i.test(image) ? image : `${IP}/${image.replace(/^\//, '')}`;
};

interface Props {
  image?: string | null;
  name: string;
  size?: number;
  /** "primary": blue circle with a white initial. "white": white circle with a blue initial (for blue backgrounds). */
  variant?: 'primary' | 'white';
  /** Adds a white ring (for use on a blue background). */
  ring?: boolean;
}

/** Profile picture, or the first letter of the name when there is none. */
const Avatar: React.FC<Props> = ({ image, name, size = 64, variant = 'primary', ring }) => {
  const uri = resolveImageUrl(image);
  const base = { width: size, height: size, borderRadius: size / 2 };
  const ringStyle = ring ? { borderWidth: 2, borderColor: '#ffffff' } : null;

  if (uri) {
    return <Image source={{ uri }} style={[base, ringStyle, { backgroundColor: '#e2e8f0' }]} />;
  }
  return (
    <View
      style={[base, ringStyle, { backgroundColor: variant === 'white' ? '#ffffff' : '#1AA3FF', alignItems: 'center', justifyContent: 'center' }]}
    >
      <Text style={{ color: variant === 'white' ? '#1AA3FF' : '#ffffff', fontSize: size * 0.4, fontWeight: '700' }}>
        {(name || 'U').charAt(0).toUpperCase()}
      </Text>
    </View>
  );
};

export default Avatar;
