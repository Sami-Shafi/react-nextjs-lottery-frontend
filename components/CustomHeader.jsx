import { useMoralis } from "react-moralis";
import { useEffect } from "react";

export default function CustomHeader() {
	const {
		enableWeb3,
		account,
		isWeb3Enabled,
		Moralis,
		deactivateWeb3,
		isWeb3EnableLoading,
	} = useMoralis();

	useEffect(() => {
		if (isWeb3Enabled) return;
		if (
			typeof window !== "undefined" &&
			window.localStorage.getItem("Connected")
		) {
			enableWeb3();
		}
	}, [isWeb3Enabled]);

	useEffect(() => {
		Moralis.onAccountChanged((account) => {
			if (account == null) {
				window.localStorage.removeItem("Connected");
				deactivateWeb3();
			}
		});
	}, []);

	return (
		<div>
			<button
				onClick={async () => {
					await enableWeb3();
					if (typeof window !== "undefined") {
						window.localStorage.setItem(
							"Connected",
							"Inject Wallet"
						);
					}
				}}
				disabled={isWeb3EnableLoading}
			>
				{account ? (
					<h2>
						{`Connected to ${account.slice(0, 6)}...${account.slice(
							-4
						)}`}
					</h2>
				) : (
					"Connect"
				)}
			</button>
		</div>
	);
}
