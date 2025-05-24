import pkg from 'agora-token';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_AGORA_APP_ID, PUBLIC_AGORA_APP_CERTIFICATE } from '$env/static/public';

const { RtcTokenBuilder } = pkg;

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { uid, channelName } = await request.json();

        if (!uid || !channelName) {
            return json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const appID = PUBLIC_AGORA_APP_ID;
        const appCertificate = PUBLIC_AGORA_APP_CERTIFICATE;

        if (!appID || !appCertificate) {
            return json({ error: 'Agora credentials not configured' }, { status: 500 });
        }

        // Set token expiry time to 24 hours
        const expirationTimeInSeconds = 24 * 3600;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        // Build token with uid
        const token = RtcTokenBuilder.buildTokenWithUid(
            appID,
            appCertificate,
            channelName,
            uid,
            1,
            privilegeExpiredTs,
            1
        );

        return json({ token });
    } catch (error) {
        console.error('Error generating token:', error);
        return json({ error: 'Failed to generate token' }, { status: 500 });
    }
}; 