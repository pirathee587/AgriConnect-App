import client from './client';
import { FileData } from './auth.api';

export interface NicUploadResponse {
  message: string;
  nicFrontUrl: string;
  nicBackUrl: string;
}

export const uploadApi = {
  uploadNic: async (nicFront: FileData, nicBack: FileData): Promise<NicUploadResponse> => {
    const formData = new FormData();
    formData.append('nicFront', nicFront as any);
    formData.append('nicBack', nicBack as any);

    const res = await client.post('/agency/profile/upload-nic', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
