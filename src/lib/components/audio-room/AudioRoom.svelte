<!-- <script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import AgoraRTC, { type ILocalAudioTrack } from 'agora-rtc-sdk-ng';
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Mic, MicOff, Volume2, VolumeX, Users } from 'lucide-svelte';
  import type { AudioRoomProps, AudioRoomState, AudioTestState, RemoteUser } from '$lib/types/audio-room';

  export let channelName: string;
  export let uid: number;
  export let token: string;
  export let username: string;

  let state: AudioRoomState = {
    isJoined: false,
    isMuted: false,
    isTesting: false,
    users: [],
    localUser: null
  };

  let testState: AudioTestState = {
    isTesting: false,
    volume: 0,
    audioTrack: null
  };

  let client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  let localAudioTrack: ILocalAudioTrack | null = null;

  const startAudioTest = async () => {
    try {
      testState.isTesting = true;
      testState.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      testState.audioTrack.play();
      
      testState.audioTrack.setEnabled(true);
      const volumeInterval = setInterval(() => {
        if (testState.audioTrack) {
          testState.volume = testState.audioTrack.getVolumeLevel();
        }
      }, 100);

      return () => clearInterval(volumeInterval);
    } catch (error) {
      console.error('Error starting audio test:', error);
      testState.isTesting = false;
    }
  };

  const stopAudioTest = async () => {
    if (testState.audioTrack) {
      testState.audioTrack.stop();
      testState.audioTrack.close();
      testState.audioTrack = null;
    }
    testState.isTesting = false;
    testState.volume = 0;
  };

  const joinChannel = async () => {
    try {
      localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await client.join(import.meta.env.VITE_AGORA_APP_ID, channelName, token, uid);
      await client.publish(localAudioTrack);

      state.localUser = {
        uid,
        username,
        isMuted: false,
        isSpeaking: false
      };

      state.isJoined = true;
      localAudioTrack.play();
    } catch (error) {
      console.error('Error joining channel:', error);
    }
  };

  const leaveChannel = async () => {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    await client.leave();
    state.isJoined = false;
    state.users = [];
    state.localUser = null;
  };

  const toggleMute = () => {
    if (localAudioTrack) {
      state.isMuted = !state.isMuted;
      localAudioTrack.setEnabled(!state.isMuted);
    }
  };

  client.on('user-published', async (user: RemoteUser, mediaType: 'audio' | 'video') => {
    if (mediaType === 'audio') {
      await client.subscribe(user, 'audio');
      user.audioTrack?.play();
      state.users = [...state.users, {
        uid: Number(user.uid),
        username: `User ${user.uid}`,
        isMuted: false,
        isSpeaking: false
      }];
    }
  });

  client.on('user-left', (user: RemoteUser) => {
    state.users = state.users.filter(u => u.uid !== Number(user.uid));
  });

  onDestroy(() => {
    leaveChannel();
    stopAudioTest();
  });
</script>

<div class="container mx-auto p-4 max-w-4xl">
  {#if !state.isJoined}
    <div transition:fade>
      <Card class="p-6">
        <h2 class="text-2xl font-bold mb-4">Join Audio Room</h2>
        <div class="space-y-4">
          {#if !testState.isTesting}
            <Button on:click={startAudioTest} class="w-full">
              <Mic class="mr-2 h-4 w-4" />
              Test Microphone
            </Button>
          {:else}
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span>Microphone Test</span>
                <Button variant="destructive" on:click={stopAudioTest}>
                  <MicOff class="h-4 w-4" />
                </Button>
              </div>
              <div class="h-2 bg-gray-200 rounded-full">
                <div
                  class="h-full bg-primary rounded-full transition-all duration-100"
                  style="width: {testState.volume * 100}%"
                />
              </div>
            </div>
          {/if}

          <Button
            on:click={joinChannel}
            class="w-full"
            disabled={testState.isTesting}
          >
            Join Room
          </Button>
        </div>
      </Card>
    </div>
  {:else}
    <div class="space-y-4" transition:fly={{ y: 20, duration: 300 }}>
      <div transition:fade>
        <Card class="p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <Users class="h-5 w-5" />
              <span class="font-medium">{state.users.length + 1} Participants</span>
            </div>
            <Button variant="destructive" on:click={leaveChannel}>
              Leave Room
            </Button>
          </div>
        </Card>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#if state.localUser}
          <div transition:fade>
            <Card class="p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  {#if state.isMuted}
                    <MicOff class="h-5 w-5 text-destructive" />
                  {:else}
                    <Mic class="h-5 w-5 text-primary" />
                  {/if}
                  <span>{state.localUser.username} (You)</span>
                </div>
                <Button
                  variant={state.isMuted ? "destructive" : "default"}
                  size="icon"
                  on:click={toggleMute}
                >
                  {#if state.isMuted}
                    <MicOff class="h-4 w-4" />
                  {:else}
                    <Mic class="h-4 w-4" />
                  {/if}
                </Button>
              </div>
            </Card>
          </div>
        {/if}

        {#each state.users as user (user.uid)}
          <div transition:fade>
            <Card class="p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  {#if user.isMuted}
                    <MicOff class="h-5 w-5 text-destructive" />
                  {:else}
                    <Mic class="h-5 w-5 text-primary" />
                  {/if}
                  <span>{user.username}</span>
                </div>
              </div>
            </Card>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .container {
    min-height: calc(100vh - 4rem);
  }
</style>  -->