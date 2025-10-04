import { renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";
import useQueryErrorToast from "../useQueryToast";

vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
	},
}));

describe("useQueryErrorToast", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should not call toast.error when isError is false", () => {
		renderHook(() => useQueryErrorToast({ isError: false, error: null }));
		expect(toast.error).not.toHaveBeenCalled();
	});

	it("should call toast.error when isError is true with a generic error", () => {
		const error = new Error("Network Error");
		renderHook(() => useQueryErrorToast({ isError: true, error }));

		expect(toast.error).toHaveBeenCalledWith("Data Error: Network Error", {
			id: "query-error-data",
			duration: 5000,
		});
	});

	it("should call toast.error with a custom context message", () => {
		const error = new Error("Failed to fetch");
		const contextMessage = "Campaign Data";
		renderHook(() =>
			useQueryErrorToast({ isError: true, error, contextMessage }),
		);

		expect(toast.error).toHaveBeenCalledWith(
			"Campaign Data Error: Failed to fetch",
			{
				id: "query-error-campaign-data",
				duration: 5000,
			},
		);
	});

	it("should handle null error object when isError is true", () => {
		renderHook(() => useQueryErrorToast({ isError: true, error: null }));

		expect(toast.error).toHaveBeenCalledWith(
			"Data Error: An unknown error occurred.",
			{
				id: "query-error-data",
				duration: 5000,
			},
		);
	});

	it("should not call toast.error on re-renders if isError remains false", () => {
		const { rerender } = renderHook(
			({ isError, error }) => useQueryErrorToast({ isError, error }),
			{
				initialProps: { isError: false, error: null },
			},
		);

		rerender({ isError: false, error: null });

		expect(toast.error).not.toHaveBeenCalled();
	});

	it("should call toast.error only once when isError becomes true", () => {
		const error = new Error("Initial Error");
		const { rerender } = renderHook(
			({ isError, error }) => useQueryErrorToast({ isError, error }),
			{
				initialProps: { isError: false, error },
			},
		);

		rerender({ isError: true, error });
		rerender({ isError: true, error });

		expect(toast.error).toHaveBeenCalledTimes(1);
		expect(toast.error).toHaveBeenCalledWith("Data Error: Initial Error", {
			id: "query-error-data",
			duration: 5000,
		});
	});
});
