import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
	type DonationMessage,
	MESSAGE_QUERY_KEY,
	useSocket,
	WS_STATUS_QUERY_KEY,
} from "@/hooks/use-socket";
import { useCampaign } from "@/hooks/useCampaign";
import useQueryErrorToast from "@/hooks/useQueryToast";
import { formatCountdown, formatCurrency, formatTime } from "@/lib/utils";

const TimeRemaining = ({ endAt }: { endAt: string }) => {
	const endDate = new Date(endAt);
	const [timeRemaining, setTimeRemaining] = useState(
		endDate.getTime() - Date.now(),
	);
	useEffect(() => {
		const interval = setInterval(() => {
			setTimeRemaining(endDate.getTime() - Date.now());
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	return <span>{formatCountdown(timeRemaining)}</span>;
};

export const Dashboard = () => {
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
		isLoading: isDonationLoading,
	} = useQuery<DonationMessage[]>({
		queryKey: MESSAGE_QUERY_KEY,
		queryFn: () => [],
	});

	const { data: totalDonations = 0 } = useQuery({
		queryKey: MESSAGE_QUERY_KEY,
		select: (messages: DonationMessage[]) =>
			messages.reduce((acc, msg) => acc + msg.amount, 0),
		queryFn: () => [],
	});

	useQueryErrorToast({
		error: donationError,
		isError: isDonationError,
		contextMessage: "Failed to connect to the donation websocket",
	});

	const { data: isConnected = false } = useQuery({
		queryKey: WS_STATUS_QUERY_KEY,
		queryFn: () => false,
	});

	const donationPercent =
		campaign && totalDonations < campaign.goalAmount
			? Math.floor((totalDonations / campaign.goalAmount) * 100)
			: 100;

	return (
		<main className="min-h-[100vh] w-full p-[1px] bg-gradient-to-br from-gray-300 to-gray-500 text-white">
			<section className="min-h-[100vh] p-8 flex flex-col gap-8 h-full w-full bg-gradient-to-br from-blue-600/75 via-indego-900/70 to-violet-800/40">
				<header className="flex justify-between">
					<h1 className="text-5xl font-bold">Donation Dashboard</h1>
					<output
						aria-live="polite"
						className="rounded-full px-5 py-1 flex items-center gap-2 bg-white/10 font-2xl text-xl font-medium [text-shadow:0_-1px_0_rgba(0,0,0,0.1)]"
					>
						{isConnected ? (
							<div className="flex items-center">
								<span aria-hidden="true" className="pr-3 text-shadow-none">
									🟢
								</span>
								<span className="sr-only">Connection status:</span>
								Connected
							</div>
						) : (
							<div className="flex items-center">
								<span aria-hidden="true" className="pr-3 text-shadow-none">
									🔴
								</span>
								<span className="sr-only">Connection status:</span>
								Disconnected
							</div>
						)}
					</output>
				</header>
				<Separator className="h-3 bg-border" />

				{isCampaignError && (
					<div role="alert">
						<p className="text-4xl font-bold">
							We're having trouble loading this campaign, please refresh the
							page.
						</p>
					</div>
				)}

				{!isCampaignError && (
					<>
						<section className="flex gap-6 w-full">
							<Card variant="ghost" className="flex-1 text-center">
								<CardHeader>
									<h2 className="text-white/70 text-xl font-medium uppercase">
										Goal Amount
									</h2>
								</CardHeader>

								<CardContent>
									<p
										data-testid="goal"
										className="text-5xl text-yellow-300 font-bold"
									>
										{!isCampaignLoading && campaign
											? formatCurrency(campaign.goalAmount || 0)
											: "Loading..."}
									</p>
								</CardContent>
							</Card>
							<Card
								variant="ghost"
								className="border-[1.5px] flex-1 text-center"
							>
								<CardHeader>
									<h2 className="text-white/70 text-xl font-medium uppercase">
										Current Total
									</h2>
								</CardHeader>

								<CardContent>
									<p
										data-testid="total-raised"
										className="text-5xl text-green-300 font-bold"
										aria-live="polite"
									>
										{!isCampaignLoading && campaign
											? formatCurrency(totalDonations)
											: "Loading..."}
									</p>
								</CardContent>
							</Card>
							<Card
								variant="ghost"
								className="border-[1.5px] flex-1 text-center"
							>
								<CardHeader>
									<h2 className="text-white/70 text-xl font-medium uppercase">
										Time Remaining
									</h2>
								</CardHeader>

								<CardContent>
									<p className="text-5xl text-red-400 font-bold">
										{!isCampaignLoading && campaign ? (
											<TimeRemaining endAt={campaign.endAt} />
										) : (
											"Loading..."
										)}
									</p>
								</CardContent>
							</Card>
						</section>
						<section>
							<Card variant="ghost" className="border-[1.5px] rounded-2xl">
								<CardHeader className="px-8 flex justify-between">
									<h2 className="text-3xl font-bold">Progress to Goal</h2>
									{donationPercent < 50 && (
										<div className="text-yellow-400 text-2xl font-bold">
											{donationPercent}%
										</div>
									)}
									{donationPercent >= 50 && (
										<div className="text-green-400 text-2xl font-bold">
											{donationPercent}%
										</div>
									)}
								</CardHeader>

								<CardContent className="flex flex-col gap-4">
									<Progress
										data-testid="progress-bar"
										value={donationPercent}
										className="h-4 bg-white/20 text-blue-600"
										aria-label="Donation progress towards goal"
									/>
									<div className="flex justify-between text-white/80">
										<p>{formatCurrency(totalDonations)}</p>

										{!isCampaignLoading && campaign ? (
											<p>{formatCurrency(campaign.goalAmount)}</p>
										) : (
											"Loading..."
										)}
									</div>
								</CardContent>
							</Card>
						</section>
						<section>
							<Card className="gap-4 flex flex-col" variant="ghost">
								<CardHeader className="py-3 px-8 flex justify-between">
									<h2 className="text-3xl font-bold">Recent Donations</h2>
								</CardHeader>

								<CardContent className="px-8">
									<ul
										className="flex flex-col gap-6"
										aria-live="polite"
										aria-atomic="false"
									>
										{isDonationError && (
											<li role="alert">
												<Card variant="ghost" className="border-[1.5px]">
													<CardContent className="flex justify-between items-center">
														We're having trouble loading the donations
													</CardContent>
												</Card>
											</li>
										)}
										{isDonationLoading && (
											<li>
												<Card variant="ghost" className="border-[1.5px]">
													<CardContent className="flex justify-between items-center">
														Loading...
													</CardContent>
												</Card>
											</li>
										)}
										{donationMessages.map((donationMessage) => (
											<li data-testid="donation-card" key={donationMessage.id}>
												<Card variant="ghost" className="border-[1.5px]">
													<CardContent className="flex justify-between items-center">
														<div className="flex flex-col gap-2">
															<p
																data-testid="user-name"
																className="font-bold text-xl"
															>
																{donationMessage.donorName}
															</p>
															{donationMessage.message && (
																<p
																	data-testid="donation-message"
																	className="font-bold text-xl"
																>
																	{donationMessage.message}
																</p>
															)}
															<p className="text-white/70">
																{formatTime(donationMessage.timestamp)}
															</p>
														</div>
														<p
															data-testid="donation-amount"
															className="text-green-400 text-2xl font-bold"
														>
															{formatCurrency(donationMessage.amount)}
														</p>
													</CardContent>
												</Card>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						</section>
					</>
				)}
			</section>
		</main>
	);
};
