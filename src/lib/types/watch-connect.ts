export type UserWatchLink = {
	id: string;
	watch?: Watch;
	user_id: string;
	watch_id: string;
	linked_at: string;
};

export type User = {
	id: string;
	name: string;
	email: string;
	created_at: string;
	image: string | null;
	email_verified: boolean;
};

export type WatchStatus = {
	id: string;
	watch_id: string;
	created_at: string;
	is_charging: boolean;
	battery_level: number;
	ram_used_percent: number;
	storage_used_percent: number;
	connection_type: 'wifi' | 'cellular';
};

export type Watch = {
	id: string;
	brand: string;
	model: string;
	api_level: number;
	android_id: string;
	created_at: string;
	wear_os_version: string;
	android_version: string;
	screen_shape: 'round' | 'square';
};
