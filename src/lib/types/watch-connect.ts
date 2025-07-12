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
	battery_level: number | null;
	ram_used_percent: number | null;
	storage_used_percent: number | null;
	connection_type: 'wifi' | 'cellular' | null;
};

export type Watch = {
	id: string;
	android_id: string;
	created_at: string;
	brand: string | null;
	model: string | null;
	api_level: number | null;
	wear_os_version: string | null;
	android_version: string | null;
	screen_shape: 'round' | 'square' | null;
};
