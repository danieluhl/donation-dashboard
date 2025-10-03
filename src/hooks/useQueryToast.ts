import { useEffect } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

/**
 * A custom hook to display a Sonner toast when a Tanstack Query encounters an error.
 */
const useQueryErrorToast = ({
	isError,
	error,
	contextMessage = "Data",
}: {
	isError: boolean;
	error: Error | null;
	contextMessage?: string;
}) => {
	useEffect(() => {
		if (isError) {
			const errorMessage = getErrorMessage(error);

			toast.error(
				`${contextMessage ? contextMessage + " " : ""}Error: ${errorMessage}`,
				{
					id: `query-error-${contextMessage.toLowerCase().replace(/\s/g, "-")}`,
					duration: 5000,
				},
			);
		}
	}, [isError, error, contextMessage]);
};

export default useQueryErrorToast;
