import { ToastAndroid, Platform } from "react-native";

export const showToast = (message: string) => {
    if (Platform.OS === "android") {
        ToastAndroid.showWithGravityAndOffset(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM,
            0,
            100
        );
    } else {
        console.log("Toast:", message);
    }
};
