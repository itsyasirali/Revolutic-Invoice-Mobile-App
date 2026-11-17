import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import InvoiceFiles from '../modules/invoice-files';
import { showToast } from './toast';

// Folder created inside the phone's Download folder.
const FOLDER_NAME = 'InvoiceSmarty';

/**
 * Saves a PDF automatically, with no prompt.
 * - Android: Download/InvoiceSmarty through MediaStore (no permission needed on
 *   Android 10+, a one-time storage permission on Android 9 and older).
 * - iOS: the app's documents folder.
 */
export const savePDFToDevice = async (uri: string, fileName: string): Promise<boolean> => {
    try {
        if (Platform.OS === 'android') {
            await InvoiceFiles.saveToDownloads(uri, fileName, FOLDER_NAME, 'application/pdf');
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
        console.error('PDF save error:', e);
        Alert.alert('Error', `Failed to save PDF: ${e?.message || 'Unknown error'}`);
        return false;
    }
};
