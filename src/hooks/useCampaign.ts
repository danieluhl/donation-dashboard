import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { env } from "../env";

export const CampaignSchema = z.object({
	goalAmount: z.number(),
	startingTotal: z.number(),
	endAt: z.iso.datetime(),
});

export type Campaign = z.infer<typeof CampaignSchema>;

const fetchCampaigns = async () => {
	const response = await fetch(env.VITE_SERVER_URL, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const data = await response.json();
	return CampaignSchema.parse(data);
};

export const useCampaign = () => {
	return useQuery<Campaign>({
		queryKey: ["campaign"],
		queryFn: fetchCampaigns,
		// staleTime: 1000 * 60 * 5 // 5 minutes
	});
};
