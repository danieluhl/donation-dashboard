import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/lib/websocket-client";
import { Dashboard } from "@/pages/dashboard";

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Dashboard />
			<Toaster />
		</QueryClientProvider>
	);
}

export default App;
