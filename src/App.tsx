import "./App.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/websocket-client";
import { Dashboard } from "./pages/dashboard";

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Dashboard />
		</QueryClientProvider>
	);
}

export default App;
