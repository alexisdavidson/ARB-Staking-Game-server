var { ethers } = require("ethers");
var express = require("express");
var axios = require("axios");
var dotenv = require("dotenv");
var fs = require("fs");
const router = express.Router();

const PoolMasterAbi = JSON.parse(fs.readFileSync('./contractsData/PoolMaster.json'));
const PoolMasterAddress = JSON.parse(fs.readFileSync('./contractsData/PoolMaster-address.json'));
const tokenList = JSON.parse(fs.readFileSync('./tokens.json'));

dotenv.config()

router.post('/', async (req, res) => {
    console.log("Ending epoch requested...")

    const provider = new ethers.providers.JsonRpcProvider(process.env.URL_SEPOLIA_INFURA)
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_TESTNETS, provider)
    console.log("wallet address", wallet.address)

    const poolMaster = new ethers.Contract(PoolMasterAddress.address, PoolMasterAbi.abi, wallet)
    console.log("poolMaster address", poolMaster.address)

    console.log("Getting current phase...")
    let phase = 0
    let epochEnded = false
    try {
      phase = parseInt(await poolMaster.getPhase())
      console.log("phase", phase)
    
      if (phase != 2) {
        console.log("The epoch is not ended yet")
        res.status(500).json("The epoch is not ended yet");
        return
      }
      
      epochEnded = await poolMaster.epochEnded()
      console.log("epochEnded", epochEnded)
    } catch (error) {
      console.log(error)
      res.status(500).json(error);
      return
    }

    if (!epochEnded) {
      console.log("Finding out winner...")
      let winnerId = 0
      let token1Symbol = await poolMaster.getSymbol(0)
      let token2Symbol = await poolMaster.getSymbol(1)
      console.log("token1Symbol", token1Symbol)
      console.log("token2Symbol", token2Symbol)

      let token1 = await getTokenBySymbol(token1Symbol)
      let token2 = await getTokenBySymbol(token2Symbol)
      console.log(token1)
      console.log(token2)

      if (token1.price < token2.price)
        winnerId = 1
      console.log("winnerId", winnerId)


      console.log("Ending epoch...")
      try {
        await(await poolMaster.endEpoch(winnerId)).wait()
      } catch (error) {
        console.log(error)
        res.status(500).json(error);
        return
      }
    } else {
      console.log("Epoch already ended.")
    }
    

    console.log("Starting new epoch...")
    let randomIndex1 = getRandom32Int() % tokenList.length
    let randomIndex2 = getRandom32Int() % tokenList.length
    let nextToken1Symbol = tokenList[randomIndex1].symbol
    let nextToken2Symbol = tokenList[randomIndex2].symbol
    console.log("nextToken1Symbol", nextToken1Symbol)
    console.log("nextToken2Symbol", nextToken2Symbol)

    try {
      await poolMaster.startEpoch(nextToken1Symbol, nextToken2Symbol)
      console.log("start epoch success")
    } catch (error) {
      console.log(error)
      res.status(500).json(error);
      return
    }

    res.status(200).json({msg: "success"});
});





const getTokenBySymbol = async (symbol) => {
  try {
    const response = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`, {
      params: {
        symbol: symbol,
        convert: 'USD'
      },
      headers: {
        'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY
      }
    });

    console.log("response")
    console.log(response)

    const token = response.data.data[symbol];
    return {
      name: token.name,
      symbol: token.symbol,
      price: token.quote.USD.price
    };
  } catch (error) {
    console.error(error);
  }
};


const getTop100Tokens = async () => {
  try {
    const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
      params: {
        start: 1,
        limit: 100,
        convert: 'USD'
      },
      headers: {
        'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY
      }
    });

    const tokens = response.data.data.map(token => {
      return {
        name: token.name,
        symbol: token.symbol,
        price: token.quote.USD.price,
        address: token.platform ? token.platform.token_address : null
      };
    });

    return tokens;
  } catch (error) {
    console.error(error);
  }
};

const getRandom32Int = () => {
    var temp = '0b';
    for (let i = 0; i < 32; i++)
      temp += Math.round(Math.random());

    const randomNum = BigInt(temp);
    // console.log(randomNum.toString());
    return randomNum.toString()
}

module.exports = router;
