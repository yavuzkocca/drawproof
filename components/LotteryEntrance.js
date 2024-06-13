import { raffleAbi } from "../constants"
import raffleContract from '../raffleContract.json';
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
import { useAccount } from 'wagmi'
import { ethers } from "ethers";
import dotenv from 'dotenv';
dotenv.config();


export default function LotteryEntrance() {

    const { address, isConnecting, isConnected, isDisconnected } = useAccount()


    const provider = new ethers.providers.JsonRpcProvider(`https://base-sepolia.g.alchemy.com/v2/${process.env.BASE_SEPOLIA_PROVIDER}`);

    // State hooks
    const [numberOfPlayers, setNumberOfPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")
    const [numMoneyGathered, setMoneyGathered] = useState("0")
    const [contractAddress, setContractAddress] = useState("");

    const fetchContractAddress = async () => {
        try {
            const response = await fetch('/api/contract');
            const data = await response.json();
            setContractAddress(data.contractAddress);
        } catch (error) {
            console.error('Error fetching contract address:', error);
        }
    };

    useEffect(() => {
        fetchContractAddress()
    }, [])

    const provide = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provide.getSigner();

    const dispatch = useNotification()

    // 'enter' fonksiyonunu çağırma fonksiyonu
    async function enter() {
        const contract = new ethers.Contract(contractAddress, raffleAbi, signer);

        try {
            // enter fonksiyonunu çağırın
            const transaction = await contract.enter({ value: ethers.utils.parseEther("0.001") });
            await transaction.wait();

            // Son işlemi döndür
            return transaction;
        } catch (error) {
            // Hata durumunda hata mesajını döndür
            return error.message;
        }
    }


    // 'getPlayers' işlevini çağırma fonksiyonu
    async function getPlayers() {
        const contract = new ethers.Contract(contractAddress, raffleAbi, provider);

        // getPlayers fonksiyonunu çağırın
        const players = await contract.getPlayers();

        // Oyuncuları döndür
        return players;
    }

    // 'winner' işlevini çağırma fonksiyonu
    async function winner() {
        const contract = new ethers.Contract(contractAddress, raffleAbi, provider);

        // winner fonksiyonunu çağırın
        const winnerAddress = await contract.winner();

        // Kazanan adresi döndür
        return winnerAddress;
    }




    console.log(contractAddress)
    async function updateUIValues() {
        const recentWinnerFromCall = await winner()
        const numPlayersFromCallv1 = await getPlayers()
        const numPlayersFromCall = numPlayersFromCallv1?.length
        const numMoneyGathered = (numPlayersFromCallv1?.length * 0.1).toString()

        setMoneyGathered(numMoneyGathered)
        setNumberOfPlayers(numPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
    }


    useEffect(() => {
        if (isConnected && contractAddress) {
            updateUIValues()
        }
    }, [isConnected, contractAddress])




    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            updateUIValues()
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <div className="p-5 flex items-center justify-center">
                <div className=" w-full max-w-2xl items-center justify-center bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-center">
                        <img className="p-8 rounded-t-xl " src="https://i.ibb.co/MGhL5Yp/file-1.png" alt="product image" />
                    </div>
                    <div className="px-5 pb-5">
                        <div>
                            <h5 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2">DrawProof's NFT</h5>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-l font-bold text-gray-900 dark:text-white">Entrance Fee: 0.001 ETH</span>
                            {raffleContract ? (
                                <>
                                    {//ENTER RAFFLE BUTTON
                                        recentWinner == "0x0000000000000000000000000000000000000000" ? (<button
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                                            onClick={async () =>
                                                await enter({
                                                    // onComplete:
                                                    // onError:
                                                    onSuccess: handleSuccess,
                                                    onError: (error) => console.log(error),
                                                })
                                            }

                                        >

                                            Enter Raffle

                                        </button>) : (<button
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"

                                            disabled={true}
                                        >
                                            Raffle Ended Congrats!

                                        </button>)}
                                    {/* (<button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                                        onClick={async () =>
                                            await fetchRaffles({
                                                // onComplete:
                                                // onError:
                                                onSuccess: handleSuccess,
                                                onError: (error) => console.log(error),
                                            })
                                        }

                                    >
                                        Fetch!

                                    </button>) */}
                                </>

                            ) : (
                                <div className="text-l font-bold text-gray-900 dark:text-white">Please connect to BASE Sepolia </div>
                            )}


                        </div>

                        <div className="mt-5">
                            <div className="text-l font-bold text-gray-900 dark:text-white mb-1">The current number of players is: {numberOfPlayers}</div>
                            <div className="text-l font-bold text-gray-900 dark:text-white mb-1">Total Pot: {numMoneyGathered} ETH</div>
                            {recentWinner != "0x0000000000000000000000000000000000000000" ? (<div className="text-l font-bold text-gray-900 dark:text-white">Current Winner: {recentWinner}</div>
                            ) : (<div className="text-2xl mt-5 font-bold text-gray-900 dark:text-white">Raffle is LIVE!</div>
                            )
                            }

                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}