import * as VersionService from '@/apis/version.api';
import type { VersionPlatform } from '@/types/AppVersion';
import { useFetch } from './useFetch';

export function useGetVersionsByPlatform(platform: VersionPlatform) {
    return useFetch(
        ['app-versions', platform],
        () => VersionService.getVersionsByPlatform(platform),
    );
}
