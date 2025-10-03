import { faker } from "@faker-js/faker";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import WebSocket, { WebSocketServer } from "ws";
import type { CampaignData, Message } from "../types";

const CONFIG = {
	HTTP_PORT: 3000,
	WEBSOCKET_PORT: 4000,
	DONATION_INTERVAL: 1000, // 1 second
} as const;

const app = new Hono();

app.use(
	"*",
	cors({
		origin: "*",
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: [
			"Origin",
			"X-Requested-With",
			"Content-Type",
			"Accept",
			"Authorization",
		],
	}),
);

app.get("/campaign", (c) => {
	const campaignData: CampaignData = {
		goalAmount: 5000000, // $50,000.00 in cents
		startingTotal: 0,
		endAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
	};

	return c.json(campaignData);
});

const wss = new WebSocketServer({ port: CONFIG.WEBSOCKET_PORT });

const connectedClients = new Set<WebSocket>();

wss.on("connection", (ws: WebSocket) => {
	connectedClients.add(ws);

	ws.on("close", () => {
		connectedClients.delete(ws);
		console.log(
			`Client disconnected: ${ws} (Total clients: ${connectedClients.size})`,
		);
	});

	ws.on("error", (error: Error) => {
		console.error(`WebSocket error for ${ws}:`, error);
		connectedClients.delete(ws);
	});
});

function createMessage(): Message {
	return {
		type: "donation",
		id: faker.string.uuid(),
		donorName: faker.person.fullName(),
		amount: faker.number.int({
			min: 100,
			max: 100000,
		}),
		timestamp: new Date().toISOString(),
	};
}

function broadcastMessage(): void {
	for (const client of connectedClients) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(JSON.stringify(createMessage())));
		}
	}
}

const donationInterval = setInterval(
	broadcastMessage,
	CONFIG.DONATION_INTERVAL,
);

wss.on("error", console.error);

serve({
	fetch: app.fetch,
	port: CONFIG.HTTP_PORT,
});

console.log(`HTTP server is running on port ${CONFIG.HTTP_PORT}`);
console.log(`Campaign endpoint: http://localhost:${CONFIG.HTTP_PORT}/campaign`);
console.log(`WebSocket server is running on port ${CONFIG.WEBSOCKET_PORT}`);

process.on("SIGINT", () => {
	console.log("\nShutting down server...");

	clearInterval(donationInterval);

	for (const client of connectedClients) {
		client.close();
	}

	wss.close(() => {
		console.log("Server closed");
		process.exit(0);
	});
});

process.on("SIGTERM", () => {
	console.log("Received SIGTERM, shutting down gracefully...");
	process.kill(process.pid, "SIGINT");
});
