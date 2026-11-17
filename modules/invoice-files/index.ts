import { requireNativeModule } from 'expo-modules-core';

interface InvoiceFilesNative {
  saveToDownloads(sourceUri: string, fileName: string, folder: string, mimeType: string): Promise<string>;
}

// Android only. Not registered on iOS, so callers must check the platform.
export default requireNativeModule<InvoiceFilesNative>('InvoiceFiles');
