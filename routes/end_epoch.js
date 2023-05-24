import { ethers } from "ethers"
import PoolMasterAbi from '../contractsData/PoolMaster.json' assert { type: "json" };
import PoolMasterAddress from '../contractsData/PoolMaster-address.json' assert { type: "json" };
import express from 'express';
import dotenv from 'dotenv'
const router = express.Router();

dotenv.config()

router.post('/', async (req, res) => {
    console.log("Ending epoch requested...")

    const provider = new ethers.providers.JsonRpcProvider(process.env.URL_SEPOLIA_INFURA)
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_TESTNETS, provider)
    console.log("wallet address", wallet.address)

    const poolMaster = new ethers.Contract(PoolMasterAddress.address, PoolMasterAbi.abi, wallet)
    console.log("poolMaster address", poolMaster.address)
    // console.log("poolMaster abi", PoolMasterAbi.abi)
    

    console.log("Getting current phase...")
    let phase = 0
    try {
      phase = parseInt(await poolMaster.getPhase())
      console.log("phase", phase)
    
      if (phase != 2) {
        res.status(500).json("The epoch is not ended yet");
        return
      }
    } catch (error) {
      console.log(error)
      res.status(500).json(error);
      return
    }


    console.log("Finding out winner...")
    let winnerId = 0
    console.log("winnerId", winnerId)


    console.log("Ending epoch...")
    try {
      await poolMaster.endEpoch(winnerId)
    } catch (error) {
      console.log(error)
      res.status(500).json(error);
      return
    }
    

    console.log("Starting new epoch...")
    const nextRandomNumber = getRandom32Int()

    res.status(200).json({msg: "success " + poolMaster.address});
});

const getRandom32Int = () => {
    var temp = '0b';
    for (let i = 0; i < 32; i++)
      temp += Math.round(Math.random());

    const randomNum = BigInt(temp);
    // console.log(randomNum.toString());
    return randomNum.toString()
}

export default router;
