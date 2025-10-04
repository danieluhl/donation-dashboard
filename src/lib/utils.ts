import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// TODO: i18n?
export function formatCurrency(cents: number) {
	return `$${(cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function formatTime(date: string) {
	// return the time in the format HH:MM:SS AM/PM
	const options = {
		hour: "numeric",
		minute: "2-digit",
		second: "2-digit",
		hour12: true,
	} as const;

	// todo: i18n and some validation around parsing the date
	return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
}

export function formatCountdown(milliseconds: number) {
	const seconds = Math.max(0, milliseconds / 1000);

	const days = Math.floor(seconds / 86400);

	if (days > 0) {
		return `${days} day${days > 1 ? "s" : ""}`;
	}

	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);

	const hours = String(h).padStart(2, "0");
	const minutes = String(m).padStart(2, "0");
	const secs = String(s).padStart(2, "0");

	return `${hours}:${minutes}:${secs}`;
}

export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	if (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof (error as { message: unknown }).message === "string"
	) {
		return (error as { message: string }).message;
	}
	return "An unknown error occurred.";
}
