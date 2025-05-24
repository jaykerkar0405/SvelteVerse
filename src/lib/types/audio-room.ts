import type { ILocalAudioTrack, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';

export interface AudioRoomUser {
    uid: number;
    username: string;
    isMuted: boolean;
    isSpeaking: boolean;
}

export interface AudioRoomState {
    isMuted: boolean;
    isJoined: boolean;
    isTesting: boolean;
    users: AudioRoomUser[];
    localUser: AudioRoomUser | null;
}

export interface AudioRoomProps {
    uid: number;
    token: string;
    channelName: string;
}

export interface AudioTestState {
    volume: number;
    isTesting: boolean;
    audioTrack: ILocalAudioTrack | null;
}

export interface RemoteUser extends IAgoraRTCRemoteUser {
    username?: string;
    isMuted?: boolean;
    isSpeaking?: boolean;
} 