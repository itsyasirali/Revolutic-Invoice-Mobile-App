import React from 'react';
import { Switch } from 'react-native';

/**
 * App-wide toggle in the brand blue. Android paints the thumb in the system
 * accent colour (green on many phones) unless the thumb colour is set.
 */
const AppSwitch: React.FC<{ value: boolean; onValueChange: (v: boolean) => void; disabled?: boolean }> = ({
  value,
  onValueChange,
  disabled,
}) => (
  <Switch
    value={value}
    onValueChange={onValueChange}
    disabled={disabled}
    trackColor={{ false: '#CBD5E1', true: '#93D3FF' }}
    thumbColor={value ? '#1AA3FF' : '#F8FAFC'}
    ios_backgroundColor="#CBD5E1"
  />
);

export default AppSwitch;
