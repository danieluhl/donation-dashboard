import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type DonationMessage,
	MESSAGE_QUERY_KEY,
	useSocket,
	WS_STATUS_QUERY_KEY,
} from "../hooks/use-socket";

export const Dashboard = () => {
	useSocket();
	const queryClient = useQueryClient();

	const { data: messages = [] } = useQuery<DonationMessage[]>({
		queryKey: MESSAGE_QUERY_KEY,
		// default to empty list of donations
		queryFn: async () => [],
	});

	const isConnected =
		queryClient.getQueryData<boolean>(WS_STATUS_QUERY_KEY) ?? false;

	return (
		<div>
			Message:
			{JSON.stringify(messages)}
			{isConnected ? "Connected" : "Not Connected"}
		</div>
	);
};
