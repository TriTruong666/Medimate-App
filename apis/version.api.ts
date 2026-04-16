import type { BaseResponse } from '@/types/APIResponse';
import type { AppVersion, VersionPlatform } from '@/types/AppVersion';
import { axiosClient } from './client';

export async function getVersionsByPlatform(
    platform: VersionPlatform,
): Promise<BaseResponse<AppVersion[]>> {
    const res = await axiosClient.get('/api/v1/versions', { params: { platform } });
    return res.data;
}
