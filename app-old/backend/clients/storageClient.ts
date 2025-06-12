import { BlobServiceClient } from '@azure/storage-blob';
import { CONFIG } from '../config';

export const storageClient = !CONFIG.AZURE_STORAGE_CONNECTION_STRING
  ? undefined
  : BlobServiceClient.fromConnectionString(CONFIG.AZURE_STORAGE_CONNECTION_STRING);
