export const cachingConfig = {
	assets: {
		immutable: true,
		maxAge: 31536000
	},
	api: {
		maxAge: 300,
		staleWhileRevalidate: 60
	}
};
