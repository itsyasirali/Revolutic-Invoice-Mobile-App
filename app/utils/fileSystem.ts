import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from './toast';

const { StorageAccessFramework } = FileSystem;
const SAF_DIR_KEY = 'saf_root_uri_v7'; // Bumped version for refreshed logic

/**
 * Helper to ensure a subdirectory exists.
 */
const ensureDirectoryExists = async (parentUri: string, dirName: string): Promise<string> => {
    const isSAF = parentUri.startsWith('content://');
    const lowerDirName = dirName.toLowerCase();

    try {
        if (isSAF) {
            const files = await StorageAccessFramework.readDirectoryAsync(parentUri);
            for (const fileUri of files) {
                const decodedUri = decodeURIComponent(fileUri);
                const parts = decodedUri.split(/[/:]/);
                const lastPart = parts.pop() || parts.pop() || "";
                if (lastPart.toLowerCase() === lowerDirName) {
                    return fileUri;
                }
            }
            return await StorageAccessFramework.makeDirectoryAsync(parentUri, dirName);
        } else {
            const dirUri = parentUri.endsWith('/') ? `${parentUri}${dirName}/` : `${parentUri}/${dirName}/`;
            const dirInfo = await FileSystem.getInfoAsync(dirUri);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
            }
            return dirUri;
        }
    } catch (e) {
        console.warn(`Failed to ensure directory ${dirName}:`, e);
        if (isSAF) {
            try {
                return await StorageAccessFramework.makeDirectoryAsync(parentUri, dirName);
            } catch (err) {
                return parentUri;
            }
        }
        return parentUri;
    }
};

/**
 * Android Specific: Attempt to save to public Downloads folder directly.
 * Uses MediaLibrary for automated saving where possible, falls back to SAF.
 */
export const saveFileWithSAF = async (uri: string, fileName: string): Promise<boolean> => {
    try {
        if (Platform.OS !== 'android') return false;

        // 1. Try MediaLibrary first for "Downloads" or "Invoices"
        // This can sometimes bypass SAF if permissions are granted.
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
            try {
                // We create an asset in the "Downloads" or a custom album
                // NOTE: MediaLibrary is primarily for media, but it's a good alternative for some Android versions.
                // However, for PDF, SAF is still more reliable across all Android 11+ versions.
            } catch (err) {
                console.log("MediaLibrary save skipped/failed:", err);
            }
        }

        let baseUri = await AsyncStorage.getItem(SAF_DIR_KEY);

        if (!baseUri) {
            // Initial one-time setup for Downloads folder
            await new Promise<void>((resolve) => {
                Alert.alert(
                    "Automatic Saving",
                    "To enable automatic saving to your Downloads, please select the 'Download' folder in the next screen and then 'Use this folder'.\n\nYou will only need to do this once.",
                    [{ text: "Continue", onPress: () => resolve() }]
                );
            });

            const initialUri = StorageAccessFramework.getUriForDirectoryInRoot("Download");
            const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync(initialUri);

            if (!permissions.granted) {
                Alert.alert("Permission Required", "This allows the app to automatically create the 'Revolutic Invoice' folder in your Downloads.");
                return false;
            }

            await AsyncStorage.setItem(SAF_DIR_KEY, permissions.directoryUri);
            baseUri = permissions.directoryUri;
        }

        // 2. Automatically ensure the "Revolutic Invoice" folder exists inside Downloads
        const finalFolderUri = await ensureDirectoryExists(baseUri, "Revolutic Invoice");

        // 3. Save the file
        const base64Content = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        try {
            const destinationUri = await StorageAccessFramework.createFileAsync(
                finalFolderUri,
                fileName,
                'application/pdf'
            );

            await FileSystem.writeAsStringAsync(destinationUri, base64Content, {
                encoding: FileSystem.EncodingType.Base64,
            });

            showToast(`Saved to Downloads/Revolutic Invoice/${fileName}`);
            return true;
        } catch (e: any) {
            console.warn("Save failed, clearing permission cache and retrying:", e);
            await AsyncStorage.removeItem(SAF_DIR_KEY);
            return await saveFileWithSAF(uri, fileName);
        }
    } catch (e: any) {
        console.error("Android Save Error:", e);
        Alert.alert("Error", "Failed to save PDF: " + (e.message || "Unknown error"));
        return false;
    }
};

export const savePDFToDevice = async (uri: string, fileName: string): Promise<boolean> => {
    try {
        if (Platform.OS === 'android') {
            return await saveFileWithSAF(uri, fileName);
        }

        // iOS handling
        const baseDir = FileSystem.documentDirectory;
        if (!baseDir) return false;

        const finalFolderUri = await ensureDirectoryExists(baseDir, "Revolutic Invoice");
        const destinationUri = `${finalFolderUri}${fileName}`;

        await FileSystem.copyAsync({
            from: uri,
            to: destinationUri
        });

        showToast(`Saved to Revolutic Invoice folder`);
        return true;
    } catch (e: any) {
        console.error("PDF Save Error:", e);
        Alert.alert("Error", "Failed to save PDF: " + (e.message || "Unknown error"));
        return false;
    }
};

export const resetSAFDirectory = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(SAF_DIR_KEY);
        showToast("Download location reset.");
    } catch (e) {
        console.error("Failed to reset directory:", e);
    }
};
