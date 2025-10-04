import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	MESSAGE_QUERY_KEY,
	useSocket,
	WS_STATUS_QUERY_KEY,
} from "../use-socket";

const mockWebSocket = {
	onopen: vi.fn(),
	onmessage: vi.fn(),
	onclose: vi.fn(),
	close: vi.fn(),
	readyState: 1, // OPEN
};

const MockWebSocket = vi.fn(() => mockWebSocket);
// @ts-expect-error - we are mocking
MockWebSocket.OPEN = 1;

vi.stubGlobal("WebSocket", MockWebSocket);

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});
	return ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
};

describe("useSocket", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should establish a WebSocket connection and update status", async () => {
		const wrapper = createWrapper();
		renderHook(() => useSocket(), { wrapper });

		// Simulate connection open
		mockWebSocket.onopen();

		await waitFor(() => {
			const queryClient = wrapper({ children: null }).props.client;
			const status = queryClient.getQueryData(WS_STATUS_QUERY_KEY);
			expect(status).toBe(true);
		});
	});

	it("should handle incoming messages and update query cache", async () => {
		const wrapper = createWrapper();
		renderHook(() => useSocket(), { wrapper });

		const newMessage = {
			type: "donation",
			id: "af7d7705-3aa8-4d45-ae91-aeb7fbfba06d",
			donorName: "John Doe",
			amount: 1000,
			timestamp: new Date().toISOString(),
		};

		// Simulate receiving a message
		mockWebSocket.onmessage({
			data: JSON.stringify(JSON.stringify(newMessage)),
		});

		await waitFor(() => {
			const queryClient = wrapper({ children: null }).props.client;
			const messages = queryClient.getQueryData(MESSAGE_QUERY_KEY);
			expect(messages).toEqual([newMessage]);
		});
	});

	it("should handle connection close and update status", async () => {
		const wrapper = createWrapper();
		renderHook(() => useSocket(), { wrapper });

		// Simulate connection close
		mockWebSocket.onclose();

		await waitFor(() => {
			const queryClient = wrapper({ children: null }).props.client;
			const status = queryClient.getQueryData(WS_STATUS_QUERY_KEY);
			expect(status).toBe(false);
		});
	});

	it("should close the connection on unmount", () => {
		const wrapper = createWrapper();
		const { unmount } = renderHook(() => useSocket(), { wrapper });

		unmount();

		expect(mockWebSocket.close).toHaveBeenCalled();
	});
});
