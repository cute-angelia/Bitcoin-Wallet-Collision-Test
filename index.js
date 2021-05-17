const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');
const express = require('express');
const app = express();
const port = 3000;

const mongoose = require('mongoose');
const { text } = require('express');
mongoose.connect('mongodb://localhost/bitwallet');

const walletSchema = new mongoose.Schema({
  publicK: String,
  privateK: String,
  bl: Number
});

const Wallet = mongoose.model('Wallet', walletSchema);

// 查询余额
function queryCoin(address, pkey) {
  const url = `https://btc.com/service/addressMentions?page=1&address=${address}`;
  try {
    axios.get(url).then(response => {
      if (response.error_no == 0) {
        const acc = new Wallet({ publicK: address, privateK: pkey, bl: response.data });
        console.log({ address, pkey });
        acc.save(function (err) {
          if (err) return console.error(err);
        });
        console.log(address + '============== >>>> has balance' + pkey);

        sendMsg(address + ' ==============>>>> has balance:' + pkey)

        clearInterval(interval)
      } else {
        console.clear();
        console.log({ address, bl: response.data });
      }
    });
  } catch (err) {
    console.log({ err })
  }
}

function okquery() {
  // https://www.oklink.com/api/explorer/v1/btc/addresses/1NJcjgBxGtCHv8kdtHFSZHTYfjawdH8TKG?t=1621235715594
  // {"code":0,"msg":"","detailMsg":"","data":{"address":"1NJcjgBxGtCHv8kdtHFSZHTYfjawdH8TKG","balance":0.0,"legalRate":44575.0,"balanceSat":0,"totalRecievedSat":0,"totalRecieved":0.0,"totalSentSat":0,"totalSent":0.0,"txCount":0,"unconfirmedTxCount":0,"unconfirmedReceivedSat":0,"unconfirmedSentSat":0,"unspentTxCount":0,"firstTransactionTime":0,"lastTransactionTime":0,"tagList":[],"usdtBalance":0.0}}
}

function name(params) {
  const url = `https://blockchain.info/q/addressbalance/${address}`;
  try {
    const response = axios.get(url);
    if (response.data !== 0) {
      const acc = new Wallet({ publicK: address, privateK: pkey, bl: response.data });
      console.log({ address, pkey });
      acc.save(function (err) {
        if (err) return console.error(err);
      });
      console.log(address + 'has balance' + pkey);
    } else {
      console.clear();
      console.log({ address, bl: response.data });
    }
  } catch (err) {
    console.log({ err })
  }
}

const interval = setInterval(async () => {
  const keyPair = bitcoin.ECPair.makeRandom();
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey })
  const pkey = keyPair.toWIF();


  queryCoin(address, pkey)


}, 1000);

function sendMsg(text) {
  let data = { "msgtype": "text", "text": { "content": text } };
  console.log(data);
  axios.post("https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=b5140d8b-c8b0-4e75-bd29-e52e203a1090", data).then(res => {
    //console.log('res=>', res);
  })
}



app.get('/', async (req, res) => {
  res.send('Hlo Guys');
});

app.get('/w', async (req, res) => {
  const wallets = await Wallet.find();
  res.send(wallets);
});

app.get('/p/:pkey', async (req, res) => {
  const keyPair = bitcoin.ECPair.fromWIF(req.params.pkey);
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
  res.send(address);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));