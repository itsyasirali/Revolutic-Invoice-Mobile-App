import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Easing, ActivityIndicator, StatusBar } from 'react-native';

/**
 * In-app splash, shown while the session and fonts load. It continues straight
 * from the native splash (same blue background and logo) so there is no flash.
 */
export default function CustomSplashScreen() {
  const logo = useRef(new Animated.Value(0)).current;
  const text = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logo, { toValue: 1, duration: 450, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
      Animated.timing(text, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [logo, text]);

  return (
    <View style={{ flex: 1, backgroundColor: '#1AA3FF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
      <StatusBar barStyle="light-content" backgroundColor="#1AA3FF" />

      <Animated.View
        style={{
          opacity: logo,
          transform: [{ scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
        }}
      >
        <Image source={require('../../assets/images/adaptive-icon.png')} style={{ width: 150, height: 150 }} resizeMode="contain" />
      </Animated.View>

      <Animated.View
        style={{
          alignItems: 'center',
          opacity: text,
          transform: [{ translateY: text.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 30, fontWeight: '800', letterSpacing: 0.5 }}>Invoice Smarty</Text>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '500', marginTop: 6, textAlign: 'center' }}>
          Smarter Invoicing for Your Business
        </Text>
      </Animated.View>

      <View style={{ position: 'absolute', bottom: 56 }}>
        <ActivityIndicator color="#ffffff" />
      </View>
    </View>
  );
}
