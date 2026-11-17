import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from './toast';

const { StorageAccessFramework } = FileSystem;

// Folder created inside the phone's Download folder.
const FOLDER_NAME = 'InvoiceSmarty';
// The Download folder the user granted once; reused for every later save.
const SAF_DIR_KEY = 'saf_download_dir_uri_v8';

/** Returns the folder's URI inside `parentUri`, creating it when missing. */
const ensureFolder = async (parentUri: string): Promise<string> => {
    const wanted = FOLDER_NAME.toLowerCase();
    const children = await StorageAccessFramework.readDirectoryAsync(parentUri);
    const existing = children.find((child) => {
        const last = decodeURIComponent(child).split(/[/:]/).pop() || '';
        return last.toLowerCase() === wanted;
    });
    return existing ?? (await StorageAccessFramework.makeDirectoryAsync(parentUri, FOLDER_NAME));
};

/** Asks once for access to the Download folder and remembers it. */
const grantDownloadFolder = async (): Promise<string | null> => {
    await new Promise<void>((resolve) => {
        Alert.alert(
            'Automatic Saving',
            `Choose the "Download" folder on the next screen and tap "Use this folder". Your PDFs will then save automatically to Download/${FOLDER_NAME}.\n\nYou only need to do this once.`,
            [{ text: 'Continue', onPress: () => resolve() }]
        );
    });

    const initial = StorageAccessFramework.getUriForDirectoryInRoot('Download');
    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync(initial);
    if (!permissions.granted) {
        Alert.alert('Permission Required', `Allow access to the Download folder so PDFs can save automatically to ${FOLDER_NAME}.`);
        return null;
    }
    await AsyncStorage.setItem(SAF_DIR_KEY, permissions.directoryUri);
    return permissions.directoryUri;
};

const writeToAndroid = async (sourceUri: string, fileName: string, downloadUri: string): Promise<void> => {
    const folderUri = await ensureFolder(downloadUri);
    const content = await FileSystem.readAsStringAsync(sourceUri, { encoding: FileSystem.EncodingType.Base64 });
    const destination = await StorageAccessFramework.createFileAsync(folderUri, fileName, 'application/pdf');
    await FileSystem.writeAsStringAsync(destination, content, { encoding: FileSystem.EncodingType.Base64 });
};

/**
 * Android: saves into Download/InvoiceSmarty with no prompt after the first
 * time. If the stored permission is gone (storage cleared, folder deleted) it
 * asks again, once, and retries a single time.
 */
const saveOnAndroid = async (sourceUri: string, fileName: string): Promise<boolean> => {
    let downloadUri = await AsyncStorage.getItem(SAF_DIR_KEY);
    let askedThisTime = false;

    if (!downloadUri) {
        downloadUri = await grantDownloadFolder();
        if (!downloadUri) return false;
        askedThisTime = true;
    }

    try {
        await writeToAndroid(sourceUri, fileName, downloadUri);
    } catch {
        // Stored access is stale. Re-ask only if we have not just done so.
        await AsyncStorage.removeItem(SAF_DIR_KEY);
        if (askedThisTime) throw new Error('Could not write to the selected folder.');
        const fresh = await grantDownloadFolder();
        if (!fresh) return false;
        await writeToAndroid(sourceUri, fileName, fresh);
    }

    showToast(`Saved to Download/${FOLDER_NAME}/${fileName}`);
    return true;
};

/** iOS: copies into the app's documents folder. */
const saveOnIos = async (sourceUri: string, fileName: string): Promise<boolean> => {
    const base = FileSystem.documentDirectory;
    if (!base) return false;
    const folder = `${base}${FOLDER_NAME}/`;
    const info = await FileSystem.getInfoAsync(folder);
    if (!info.exists) await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
    await FileSystem.copyAsync({ from: sourceUri, to: `${folder}${fileName}` });
    showToast(`Saved to ${FOLDER_NAME} folder`);
    return true;
};

export const savePDFToDevice = async (uri: string, fileName: string): Promise<boolean> => {
    try {
        return Platform.OS === 'android' ? await saveOnAndroid(uri, fileName) : await saveOnIos(uri, fileName);
    } catch (e: any) {
        console.error('PDF save error:', e);
        Alert.alert('Error', `Failed to save PDF: ${e?.message || 'Unknown error'}`);
        return false;
    }
};
