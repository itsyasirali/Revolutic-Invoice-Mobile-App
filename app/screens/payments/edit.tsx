import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PaymentForm from '../../components/payments/PaymentForm';

// We don't need usePayments hook here anymore because PaymentForm handles the API call internally.
// We just need to handle the success navigation.

const PaymentEditScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { paymentData } = params;

    const [payment, setPayment] = useState<any>(null);

    useEffect(() => {
        if (paymentData) {
            try {
                const parsed = JSON.parse(paymentData as string);
                setPayment(parsed);
            } catch (e) {
                Alert.alert("Error", "Invalid payment data");
                router.back();
            }
        } else {
            Alert.alert("Error", "No payment data provided");
            router.back();
        }
    }, [paymentData]);

    const handleSave = async (updatedPayment: any) => {
        // PaymentForm calls this function when the save is successful internally.
        // It passes the updated payment data (thanks to our fix in usePaymentForm/PaymentForm).
        if (updatedPayment) {
            Alert.alert("Success", "Payment updated successfully", [
                {
                    text: "OK",
                    onPress: () => router.replace({
                        pathname: "/screens/payments/preview",
                        params: {
                            id: updatedPayment.id,
                            paymentData: JSON.stringify(updatedPayment)
                        }
                    })
                }
            ]);
        }
        return { success: true };
    };

    if (!payment) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#2563eb" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <PaymentForm
                payment={payment}
                onSave={handleSave}
                onCancel={() => router.back()}
            />
        </SafeAreaView>
    );
};

export default PaymentEditScreen;
