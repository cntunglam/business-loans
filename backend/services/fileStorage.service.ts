import { BlobSASPermissions, StorageSharedKeyCredential, generateBlobSASQueryParameters } from '@azure/storage-blob';
import { storageClient } from '../clients/storageClient';
import { CONFIG } from '../config';

const RESOURCES_CONTAINER_NAME = 'resources';

const parseConnectionString = (connectionString: string) => {
  const elements = connectionString.split(';');
  const accountName = elements.find((element) => element.startsWith('AccountName='))?.split('=')[1];
  const accountKey = elements.find((element) => element.startsWith('AccountKey='))?.split('=')[1];

  if (!accountName || !accountKey) {
    throw new Error('Invalid connection string');
  }

  return { accountName, accountKey };
};

export const uploadToAzure = async (buffer: Buffer, filename: string, mimetype: string) => {
  if (!storageClient) return;
  const containerClient = storageClient.getContainerClient(`${CONFIG.AZURE_STORAGE_BUCKET_PREFIX}-documents`);
  const blockBlobClient = containerClient.getBlockBlobClient(filename);

  return await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: mimetype },
  });
};

export const uploadToAzureResource = async (buffer: Buffer, filename: string, mimetype: string) => {
  if (!storageClient) return;
  const containerClient = storageClient.getContainerClient(RESOURCES_CONTAINER_NAME);
  const blockBlobClient = containerClient.getBlockBlobClient(filename);

  return await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: mimetype },
  });
};

export const getBlobLink = async (filename: string) => {
  if (!storageClient) return '';
  const containerName = `${CONFIG.AZURE_STORAGE_BUCKET_PREFIX}-documents`;
  const containerClient = storageClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(filename);

  if (!(await blobClient.exists())) {
    throw new Error('File not found');
  }

  const sasOptions = {
    containerName: containerName,
    blobName: filename,
    expiresOn: new Date(new Date().valueOf() + 900 * 1000), // 15 minutes expiry
    permissions: BlobSASPermissions.parse('r'), // Read permission
  };

  const { accountName, accountKey } = parseConnectionString(CONFIG.AZURE_STORAGE_CONNECTION_STRING);
  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

  const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
  const sasUrl = `${blobClient.url}?${sasToken}`;
  return sasUrl;
};
