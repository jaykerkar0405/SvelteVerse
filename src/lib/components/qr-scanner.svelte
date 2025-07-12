<script lang="ts">
	import {
		X,
		QrCode,
		Camera,
		CameraOff,
		ChevronDown,
		AlertCircle,
		CheckCircle2,
		Flashlight,
		FlashlightOff
	} from 'lucide-svelte';
	import { BarqodeStream, type DetectedBarcode } from 'barqode';
	import { fly } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';

	let {
		linkingWatch = false,
		onScan,
		onCancel
	}: {
		linkingWatch: boolean;
		onScan: (data: string) => void;
		onCancel: () => void;
	} = $props();

	let error = $state('');
	let detectedQRCode = $state('');
	let scanSuccess = $state(false);
	let scanningActive = $state(false);
	let permissionDenied = $state(false);
	let showCameraSelector = $state(false);
	let selectedCameraId = $state<string>('');
	let availableCameras = $state<MediaDeviceInfo[]>([]);
	let cameraLoading = $state(true);
	let torchEnabled = $state(false);
	let torchSupported = $state(false);
	let streamPaused = $state(false);

	// Camera constraints for Barqode
	let cameraConstraints = $state<MediaTrackConstraints>({
		facingMode: 'environment'
	});

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
				updateCameraConstraints();
			}
		} catch (err) {
			console.error('Error getting camera devices:', err);
		}
	};

	const updateCameraConstraints = () => {
		if (selectedCameraId) {
			cameraConstraints = { deviceId: selectedCameraId };
		} else {
			cameraConstraints = { facingMode: 'environment' };
		}
	};

	const switchCamera = async (cameraId: string) => {
		selectedCameraId = cameraId;
		showCameraSelector = false;
		updateCameraConstraints();
		cameraLoading = true;
	};

	const toggleTorch = () => {
		if (torchSupported) {
			torchEnabled = !torchEnabled;
		}
	};

	const validateAndroidId = (androidId: string): boolean => {
		const androidIdPattern = /^[a-fA-F0-9]{16}$/;
		return androidIdPattern.test(androidId);
	};

	const handleQRCodeDetected = (detectedCodes: DetectedBarcode[]) => {
		if (linkingWatch || scanSuccess) return;

		const validCodes = detectedCodes.filter((code) => validateAndroidId(code.rawValue));

		if (validCodes.length > 0) {
			const firstValidCode = validCodes[0];
			detectedQRCode = firstValidCode.rawValue;
			scanSuccess = true;
			scanningActive = false;
			streamPaused = true;

			setTimeout(() => {
				// Call onScan with the raw value directly, not as an event
				onScan(firstValidCode.rawValue);
			}, 500);
		}
	};

	const trackDetectedCodes = (detectedCodes: DetectedBarcode[], ctx: CanvasRenderingContext2D) => {
		for (const detectedCode of detectedCodes) {
			const [firstPoint, ...otherPoints] = detectedCode.cornerPoints;

			// Draw a stylish border around detected QR codes
			ctx.strokeStyle = scanSuccess ? '#10b981' : '#3b82f6';
			ctx.lineWidth = 3;
			ctx.shadowColor = scanSuccess ? '#10b981' : '#3b82f6';
			ctx.shadowBlur = 10;

			ctx.beginPath();
			ctx.moveTo(firstPoint.x, firstPoint.y);
			for (const { x, y } of otherPoints) {
				ctx.lineTo(x, y);
			}
			ctx.lineTo(firstPoint.x, firstPoint.y);
			ctx.closePath();
			ctx.stroke();

			// Reset shadow
			ctx.shadowBlur = 0;
		}
	};

	const onCameraReady = async (capabilities: MediaTrackCapabilities) => {
		cameraLoading = false;
		scanningActive = true;
		error = '';
		permissionDenied = false;
		torchSupported = 'torch' in capabilities;

		// Get available cameras after camera is ready
		await getCameraDevices();
	};

	const onCameraError = (err: Error) => {
		console.error('Camera error:', err);
		cameraLoading = false;
		scanningActive = false;

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
	};

	const onCameraOff = () => {
		cameraLoading = true;
		scanningActive = false;
	};

	const handleCancel = () => {
		// Clean up camera stream and reset states
		scanningActive = false;
		streamPaused = true;
		cameraLoading = false;
		error = '';
		scanSuccess = false;
		detectedQRCode = '';

		// Call the parent's cancel handler
		onCancel();
	};

	const getCameraLabel = (camera: MediaDeviceInfo): string => {
		if (camera.label) {
			return camera.label;
		}
		const index = availableCameras.findIndex((c) => c.deviceId === camera.deviceId);
		return `Camera ${index + 1}`;
	};

	const retryCamera = () => {
		error = '';
		permissionDenied = false;
		cameraLoading = true;
		// Force re-initialization by updating constraints
		updateCameraConstraints();
	};

	onMount(() => {
		getCameraDevices();
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

		{#if torchSupported && !error}
			<div class="flex justify-center">
				<Button variant="outline" size="sm" onclick={toggleTorch} class="flex items-center gap-2">
					{#if torchEnabled}
						<FlashlightOff class="size-4" />
						Turn off flash
					{:else}
						<Flashlight class="size-4" />
						Turn on flash
					{/if}
				</Button>
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
							<Button onclick={retryCamera} variant="default" size="sm" class="mt-2">
								<Camera class="mr-2 size-4" />
								Try Again
							</Button>
						{/if}
					</div>
				{:else}
					<div class="relative h-full">
						<BarqodeStream
							constraints={cameraConstraints}
							formats={['qr_code']}
							paused={streamPaused}
							torch={torchEnabled}
							onCameraOn={onCameraReady}
							{onCameraOff}
							onError={onCameraError}
							onDetect={handleQRCodeDetected}
							track={trackDetectedCodes}
						>
							{#if cameraLoading}
								<div class="absolute inset-0 flex items-center justify-center bg-muted">
									<div class="text-center">
										<div class="mb-4 flex justify-center">
											<div
												class="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
											></div>
										</div>
										<p class="text-sm text-muted-foreground">Loading camera...</p>
									</div>
								</div>
							{/if}
						</BarqodeStream>

						<!-- Modern scanning overlay -->
						<div class="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
							<div class="relative">
								<!-- Main scanning frame -->
								<div class="relative size-48 md:size-56 lg:size-64">
									<!-- Animated corner indicators -->
									<div
										class="absolute -left-1 -top-1 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-white shadow-lg"
									></div>
									<div
										class="absolute -right-1 -top-1 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-white shadow-lg"
									></div>
									<div
										class="absolute -bottom-1 -left-1 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-white shadow-lg"
									></div>
									<div
										class="absolute -bottom-1 -right-1 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-white shadow-lg"
									></div>

									<!-- Central scanning area -->
									<div
										class="absolute inset-4 rounded-lg border-2 border-dashed border-white/50"
									></div>

									{#if scanSuccess}
										<div
											class="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-green-400 bg-green-500/20 backdrop-blur-sm"
										>
											<CheckCircle2 class="size-16 text-green-400 drop-shadow-lg" />
										</div>
									{/if}
								</div>
							</div>
						</div>

						<!-- Compact status indicator -->
						{#if !error}
							<div class="absolute left-1/2 top-4 z-10 -translate-x-1/2 transform">
								{#if scanSuccess}
									<div
										class="flex items-center gap-2 rounded-full bg-green-500/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-sm"
									>
										<CheckCircle2 class="size-3" />
										<span>Detected</span>
									</div>
								{:else if linkingWatch}
									<div
										class="flex items-center gap-2 rounded-full bg-blue-500/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-sm"
									>
										<div
											class="size-3 animate-spin rounded-full border-2 border-white/30 border-t-white"
										></div>
										<span>Linking...</span>
									</div>
								{:else if scanningActive}
									<div
										class="flex items-center gap-2 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-sm"
									>
										<div class="size-2 animate-pulse rounded-full bg-white"></div>
										<span>Scanning</span>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="flex gap-3 px-4 sm:px-0">
		<Button onclick={handleCancel} variant="outline" class="flex-1" disabled={linkingWatch}>
			<X class="mr-2 size-4" />
			Cancel
		</Button>
	</div>

	<div class="mx-4 rounded-xl border border-border bg-card shadow-sm sm:mx-0 md:mx-4 lg:mx-0">
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
