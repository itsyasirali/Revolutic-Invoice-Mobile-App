import { ToastAndroid, Platform } from "react-native";

export const showToast = (typeOrMsg: string, message?: string) => {
    const text = message || typeOrMsg;
    if (Platform.OS === "android") {
        ToastAndroid.showWithGravityAndOffset(
            text,
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM,
            0,
            100
        );
    } else {
        console.log("Toast:", text);
    }
};
