
require('babel-polyfill');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const fetch = require('../lib/fetch');
const locker = require('../lib/locker');
const moment = require('moment');
// Models.
const Coin = require('../model/coin');
const UTXO = require('../model/utxo');

/**
 * Get the coin related information including things
 * like price coinmarketcap.com data.
 */
async function syncCoin() {
  console.log('syncCoin');
  const date = moment().utc().startOf('minute').toDate();
  // Setup the coinmarketcap.com api url.
  //const url = `${ config.coinMarketCap.api }${ config.coinMarketCap.ticker }`;
  const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=1281&CMC_PRO_API_KEY=5ca8732a-1676-4d5b-807b-eae694fee117";
  const info = await rpc.call('getinfo');
  console.log(info);
  const masternodes = await rpc.call('getmasternodecount');
  const nethashps = await rpc.call('getnetworkhashps');
  const utxo = await UTXO.aggregate([
    {$match: {address: {$ne: 'ZERO_COIN_MINT'}}},
    {$match: {address: {$not: /OP_RETURN/}}},
    {$group: {_id: 'supply', total: {$sum: '$value'}}}
  ])

  let market = await fetch(url);
  if (Array.isArray(market)) {
    console.log('array');
    market = market.length ? market['data'] : {};
  }
  if (market.status.error_code == 0){
    market = market['data']['1281'];
  } 
  console.log('utxo',utxo);
  console.log(market);
  const coin = new Coin({
    cap: market.quote.USD.market_cap,
    createdAt: date,
    blocks: info.blocks,
    btc: '0.0000000357',
    diff: info.difficulty,
    mnsOff: masternodes.total - masternodes.stable,
    mnsOn: masternodes.stable,
    netHash: nethashps,
    peers: info.connections,
    status: 'Online',
    supply: info.xIONsupply.total,  //count(utxo) == utxo[0].total + 
    usd: market.quote.USD.price
  });

  await coin.save();
}

/**
 * Handle locking.
 */
async function update() {
  const type = 'coin';
  let code = 0;

  try {
    locker.lock(type);
    console.log('calling syncCoin');
    await syncCoin();
  } catch(err) {
    console.log(err);
    code = 1;
  } finally {
    try {
      locker.unlock(type);
    } catch(err) {
      console.log(err);
      code = 1;
    }
    exit(code);
  }
}

update();
