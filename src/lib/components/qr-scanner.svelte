<script lang="ts">
	import {
		X,
		QrCode,
		Camera,
		CameraOff,
		ChevronDown,
		AlertCircle,
		CheckCircle2
	} from 'lucide-svelte';
	import jsQR from 'jsqr';
	import { fly } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button';
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	let { linkingWatch = false }: { linkingWatch: boolean } = $props();

	let error = $state('');
	let detectedQRCode = $state('');
	let scanSuccess = $state(false);
	let scanningActive = $state(false);
	let permissionDenied = $state(false);
	let showCameraSelector = $state(false);
	let selectedCameraId = $state<string>('');
	let scanInterval: ReturnType<typeof setInterval>;
	let availableCameras = $state<MediaDeviceInfo[]>([]);

	let stream = $state<MediaStream | null>(null);
	let videoElement = $state<HTMLVideoElement | undefined>(undefined);
	let canvasElement = $state<HTMLCanvasElement | undefined>(undefined);

	const getCameraDevices = async () => {
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			availableCameras = devices.filter((device) => device.kind === 'videoinput');

			if (availableCameras.length > 0 && !selectedCameraId) {
				const backCamera = availableCameras.find(
					(camera) =>
						camera.label.toLowerCase().includes('back') ||
						camera.label.toLowerCase().includes('environment')
				);
				selectedCameraId = backCamera?.deviceId || availableCameras[0].deviceId;
			}
		} catch (err) {
			console.error('Error getting camera devices:', err);
		}
	};

	const startCamera = async () => {
		try {
			error = '';
			permissionDenied = false;

			await getCameraDevices();

			let constraints: MediaStreamConstraints = {
				video: selectedCameraId
					? { deviceId: selectedCameraId }
					: { facingMode: { ideal: 'environment' } }
			};

			try {
				stream = await navigator.mediaDevices.getUserMedia(constraints);
			} catch (basicError) {
				console.warn('Selected camera failed, retrying with environment facing mode:', basicError);
				constraints = {
					video: {
						facingMode: { ideal: 'environment' }
					}
				};
				stream = await navigator.mediaDevices.getUserMedia(constraints);
			}

			if (videoElement && stream) {
				videoElement.srcObject = stream;

				const handleVideoReady = async () => {
					try {
						if (videoElement) {
							await videoElement.play();
							startScanning();
						}
					} catch (playError) {
						error = 'Failed to play camera stream. Please try again.';
					}
				};

				videoElement.oncanplay = handleVideoReady;
				videoElement.onloadedmetadata = handleVideoReady;

				videoElement.onerror = () => {
					error = 'Failed to load video stream.';
				};
			}
		} catch (err: unknown) {
			console.error('Error accessing camera:', err);

			if (err instanceof DOMException) {
				if (err.name === 'NotAllowedError') {
					permissionDenied = true;
					error = 'Camera access denied. Please enable camera permissions and refresh the page.';
				} else if (err.name === 'NotFoundError') {
					error = 'No camera found on this device.';
				} else if (err.name === 'NotSupportedError') {
					error = 'Camera not supported on this device.';
				} else if (err.name === 'OverconstrainedError') {
					error = 'Camera constraints not supported. Please try with a different device.';
				} else {
					error = 'Failed to access camera. Please try again.';
				}
			} else {
				error = 'An unknown error occurred while accessing the camera.';
			}
		}
	};

	const stopCamera = () => {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
		stopScanning();
	};

	const switchCamera = async (cameraId: string) => {
		selectedCameraId = cameraId;
		showCameraSelector = false;
		stopCamera();
		await startCamera();
	};

	const startScanning = () => {
		if (scanningActive) return;

		scanningActive = true;
		scanInterval = setInterval(() => {
			if (videoElement && canvasElement && !linkingWatch && !scanSuccess) {
				captureAndAnalyze();
			}
		}, 100);
	};

	const stopScanning = () => {
		if (scanInterval) {
			clearInterval(scanInterval);
		}
		scanningActive = false;
	};

	const captureAndAnalyze = () => {
		if (!videoElement || !canvasElement) return;

		const canvas = canvasElement;
		const context = canvas.getContext('2d');

		if (!context) return;

		canvas.width = videoElement.videoWidth;
		canvas.height = videoElement.videoHeight;

		context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

		const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		const qrCodeData = detectQRCode(imageData);

		if (qrCodeData) {
			handleQRCodeDetected(qrCodeData);
		}
	};

	const detectQRCode = (imageData: ImageData): string | null => {
		const code = jsQR(imageData.data, imageData.width, imageData.height, {
			inversionAttempts: 'dontInvert'
		});

		return code ? code.data : null;
	};

	const validateAndroidId = (androidId: string): boolean => {
		const androidIdPattern = /^[a-fA-F0-9]{16}$/;
		return androidIdPattern.test(androidId);
	};

	const handleQRCodeDetected = (data: string) => {
		if (validateAndroidId(data)) {
			detectedQRCode = data;
			scanSuccess = true;
			stopScanning();

			setTimeout(() => {
				dispatch('scan', data);
			}, 500);
		}
	};

	const handleCancel = () => {
		stopCamera();
		dispatch('cancel');
	};

	const getCameraLabel = (camera: MediaDeviceInfo): string => {
		if (camera.label) {
			return camera.label;
		}
		const index = availableCameras.findIndex((c) => c.deviceId === camera.deviceId);
		return `Camera ${index + 1}`;
	};

	onMount(() => {
		startCamera();
	});

	onDestroy(() => {
		stopCamera();
	});
