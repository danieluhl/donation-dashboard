import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  type DonationMessage,
  MESSAGE_QUERY_KEY,
  useSocket,
} from "@/hooks/use-socket";
import { useCampaign } from "@/hooks/useCampaign";
import useQueryErrorToast from "@/hooks/useQueryToast";
import { formatCurrency, formatTime } from "@/lib/utils";

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

  const { data: totalDonations = 0 } = useQuery({
    queryKey: MESSAGE_QUERY_KEY,
    select: (messages: DonationMessage[]) =>
      messages.reduce((acc, msg) => acc + msg.amount, 0),
  });

  useQueryErrorToast({
    error: donationError,
    isError: isDonationError,
    contextMessage: "Failed to connect to the donation websocket",
  });

  const isConnected = useQueryClient().getQueryData(MESSAGE_QUERY_KEY) !== null;

  return (
    <div className="w-full h-full p-[1px] bg-gradient-to-br from-gray-300 to-gray-500">
      <section className="p-8 flex flex-col gap-8 h-full w-full bg-gradient-to-br from-blue-600/75 via-indego-900/70 to-violet-800/40">
        <header className="flex justify-between">
          <h1 className="text-white text-5xl font-bold">Donation Dashboard</h1>
          <div className="rounded-full px-5 py-1 flex items-center gap-2 bg-white/10 text-white font-2xl text-xl font-medium [text-shadow:0_-1px_0_rgba(0,0,0,0.1)]">
            {isConnected ? (
              <div>
                <span className="pr-3 text-shadow-none">🟢</span>Connected
              </div>
            ) : (
              <div>
                <span className="pr-1">🔴</span>Disconnected
              </div>
            )}
          </div>
        </header>
        <Separator className="h-3 bg-border" />
        <section className="flex gap-6 w-full">
          <Card className="border-[1.5px] rounded-2xl flex-1 text-center gap-4 py-8">
            <CardHeader>
              <h2 className="text-white/70 text-xl font-medium uppercase">
                Goal Amount
              </h2>
            </CardHeader>

            <CardContent>
              <p className="text-5xl text-yellow-300 font-bold">
                {formatCurrency(campaign?.goalAmount || 0)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-[1.5px] rounded-2xl flex-1 text-center gap-4 py-8">
            <CardHeader>
              <h2 className="text-white/70 text-xl font-medium uppercase">
                Current Total
              </h2>
            </CardHeader>

            <CardContent>
              <p className="text-5xl text-green-300 font-bold">
                {formatCurrency(totalDonations)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-[1.5px] rounded-2xl flex-1 text-center gap-4 py-8">
            <CardHeader>
              <h2 className="text-white/70 text-xl font-medium uppercase">
                Time Remaining
              </h2>
            </CardHeader>

            <CardContent>
              <p className="text-5xl text-red-400 font-bold">
                {formatCurrency(campaign?.goalAmount || 0)}
              </p>
            </CardContent>
          </Card>
        </section>
        <section>
          <Card className="border-[1.5px] rounded-2xl gap-4 flex flex-col">
            <CardHeader className="px-8 flex justify-between">
              <h2 className="text-white text-3xl font-bold">
                Progress to Goal
              </h2>
              <div>percent</div>
            </CardHeader>

            <CardContent>
              <div>bar</div>
              <div className="flex justify-between">
                <p>total so far</p>
                <p>total goal</p>
              </div>
            </CardContent>
          </Card>
        </section>
        <section>
          <Card className="border-[1.5px] rounded-2xl gap-4 flex flex-col">
            <CardHeader className="px-8 flex justify-between">
              <h2 className="text-white text-3xl font-bold">
                Recent Donations
              </h2>
            </CardHeader>

            <CardContent className="px-8">
              <ul className="flex flex-col gap-6">
                {donationMessages.map((donationMessage) => (
                  <li>
                    <Card className="border-[1.5px] rounded-2xl gap-4 flex flex-col">
                      <CardContent className="flex justify-between items-center">
                        <div className="flex flex-col gap-2">
                          <p className="text-white font-bold text-xl">
                            {donationMessage.donorName}
                          </p>
                          <p className="text-white/70">
                            {formatTime(donationMessage.timestamp)}
                          </p>
                        </div>
                        <div className="text-green-400 text-2xl font-bold">
                          {formatCurrency(donationMessage.amount)}
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </section>
    </div>
  );
};
