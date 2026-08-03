import React from 'react';
import { Modal, View, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface StandardModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    animationType?: 'slide' | 'fade' | 'none';
    height?: string | number;
}

const StandardModal: React.FC<StandardModalProps> = ({
    visible,
    onClose,
    children,
    animationType = 'slide',
    height = '96%',
}) => {
    return (
        <Modal
            visible={visible}
            animationType={animationType}
            onRequestClose={onClose}
            statusBarTranslucent
            transparent={true}
        >
            <TouchableOpacity
                className="flex-1 bg-black/10 justify-end"
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View
                        className="w-full bg-white shadow-lg rounded-t-3xl overflow-hidden"
                        style={height !== 'auto' ? { height: height as any } : {}}
                    >
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} style={height !== 'auto' ? { flex: 1 } : {}}>
                            <SafeAreaView
                                className={height === 'auto' ? '' : 'flex-1'}
                                edges={['bottom', 'left', 'right']}
                            >
                                {children}
                            </SafeAreaView>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

export default StandardModal;
