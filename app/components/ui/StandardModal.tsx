import React, { useState, useEffect } from 'react';
import { Modal, View, Pressable, Keyboard, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    height = '94%',
}) => {
    const insets = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(showEvent, (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener(hideEvent, () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    // When keyboard is open, lift content above the keyboard so fields are never overlapped
    const activeBottomPadding = keyboardHeight > 0
        ? keyboardHeight
        : Math.max(insets.bottom, 12);

    return (
        <Modal
            visible={visible}
            animationType={animationType}
            onRequestClose={onClose}
            statusBarTranslucent
            transparent={true}
        >
            <View style={styles.overlay}>
                {/* Independent Backdrop: tapping outside closes modal */}
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Close modal"
                >
                    <View style={styles.backdrop} />
                </Pressable>

                {/* Modal Sheet Container */}
                <View
                    style={[
                        styles.sheet,
                        height !== 'auto' ? { height: height as any } : {},
                        { paddingBottom: activeBottomPadding },
                    ]}
                >
                    <View style={styles.content}>
                        {children}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    sheet: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 16,
    },
    content: {
        flex: 1,
    },
});

export default StandardModal;
