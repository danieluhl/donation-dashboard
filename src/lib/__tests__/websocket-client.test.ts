import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { queryClient } from "../websocket-client";

describe("queryClient", () => {
	it("should be an instance of QueryClient", () => {
		expect(queryClient).toBeInstanceOf(QueryClient);
	});

	it("should have the correct default options", () => {
		const defaultOptions = queryClient.getDefaultOptions();
		expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
		expect(defaultOptions.queries?.staleTime).toBe(Infinity);
	});
});
