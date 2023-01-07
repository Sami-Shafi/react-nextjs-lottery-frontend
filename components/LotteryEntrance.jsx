import { contractAddresses, abi } from "../constants";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

export default function LotteryEntrance() {
	const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
	const chainId = parseInt(chainIdHex).toString();
	const lotteryAddress =
		chainId in contractAddresses ? contractAddresses[chainId][0] : null;
	const [entranceFee, setEntranceFee] = useState("0");
	const [numPlayers, setNumPlayers] = useState("0");
	const [recentWinner, setRecentWinner] = useState("0");

	const dispatch = useNotification();

	// check if web3 is connected or something and update the UI
	useEffect(() => {
		if (isWeb3Enabled) {
			updateUI();
		}
	}, [isWeb3Enabled]);

	const updateUI = async () => {
		// view functions of the contract
		const contractEntranceFee = (await getEntranceFee()).toString();
		const contractNumPlayers = (await getNumOfPlayers()).toString();
		const contractRecentWinner = await getRecentWinner();

		// change the state properties
		setEntranceFee(contractEntranceFee);
		setNumPlayers(contractNumPlayers);
		setRecentWinner(contractRecentWinner);
	};

	// get some functions from the contract
	const { runContractFunction: getEntranceFee } = useWeb3Contract({
		abi,
		contractAddress: lotteryAddress,
		functionName: "getEntranceFee",
		params: {},
	});

	const { runContractFunction: getNumOfPlayers } = useWeb3Contract({
		abi,
		contractAddress: lotteryAddress,
		functionName: "getNumOfPlayers",
		params: {},
	});

	const { runContractFunction: getRecentWinner } = useWeb3Contract({
		abi,
		contractAddress: lotteryAddress,
		functionName: "getRecentWinner",
		params: {},
	});

	const {
		runContractFunction: enterTheLottery,
		isLoading,
		isFetching,
	} = useWeb3Contract({
		abi,
		contractAddress: lotteryAddress,
		functionName: "enterTheLottery",
		params: {},
		msgValue: entranceFee,
	});

	// show some notifications
	const handleSuccess = async (tx) => {
		await tx.wait(1);
		handleNewNotification(tx);
		updateUI();
	};

	const handleNewNotification = () => {
		dispatch({
			type: "success",
			message: "Transaction Complete!",
			title: "Success!",
			position: "bottomL",
			icon: "bell",
		});
	};

	// if there is any lottery contract in this chain we will show the info
	// else we say No lottery Detected
	return lotteryAddress ? (
		<div className="p-5">
			<button
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				onClick={async () => {
					await enterTheLottery({
						onSuccess: handleSuccess,
						onError: (err) => console.log(err),
					});
				}}
				disabled={isLoading || isFetching}
			>
				{isLoading || isFetching ? (
					<div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
				) : (
					<div>Enter Lottery</div>
				)}
			</button>
			<div className="mt-4">
				<div>
					Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
					Number of
				</div>
				<div>Player Number: {numPlayers}</div>
				<div>Recent Winner: {recentWinner}</div>
			</div>
		</div>
	) : (
		<div className="p-5">No Lottery Detected. Sorry!</div>
	);
}
