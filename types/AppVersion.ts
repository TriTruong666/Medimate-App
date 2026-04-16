export interface AppVersion {
    versionId: string;
    versionNumber: string;
    platform: string; // "IOS" | "Android"
    releaseNotes: string | null;
    downloadUrl: string | null;
    isForceUpdate: boolean;
    releaseDate: string;
    status: string; // "Active" | ...
    createdAt: string;
    updatedAt: string | null;
}

export type VersionPlatform = 'IOS' | 'Android';
