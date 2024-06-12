// pages/api/endRaffle.js

import { ethers } from "ethers";
import 'dotenv/config';
import { createClient } from "@vercel/kv";

const baser = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

const provider = new ethers.providers.JsonRpcProvider(`https://base-sepolia.g.alchemy.com/v2/${process.env.BASE_SEPOLIA_PROVIDER}`);
const wallet = new ethers.Wallet(process.env.PRIV_KEY, provider);

// KV'den veriyi okuma fonksiyonu
const readEventDataFromKV = async () => {
    return await baser.get("contractAddress");
};

// Sözleşme adresini KV'den alın
const getContractAddress = async () => {
    let contractAddress = await readEventDataFromKV()
    return contractAddress;
};

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const contractAddress = await getContractAddress();
            res.status(200).json({ contractAddress });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
