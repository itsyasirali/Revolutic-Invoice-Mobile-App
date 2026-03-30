import React, { useEffect, useState } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DownloadPopInProps {
    visible: boolean;
    fileName: string;
    onHide: () => void;
}

const DownloadPopIn: React.FC<DownloadPopInProps> = ({ visible, fileName, onHide }) => {
    const [translateY] = useState(new Animated.Value(100));

    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 40,
                friction: 7
            }).start();

            const timer = setTimeout(() => {
                hide();
            }, 6000);

            return () => clearTimeout(timer);
        } else if (shouldRender) {
            hide();
        }
    }, [visible]);

    const hide = () => {
        Animated.timing(translateY, {
            toValue: 100,
            duration: 300,
            useNativeDriver: true
        }).start(() => {
            setShouldRender(false);
            onHide();
        });
    };

    if (!shouldRender) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY }] }
            ]}
            className="bg-slate-900 mx-4 rounded-2xl p-4 shadow-xl border border-slate-800"
        >
            <View className="flex-row items-center">
                <View className="bg-cyan-500 p-2 rounded-full mr-3">
                    <Ionicons name="checkmark-done" size={20} color="white" />
                </View>
                <View className="flex-1">
                    <Text className="text-white font-bold text-sm">Download Complete</Text>
                    <Text className="text-slate-400 text-xs" numberOfLines={1}>{fileName}</Text>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        zIndex: 9999,
    },
});

export default DownloadPopIn;
