import { ethers } from "ethers"
import PoolMasterAbi from '../contractsData/PoolMaster.json' assert { type: "json" };
import PoolMasterAddress from '../contractsData/PoolMaster-address.json' assert { type: "json" };
import express from 'express';
import dotenv from 'dotenv'
const router = express.Router();

dotenv.config()

router.post('/', async (req, res) => {
    console.log("Ending epoch...")

    const provider = new ethers.providers.JsonRpcProvider(process.env.URL_SEPOLIA_INFURA)
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_TESTNETS, provider)

    const poolMaster = new ethers.Contract(PoolMasterAddress.address, PoolMasterAbi.abi, wallet)
    
    console.log("Start new epoch...")
    const nextRandomNumber = getRandom32Int()

    res.send('Success', poolMaster.address);
});

const getRandom32Int = () => {
    var temp = '0b';
    for (let i = 0; i < 32; i++)
      temp += Math.round(Math.random());

    const randomNum = BigInt(temp);
    console.log(randomNum.toString());
    return randomNum.toString()
}

export default router;
