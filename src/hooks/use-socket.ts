import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { z } from "zod";

const DonationMessageSchema = z.object({
	type: z.literal("donation"),
	id: z.uuid().describe("Unique identifier for the donation message"),
	donorName: z.string().min(1).describe("Name of the donor"),
	amount: z
		.number()
		.positive()
		.describe("The donation amount in positive cents"),
	timestamp: z.iso.datetime().describe("ISO 8601 formatted timestamp string"),
});

export type DonationMessage = z.infer<typeof DonationMessageSchema>;

export const MESSAGE_QUERY_KEY = ["donation"];
export const WS_STATUS_QUERY_KEY = ["wsStatus"];
const WS_URL = "ws://localhost:4000";

export const useSocket = () => {
	const queryClient = useQueryClient();

	useEffect(() => {
		const ws = new WebSocket(WS_URL);

		ws.onopen = () => {
			console.log("WS: Connection Established (TanStack Sync) ✅");
			queryClient.setQueryData(WS_STATUS_QUERY_KEY, true);
		};

		ws.onmessage = (event: MessageEvent) => {
			try {
				const newMessage: DonationMessage = JSON.parse(event.data);

				// **THE CORE LOGIC:** Update the cache directly
				queryClient.setQueryData<DonationMessage[]>(
					MESSAGE_QUERY_KEY,
					(oldData) => {
						// If the cache is empty, start with the new message
						if (!oldData) return [newMessage];
						// Otherwise, append the new message to the existing list
						return [...oldData, newMessage];
					},
				);
			} catch (e) {
				console.error("WS Sync: Failed to parse message.", e);
			}
		};

		ws.onclose = () => {
			console.log("WS: Connection Closed 🚪");
			queryClient.setQueryData(WS_STATUS_QUERY_KEY, false);
			// NOTE: Reconnection logic would go here.
		};

		// Cleanup: Close the connection on component unmount
		return () => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.close();
			}
		};
	}, [queryClient]);

	// Expose the raw socket instance or methods if you need to send messages
	// (In a real app, you'd likely manage sending via another service layer)
	return {}; // This hook is primarily for side effects (syncing cache)
};
