<script lang="ts">
	import jsQR from 'jsqr';
	import { fly } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button';
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { X, QrCode, AlertCircle, Camera, CameraOff, CheckCircle2 } from 'lucide-svelte';

	const dispatch = createEventDispatcher();
	let { linkingWatch = false }: { linkingWatch: boolean } = $props();

	let error = $state('');
	let detectedQRCode = $state('');
	let scanSuccess = $state(false);
	let scanningActive = $state(false);
	let permissionDenied = $state(false);
	let scanInterval: ReturnType<typeof setInterval>;

	let stream = $state<MediaStream | null>(null);
	let videoElement = $state<HTMLVideoElement | undefined>(undefined);
	let canvasElement = $state<HTMLCanvasElement | undefined>(undefined);

	const startCamera = async () => {
		try {
			error = '';
			permissionDenied = false;

			let constraints: MediaStreamConstraints = {
				video: true
			};

			try {
				stream = await navigator.mediaDevices.getUserMedia(constraints);
			} catch (basicError) {
				console.warn(
					'Basic constraints failed, retrying with environment facing mode:',
					basicError
				);

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

	onMount(() => {
		startCamera();
	});

	onDestroy(() => {
		stopCamera();
	});
</script>

<div class="space-y-6" in:fly={{ y: 20, duration: 400 }}>
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

		<h1 class="text-3xl font-bold tracking-tight text-foreground">
			{scanSuccess ? 'QR Code Detected!' : 'Scan QR Code'}
		</h1>

		<p class="mt-2 text-sm text-muted-foreground">
			{scanSuccess
				? 'Successfully detected your watch QR code'
				: 'Point your camera at the QR code displayed on your watch'}
		</p>
	</div>

	<div class="space-y-4">
		<div
			class="relative aspect-square overflow-hidden rounded-xl border-2 border-border bg-muted shadow-lg"
		>
			{#if error}
				<div class="flex h-full flex-col items-center justify-center p-6 text-center">
					<div class="mb-4 rounded-full bg-destructive p-3">
						{#if permissionDenied}
							<CameraOff class="size-8 text-white" />
						{:else}
							<AlertCircle class="size-8 text-white" />
						{/if}
					</div>

					<h3 class="mb-2 text-lg font-semibold text-foreground">
						{permissionDenied ? 'Camera Access Denied' : 'Camera Error'}
					</h3>

					<p class="mb-4 text-sm text-destructive/80">{error}</p>

					{#if permissionDenied}
						<div class="rounded-lg p-4 text-left">
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

					<div class="absolute inset-0 flex items-center justify-center">
						<div class="relative">
							<div class="size-48 rounded-xl border-4 border-primary bg-transparent shadow-2xl">
								{#if scanSuccess}
									<div
										class="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-accent bg-accent/30 backdrop-blur-sm"
									>
										<CheckCircle2 class="size-16 text-accent-foreground" />
									</div>
								{/if}
							</div>
						</div>
					</div>

					<div class="absolute left-4 right-4 top-4">
						{#if scanSuccess}
							<div
								class="flex items-center justify-center gap-2 rounded-full border border-accent-foreground/20 bg-accent px-4 py-2 text-sm text-accent-foreground shadow-lg"
							>
								<CheckCircle2 class="size-4" />
								QR Code Detected: {detectedQRCode.slice(0, 8)}...
							</div>
						{:else if linkingWatch}
							<div
								class="flex items-center justify-center gap-2 rounded-full border border-secondary-foreground/20 bg-secondary px-4 py-2 text-sm text-secondary-foreground shadow-lg"
							>
								<div
									class="size-4 animate-spin rounded-full border-2 border-secondary-foreground/30 border-t-secondary-foreground"
								></div>
								Linking watch...
							</div>
						{:else if scanningActive}
							<div
								class="flex items-center justify-center gap-2 rounded-full border border-primary-foreground/20 bg-primary px-4 py-2 text-sm text-primary-foreground shadow-lg"
							>
								<div class="size-2 animate-pulse rounded-full bg-primary-foreground"></div>
								Scanning for QR code...
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<canvas bind:this={canvasElement} class="hidden"></canvas>
	</div>

	<div class="flex gap-3">
		<Button onclick={handleCancel} variant="outline" class="flex-1" disabled={linkingWatch}>
			<X class="mr-2 size-4" />
			Cancel
		</Button>
	</div>

	<div class="rounded-xl border border-border bg-card shadow-sm">
		<div class="border-b border-border bg-muted/50 px-6 py-4">
			<h3 class="flex items-center gap-2 text-sm font-semibold text-foreground">
				<QrCode class="size-4" />
				Setup Instructions
			</h3>
		</div>
		<div class="p-6">
			<div class="space-y-4">
				<div class="flex items-start gap-3">
					<div
						class="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
					>
						1
					</div>
					<div>
						<p class="text-sm font-medium text-foreground">Open VitalSync App</p>
						<p class="text-xs text-muted-foreground">Launch the VitalSync app on your smartwatch</p>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<div
						class="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
					>
						2
					</div>
					<div>
						<p class="text-sm font-medium text-foreground">Navigate to QR Code</p>
						<p class="text-xs text-muted-foreground">
							The QR code will appear on your watch screen automatically
						</p>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<div
						class="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
					>
						3
					</div>
					<div>
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
