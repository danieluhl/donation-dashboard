export type CampaignData = {
	goalAmount: number; // in cents
	startingTotal: number; // in cents
	endAt: string; // ISO timestamp
};

export type Message = {
	type: "donation";
	id: string;
	donorName: string;
	amount: number; // in cents
	message?: string;
	timestamp: string; // ISO timestamp
};
