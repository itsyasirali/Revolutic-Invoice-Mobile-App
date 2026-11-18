import { Platform, Alert, NativeModules } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { showToast } from './toast';

// Native Android module (android/app/src/main/java/com/invoicesmarty/InvoiceFilesModule.kt).
const InvoiceFiles: {
    saveToDownloads: (sourceUri: string, fileName: string, folder: string, mimeType: string) => Promise<string>;
} = NativeModules.InvoiceFiles;

// Folder created inside the phone's Download folder.
const FOLDER_NAME = 'InvoiceSmarty';

/**
 * Saves a file (PDF or CSV) automatically, with no prompt.
 * - Android: Download/InvoiceSmarty through MediaStore (no permission needed on
 *   Android 10+, a one-time storage permission on Android 9 and older).
 * - iOS: the app's documents folder.
 */
export const saveFileToDevice = async (uri: string, fileName: string, mimeType: string): Promise<boolean> => {
    try {
        if (Platform.OS === 'android') {
            await InvoiceFiles.saveToDownloads(uri, fileName, FOLDER_NAME, mimeType);
            showToast(`Saved to Download/${FOLDER_NAME}/${fileName}`);
            return true;
        }

        const base = FileSystem.documentDirectory;
        if (!base) return false;
        const folder = `${base}${FOLDER_NAME}/`;
        const info = await FileSystem.getInfoAsync(folder);
        if (!info.exists) await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
        await FileSystem.copyAsync({ from: uri, to: `${folder}${fileName}` });
        showToast(`Saved to ${FOLDER_NAME} folder`);
        return true;
    } catch (e: any) {
        console.error('File save error:', e);
        Alert.alert('Error', `Failed to save file: ${e?.message || 'Unknown error'}`);
        return false;
    }
};

export const savePDFToDevice = (uri: string, fileName: string) => saveFileToDevice(uri, fileName, 'application/pdf');
