import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// TODO: i18n?
export const formatCurrency = (cents: number) => {
	return `$${(cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

export const formatTime = (date: string) => {
	// return the time in the format HH:MM:SS AM/PM
	const options = {
		hour: "numeric",
		minute: "2-digit",
		second: "2-digit",
		hour12: true,
	} as const;

	// todo: i18n and some validation around parsing the date
	return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
};

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