</script>

<div class="space-y-4 sm:space-y-6" in:fly={{ y: 20, duration: 400 }}>
	<div class="text-center">
		<div class="mb-4 flex justify-center">
			<div class="rounded-full bg-primary/10 p-3 ring-1 ring-primary/20">
				{#if scanSuccess}
					<CheckCircle2 class="size-6 text-accent-foreground" />
				{:else}
					<QrCode class="size-6 text-primary" />
				{/if}
			</div>
		</div>

		<h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
			{scanSuccess ? 'QR Code Detected!' : 'Scan QR Code'}
		</h1>

		<p class="mt-2 px-4 text-sm text-muted-foreground">
			{scanSuccess
				? 'Successfully detected your watch QR code'
				: 'Point your camera at the QR code displayed on your watch'}
		</p>
	</div>

	<div class="space-y-4">
		{#if availableCameras.length > 1 && !error}
			<div class="relative">
				<Button
					variant="outline"
					class="w-full justify-between"
					onclick={() => (showCameraSelector = !showCameraSelector)}
				>
					<div class="flex items-center gap-2">
						<Camera class="size-4" />
						<span class="text-sm">
							{getCameraLabel(
								availableCameras.find((c) => c.deviceId === selectedCameraId) || availableCameras[0]
							)}
						</span>
					</div>
					<ChevronDown class="size-4" />
				</Button>

				{#if showCameraSelector}
					<div
						class="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border border-border bg-card shadow-lg"
					>
						{#each availableCameras as camera}
							<button
								onclick={() => switchCamera(camera.deviceId)}
								class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-muted"
							>
								<Camera class="size-4" />
								<span class="text-sm">{getCameraLabel(camera)}</span>
								{#if camera.deviceId === selectedCameraId}
									<CheckCircle2 class="ml-auto size-4 text-primary" />
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<div class="relative">
			<div
				class="aspect-square overflow-hidden rounded-xl border-2 border-border bg-muted shadow-lg"
			>
				{#if error}
					<div class="flex h-full flex-col items-center justify-center p-4 text-center sm:p-6">
						<div class="mb-4 rounded-full bg-destructive p-3">
							{#if permissionDenied}
								<CameraOff class="size-6 text-white sm:size-8" />
							{:else}
								<AlertCircle class="size-6 text-white sm:size-8" />
							{/if}
						</div>

						<h3 class="mb-2 text-base font-semibold text-foreground sm:text-lg">
							{permissionDenied ? 'Camera Access Denied' : 'Camera Error'}
						</h3>

						<p class="mb-4 px-2 text-sm text-destructive/80">{error}</p>

						{#if permissionDenied}
							<div class="max-w-sm rounded-lg p-3 text-left sm:p-4">
								<p class="mb-2 text-xs text-muted-foreground">To enable camera access:</p>
								<div class="space-y-1 text-xs text-muted-foreground">
									<p>1. Click the camera icon in your browser's address bar</p>
									<p>2. Select "Allow" for camera permissions</p>
									<p>3. Refresh this page</p>
								</div>
							</div>
						{:else}
							<Button onclick={startCamera} variant="default" size="sm" class="mt-2">
								<Camera class="mr-2 size-4" />
								Try Again
							</Button>
						{/if}
					</div>
				{:else}
					<div class="relative h-full">
						<video
							muted
							autoplay
							playsinline
							bind:this={videoElement}
							class="h-full w-full object-cover"
						></video>

						<div class="absolute inset-0 flex items-center justify-center p-4">
							<div class="relative">
								<div
									class="size-40 rounded-xl border-4 border-primary bg-transparent shadow-2xl sm:size-48 md:size-56 lg:size-64"
								>
									{#if scanSuccess}
										<div
											class="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-accent bg-accent/30 backdrop-blur-sm"
										>
											<CheckCircle2 class="size-12 text-accent-foreground sm:size-16" />
										</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>

			{#if !error}
				<div class="absolute bottom-4 left-2 right-2 sm:bottom-auto sm:left-4 sm:right-4 sm:top-4">
					{#if scanSuccess}
						<div
							class="flex items-center justify-center gap-2 rounded-full border border-accent-foreground/20 bg-accent px-3 py-2 text-xs text-accent-foreground shadow-lg sm:px-4 sm:text-sm"
						>
							<CheckCircle2 class="size-3 sm:size-4" />
							<span class="truncate">QR Code: {detectedQRCode.slice(0, 12)}...</span>
						</div>
					{:else if linkingWatch}
						<div
							class="flex items-center justify-center gap-2 rounded-full border border-secondary-foreground/20 bg-secondary px-3 py-2 text-xs text-secondary-foreground shadow-lg sm:px-4 sm:text-sm"
						>
							<div
								class="size-3 animate-spin rounded-full border-2 border-secondary-foreground/30 border-t-secondary-foreground sm:size-4"
							></div>
							Linking watch...
						</div>
					{:else if scanningActive}
						<div
							class="flex items-center justify-center gap-2 rounded-full border border-primary-foreground/20 bg-primary px-3 py-2 text-xs text-primary-foreground shadow-lg sm:px-4 sm:text-sm"
						>
							<div class="size-2 animate-pulse rounded-full bg-primary-foreground"></div>
							Scanning...
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<canvas bind:this={canvasElement} class="hidden"></canvas>
	</div>

	<div class="flex gap-3 px-4 sm:px-0">
		<Button onclick={handleCancel} variant="outline" class="flex-1" disabled={linkingWatch}>
			<X class="mr-2 size-4" />
			Cancel
		</Button>
	</div>

	<div class="mx-4 rounded-xl border border-border bg-card shadow-sm sm:mx-0">
		<div class="border-b border-border bg-muted/50 px-4 py-3 sm:px-6 sm:py-4">
			<h3 class="flex items-center gap-2 text-sm font-semibold text-foreground">
				<QrCode class="size-4" />
				Setup Instructions
			</h3>
		</div>
		<div class="p-4 sm:p-6">
			<div class="space-y-3 sm:space-y-4">
				<div class="flex items-start gap-3">
					<div
						class="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
					>
						1
					</div>
					<div class="min-w-0">
						<p class="text-sm font-medium text-foreground">Open VitalSync App</p>
						<p class="text-xs text-muted-foreground">Launch the VitalSync app on your smartwatch</p>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<div
						class="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
					>
						2
					</div>
					<div class="min-w-0">
						<p class="text-sm font-medium text-foreground">Navigate to QR Code</p>
						<p class="text-xs text-muted-foreground">
							The QR code will appear on your watch screen automatically
						</p>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<div
						class="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
					>
						3
					</div>
					<div class="min-w-0">
						<p class="text-sm font-medium text-foreground">Scan with Camera</p>
						<p class="text-xs text-muted-foreground">
							Point your phone's camera at the QR code to establish connection
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
