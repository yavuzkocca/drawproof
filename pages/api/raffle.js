// pages/api/raffle.js

import { ethers } from "ethers";
import 'dotenv/config'
import { raffleFactoryAbi, raffleAbi } from "../../constants"
import { createClient } from "@vercel/kv";

const baser = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});


const provider = new ethers.providers.JsonRpcProvider(`https://base-sepolia.g.alchemy.com/v2/${process.env.BASE_SEPOLIA_PROVIDER}`);
const wallet = new ethers.Wallet(process.env.PRIV_KEY, provider);



// KV'de saklanan veriyi güncelleme fonksiyonu
const writeEventDataToKV = async (eventData) => {
    await baser.set("contractAddress", eventData);
};

// KV'den veriyi okuma fonksiyonu
const readEventDataFromKV = async () => {
    return await baser.get("contractAddress");
};

const contract = new ethers.Contract(process.env.FACTORY_CONTRACT_ADDRESS, raffleFactoryAbi, provider);


// Etkinlik dinleyicisini hemen ekle
contract.on("RaffleDeployed", async (from) => {
    await writeEventDataToKV(from);
});




const createRaffleWithWallet = async () => {
    const tx = await contract.connect(wallet).createRaffle("https://i.ibb.co/3y0SGCH/winner-nft.webp");
    const receipt = await tx.wait();
}




export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const contractAddress = await readEventDataFromKV();
            if (!contractAddress) {
                return res.status(404).json({ error: 'Contract address not found' });
            }

            const contract = new ethers.Contract(contractAddress, raffleAbi, wallet);

            // Raffle bitirme işlemini gerçekleştir
            const tx = await contract.pickWinner();
            await tx.wait();
            await createRaffleWithWallet();
            res.status(200).json({ message: 'Raffle created successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}