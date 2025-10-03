import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCampaign } from "../useCampaign";

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

// todo: use zod faker library once it's updated to support latest zod
const mockCampaign = {
	goalAmount: 100000, // $1,000.00
	startingTotal: 50000, // $500.00
	endAt: new Date().toISOString(),
};

describe("useCampaign", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("should return campaign data on successful fetch", async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockCampaign),
		});
		vi.stubGlobal("fetch", mockFetch);

		const wrapper = createWrapper();
		const { result } = renderHook(() => useCampaign(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data).toEqual(mockCampaign);
	});

	it("should be in a loading state initially", () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockCampaign),
		});
		vi.stubGlobal("fetch", mockFetch);

		const wrapper = createWrapper();
		const { result } = renderHook(() => useCampaign(), { wrapper });

		expect(result.current.isLoading).toBe(true);
	});

	it("should handle fetch error", async () => {
		const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
		vi.stubGlobal("fetch", mockFetch);

		const wrapper = createWrapper();
		const { result } = renderHook(() => useCampaign(), { wrapper });

		await waitFor(() => expect(result.current.isError).toBe(true));

		expect(result.current.error).toEqual(new Error("Network error"));
	});

	it("should handle invalid data from the server", async () => {
		const invalidData = { ...mockCampaign, goalAmount: "not-a-number" };
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(invalidData),
		});
		vi.stubGlobal("fetch", mockFetch);

		const wrapper = createWrapper();
		const { result } = renderHook(() => useCampaign(), { wrapper });

		await waitFor(() => expect(result.current.isError).toBe(true));

		expect(result.current.error).toBeInstanceOf(Error);
		const zodError = [
			{
				expected: "number",
				code: "invalid_type",
				path: ["goalAmount"],
				message: "Invalid input: expected number, received string",
			},
		];
		const errorResult = JSON.parse(result.current.error?.message || "");
		expect(errorResult).toEqual(zodError);
	});
});
