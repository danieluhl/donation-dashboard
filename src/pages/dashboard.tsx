import { useQuery } from "@tanstack/react-query";
import {
	type DonationMessage,
	MESSAGE_QUERY_KEY,
	useSocket,
} from "@/hooks/use-socket";
import { useCampaign } from "@/hooks/useCampaign";
import useQueryErrorToast from "@/hooks/useQueryToast";

export const Dashboard = () => {
	// TODO: should this be at the app level?
	useSocket();

	const {
		data: campaign,
		error: campaignError,
		isLoading: isCampaignLoading,
		isError: isCampaignError,
	} = useCampaign();

	useQueryErrorToast({
		error: campaignError,
		isError: isCampaignError,
		contextMessage: "Failed to load initial campaign",
	});

	const {
		data: donationMessages = [],
		error: donationError,
		isError: isDonationError,
	} = useQuery<DonationMessage[]>({
		queryKey: MESSAGE_QUERY_KEY,
		queryFn: () => [],
	});

	useQueryErrorToast({
		error: donationError,
		isError: isDonationError,
		contextMessage: "Failed to connect to the donation websocket",
	});

	return (
		<div>
			{isCampaignLoading && "Loading campaign..."}
			{campaign && <h1>{campaign.goalAmount}</h1>}
			{donationMessages.map((message) => (
				<div key={message.id}>
					<h2>{message.donorName}</h2>
					<p>{message.amount}</p>
				</div>
			))}
		</div>
	);
};
