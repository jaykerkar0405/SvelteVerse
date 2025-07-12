<script lang="ts">
	import {
		X,
		Zap,
		QrCode,
		Camera,
		CameraOff,
		Flashlight,
		ChevronDown,
		AlertCircle,
		CheckCircle2,
		FlashlightOff
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button';
	import { BarqodeStream, type DetectedBarcode } from 'barqode';

	let {
		onScan,
		onCancel,
		linkingWatch = false
	}: {
		onCancel: () => void;
		linkingWatch: boolean;
		onScan: (data: string) => void;
	} = $props();

	let error = $state('');
	let detectedQRCode = $state('');
	let scanSuccess = $state(false);
	let cameraLoading = $state(true);
	let torchEnabled = $state(false);
	let streamPaused = $state(false);
	let torchSupported = $state(false);
	let scanningActive = $state(false);
	let isAutoFocusing = $state(false);
	let permissionDenied = $state(false);
	let focusBoostActive = $state(false);
	let cameraInitialized = $state(false);
	let showCameraSelector = $state(false);
	let selectedCameraId = $state<string>('');
	let availableCameras = $state<MediaDeviceInfo[]>([]);

	let cameraConstraints = $state<MediaTrackConstraints>({
		facingMode: 'environment',
		width: { ideal: 1280, min: 640 },
		height: { ideal: 720, min: 480 }
	});

	const getCameraDevices = async () => {
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			availableCameras = devices.filter((device) => device.kind === 'videoinput');

			if (availableCameras.length > 0 && !selectedCameraId) {
				const backCamera = availableCameras.find(
					(camera) =>
						camera.label.toLowerCase().includes('back') ||
						camera.label.toLowerCase().includes('environment') ||
						camera.label.toLowerCase().includes('rear')
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
			cameraConstraints = {
				deviceId: selectedCameraId,
				width: { ideal: 1280, min: 640 },
				height: { ideal: 720, min: 480 }
			};
		} else {
			cameraConstraints = {
				facingMode: 'environment',
				width: { ideal: 1280, min: 640 },
				height: { ideal: 720, min: 480 }
			};
		}

		cameraInitialized = false;
	};

	const switchCamera = async (cameraId: string) => {
		selectedCameraId = cameraId;
		showCameraSelector = false;
		updateCameraConstraints();
		cameraLoading = true;
		streamPaused = true;

		setTimeout(() => {
			streamPaused = false;
		}, 100);
	};

	const toggleTorch = () => {
		if (torchSupported) {
			torchEnabled = !torchEnabled;
		}
	};

	const performAutoFocus = async () => {
		if (!cameraInitialized || scanSuccess || linkingWatch || isAutoFocusing) return;

		isAutoFocusing = true;
		focusBoostActive = true;

		try {
			streamPaused = true;
			await new Promise((resolve) => setTimeout(resolve, 50));
			streamPaused = false;

			setTimeout(() => {
				focusBoostActive = false;
				isAutoFocusing = false;
			}, 800);
		} catch (err) {
			isAutoFocusing = false;
			focusBoostActive = false;
		}
	};

	const validateAndroidId = (androidId: string): boolean => {
		const androidIdPattern = /^[a-fA-F0-9]{16}$/;
		return androidIdPattern.test(androidId);
	};

	const handleQRCodeDetected = (detectedCodes: DetectedBarcode[]) => {
		if (linkingWatch || scanSuccess) return;

		const validCodes = detectedCodes.filter((code) => {
			const value = code.rawValue.trim();
			return validateAndroidId(value) || /^[a-fA-F0-9]{16}$/i.test(value);
		});

		if (validCodes.length > 0) {
			const firstValidCode = validCodes[0];
			detectedQRCode = firstValidCode.rawValue;

			scanSuccess = true;
			streamPaused = true;
			scanningActive = false;

			setTimeout(() => {
				onScan(firstValidCode.rawValue);
			}, 500);
		}
	};

	const trackDetectedCodes = (detectedCodes: DetectedBarcode[], ctx: CanvasRenderingContext2D) => {
		for (const detectedCode of detectedCodes) {
			const [firstPoint, ...otherPoints] = detectedCode.cornerPoints;

			ctx.strokeStyle = scanSuccess ? '#10b981' : '#3b82f6';
			ctx.lineWidth = 4;
			ctx.shadowColor = scanSuccess ? '#10b981' : '#3b82f6';
			ctx.shadowBlur = 8;

			ctx.beginPath();
			ctx.moveTo(firstPoint.x, firstPoint.y);
			for (const { x, y } of otherPoints) {
				ctx.lineTo(x, y);
			}
			ctx.lineTo(firstPoint.x, firstPoint.y);
			ctx.closePath();
			ctx.stroke();

			if (!scanSuccess) {
				ctx.strokeStyle = '#ffffff';
				ctx.lineWidth = 2;
				ctx.shadowBlur = 4;
				ctx.stroke();
			}

			ctx.shadowBlur = 0;
		}
	};

	const onCameraReady = async (capabilities: MediaTrackCapabilities) => {
		cameraLoading = false;
		scanningActive = true;
		error = '';
		permissionDenied = false;
		torchSupported = 'torch' in capabilities;
		cameraInitialized = true;

		await getCameraDevices();
	};

	const onCameraError = (err: Error) => {
		cameraLoading = false;
		scanningActive = false;
		cameraInitialized = false;

		if (err.name === 'NotAllowedError') {
			permissionDenied = true;
			error = 'Camera access denied. Please enable camera permissions and refresh the page.';
		} else if (err.name === 'NotFoundError') {
			error = 'No camera found on this device.';
		} else if (err.name === 'NotSupportedError') {
			error = 'Camera not supported on this device.';
		} else if (err.name === 'OverconstrainedError') {
			error = 'Camera constraints not supported. Trying with basic settings...';
			cameraConstraints = { facingMode: 'environment' };
		} else {
			error = 'Failed to access camera. Please try again.';
		}
	};

	const onCameraOff = () => {
		cameraLoading = true;
		scanningActive = false;
		cameraInitialized = false;
	};

	const handleCancel = () => {
		scanningActive = false;
		streamPaused = true;
		cameraLoading = false;
		error = '';
		scanSuccess = false;
		detectedQRCode = '';
		cameraInitialized = false;

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
		cameraInitialized = false;
		updateCameraConstraints();
	};

	const triggerFocusBoost = () => {
		if (!isAutoFocusing) {
			performAutoFocus();
		}
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
		<div class="flex flex-wrap justify-center gap-2">
			{#if availableCameras.length > 1 && !error}
				<div class="relative">
					<Button
						size="sm"
						variant="outline"
						class="justify-between"
						onclick={() => (showCameraSelector = !showCameraSelector)}
					>
						<div class="flex items-center gap-2">
							<Camera class="size-4" />
							<span class="text-sm">Switch Camera</span>
						</div>
						<ChevronDown class="size-4" />
					</Button>

					{#if showCameraSelector}
						<div
							class="absolute left-0 right-0 top-full z-50 mt-2 min-w-48 rounded-lg border border-border bg-card shadow-lg"
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
				<Button variant="outline" size="sm" onclick={toggleTorch} class="flex items-center gap-2">
					{#if torchEnabled}
						<FlashlightOff class="size-4" />
						<span class="hidden sm:inline">Flash Off</span>
					{:else}
						<Flashlight class="size-4" />
						<span class="hidden sm:inline">Flash On</span>
					{/if}
				</Button>
			{/if}
		</div>

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
							{onCameraOff}
							torch={torchEnabled}
							formats={['qr_code']}
							paused={streamPaused}
							onError={onCameraError}
							onCameraOn={onCameraReady}
							track={trackDetectedCodes}
							constraints={cameraConstraints}
							onDetect={handleQRCodeDetected}
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

						<div class="absolute inset-0 flex items-center justify-center p-4">
							<button
								onclick={triggerFocusBoost}
								disabled={scanSuccess || linkingWatch}
								class="relative transition-transform active:scale-95"
							>
								<div class="relative size-48 md:size-56 lg:size-64">
									<div
										class="absolute -left-1 -top-1 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-white shadow-lg {focusBoostActive
											? 'animate-pulse'
											: ''}"
									></div>
									<div
										class="absolute -right-1 -top-1 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-white shadow-lg {focusBoostActive
											? 'animate-pulse'
											: ''}"
									></div>
									<div
										class="absolute -bottom-1 -left-1 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-white shadow-lg {focusBoostActive
											? 'animate-pulse'
											: ''}"
									></div>
									<div
										class="absolute -bottom-1 -right-1 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-white shadow-lg {focusBoostActive
											? 'animate-pulse'
											: ''}"
									></div>

									<div
										class="absolute inset-4 rounded-lg border-2 border-dashed border-white/50 {focusBoostActive
											? 'animate-pulse border-primary'
											: ''}"
									></div>

									{#if !scanSuccess && !linkingWatch && cameraInitialized}
										<div class="absolute inset-0 flex items-center justify-center">
											<div class="text-center">
												<div class="mb-2 flex justify-center">
													<div class="rounded-full bg-white/20 p-2 backdrop-blur-sm">
														<Zap class="size-4 text-white" />
													</div>
												</div>
												<p class="text-xs font-medium text-white/80">Tap to focus</p>
											</div>
										</div>
									{/if}

									{#if scanSuccess}
										<div
											class="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-green-400 bg-green-500/20 backdrop-blur-sm"
										>
											<CheckCircle2 class="size-16 text-green-400 drop-shadow-lg" />
										</div>
									{/if}
								</div>
							</button>
						</div>

						{#if !error}
							<div class="absolute left-1/2 top-2 z-10 -translate-x-1/2 transform">
								{#if scanSuccess}
									<div
										class="flex items-center gap-2 rounded-full bg-green-500/95 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-sm"
									>
										<CheckCircle2 class="size-3" />
										<span>Detected!</span>
									</div>
								{:else if linkingWatch}
									<div
										class="flex items-center gap-2 rounded-full bg-primary/95 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-sm"
									>
										<div
											class="size-3 animate-spin rounded-full border-2 border-white/30 border-t-white"
										></div>
										<span>Linking...</span>
									</div>
								{:else if isAutoFocusing}
									<div
										class="flex items-center gap-2 rounded-full bg-primary/95 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-sm"
									>
										<Zap class="size-3 animate-pulse" />
										<span>Focusing...</span>
									</div>
								{:else if scanningActive}
									<div
										class="flex items-center gap-2 rounded-full bg-primary/95 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-sm"
									>
										<div class="size-2 animate-pulse rounded-full bg-white"></div>
										<span>Scanning...</span>
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
				Quick Tips
			</h3>
		</div>
		<div class="p-4 sm:p-6">
			<div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
				<div class="flex items-center gap-2">
					<div class="size-2 rounded-full bg-muted-foreground"></div>
					<span class="text-muted-foreground">Hold phone 6-12 inches away</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="size-2 rounded-full bg-muted-foreground"></div>
					<span class="text-muted-foreground">Tap the frame to focus</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="size-2 rounded-full bg-muted-foreground"></div>
					<span class="text-muted-foreground">Use flash in low light</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="size-2 rounded-full bg-muted-foreground"></div>
					<span class="text-muted-foreground">Keep phone steady</span>
				</div>
			</div>
		</div>
	</div>
</div>
