import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { env } from "../env";

const donationMessageSchema = z.object({
	type: z.literal("donation"),
	id: z.uuid().describe("Unique identifier for the donation message"),
	donorName: z.string().min(1).describe("Name of the donor"),
	amount: z
		.number()
		.positive()
		.describe("The donation amount in positive cents"),
	message: z.string().optional().describe("Donation message"),
	timestamp: z.iso.datetime().describe("ISO 8601 formatted timestamp string"),
});

export type DonationMessage = z.infer<typeof donationMessageSchema>;

export const MESSAGE_QUERY_KEY = ["donation"];
export const WS_STATUS_QUERY_KEY = ["wsStatus"];
const RECONNECT_BACKOFF_START_MS = 200;

export const useSocket = () => {
	// disable <ScrictMode> for web socket hook
	// todo: maybe we should pull this out of a hook and into a separate lib
	//  and put it at the root of the app
	const isInitialized = useRef(false);

	const queryClient = useQueryClient();
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimeoutRef = useRef<number | null>(null);
	const retryBackoffRef = useRef<number>(RECONNECT_BACKOFF_START_MS);

	useEffect(() => {
		if (isInitialized.current) {
			return;
		}
		isInitialized.current = true;

		const connect = () => {
			const ws = new WebSocket(env.VITE_SOCKET_URL);
			wsRef.current = ws;

			ws.onopen = () => {
				console.log("WS: Connection Established ✅");
				queryClient.setQueryData(WS_STATUS_QUERY_KEY, true);
				if (reconnectTimeoutRef.current) {
					clearTimeout(reconnectTimeoutRef.current);
					reconnectTimeoutRef.current = null;
					retryBackoffRef.current = RECONNECT_BACKOFF_START_MS;
				}
			};

			ws.onmessage = (event: MessageEvent) => {
				try {
					// TODO: talk to those silly backend devs to figure out why this is double stringified
					const parsedMessage = JSON.parse(JSON.parse(event.data));
					const newMessage: DonationMessage =
						donationMessageSchema.parse(parsedMessage);

					queryClient.setQueryData<DonationMessage[]>(
						MESSAGE_QUERY_KEY,
						(oldData) => {
							return [newMessage, ...(oldData || [])];
						},
					);
				} catch (e) {
					console.error("WS Sync: Failed to parse message.", e);
				}
			};

			ws.onclose = () => {
				console.log("WS: Connection Closed 🚪");
				queryClient.setQueryData(WS_STATUS_QUERY_KEY, false);
				if (reconnectTimeoutRef.current) {
					clearTimeout(reconnectTimeoutRef.current);
					retryBackoffRef.current = retryBackoffRef.current * 1.5;
				}
				reconnectTimeoutRef.current = window.setTimeout(() => {
					console.log("WS: Attempting to reconnect...");
					connect();
				}, retryBackoffRef.current);
			};

			ws.onerror = (errorEvent) => {
				console.error("WS: Error:", errorEvent);
				ws.close(); // This will trigger the onclose handler and reconnection logic
			};
		};

		connect();

		// Cleanup: Close the connection on component unmount
		return () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
			if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
				wsRef.current.close();
			}
		};
	}, [queryClient]);

	// Expose the raw socket instance or methods if you need to send messages
	// (In a real app, you'd likely manage sending via another service layer)
	return {}; // This hook is primarily for side effects (syncing cache)
};
