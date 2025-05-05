declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				email: string;
				name?: string;
				createdAt: Date;
				updatedAt: Date;
				image?: string | null;
				emailVerified: boolean;
			} | null;
		}
	}
}

export {};
