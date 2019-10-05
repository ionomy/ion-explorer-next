
/**
 * Web Worker
 * Handles the requesting of data in a separate thread
 * to prevent UI pausing.
 */

/**
 * Global configuration object.
 */
require('babel-polyfill');
const Promise = require('bluebird');
const config = require('../config');
const fetch = require('./fetch');

const api = `${ config.api.host }:${ config.api.port }${ config.api.prefix }`;

// Get the address and all transactions related.
const verifyTokenOwner = query => fetch(`${ api }/verifyTokenOwner`, query);
const getAddress = ({ address, ...query}) => fetch(`${ api }/address/${ address }`, query);
const getToken = ({ groupIdentifier, ...query}) => fetch(`${ api }/token/${ groupIdentifier }`, query);
// Get the block and transactions.
const getBlock = query => fetch(`${ api }/block/${ query }`);

// Request the coins.
const getCoins = async (query) => {
  try {
    console.log(`${ api }/coin/history`, query);
    const coins = await fetch(`${ api }/coin/history`, query);
    const avgBlockTime = await fetch(`${ api}/block/average`);
    const avgMNTime = await fetch(`${ api }/masternode/average`);

    return Promise.resolve(coins.map(c => ({ ...c, avgBlockTime, avgMNTime })));
  } catch(err) {
    console.log('fetch.worker ERROR:', err);
    return Promise.reject(err);
  }
};

// Request the coins for a week.
const getCoinsWeek = query => fetch(`${ api }/coin/week`, query);

// Check if hash is a block.
const getIsBlock = query => fetch(`${ api }/block/is/${ query }`);

// Request the list of masternodes.
const getMNs = query => fetch(`${ api }/masternode`, query);

// Request the list of connected peers.
const getPeers = () => fetch(`${ api }/peer`);

// Get transaction by its hash.
const getTX = query => fetch(`${ api }/tx/${ query }`);

// Request the transactions.
const getTXs = query => fetch(`${ api }/tx`, query);

// Request the transactions.
const getTokens = query => fetch(`${ api }/tokens`, query);

// Request the transactions for a week.
const getTXsWeek = query => fetch(`${ api }/tx/week`, query);

// Request the latest transactions.
const getTXsLatest = query => fetch(`${ api }/tx/latest`, query);

// Handle incoming messages.
self.addEventListener('message', (ev) => {
  let action = null;
  switch (ev.data.type) {
    case 'address':
      action = getAddress;
      break;
    case 'block':
      action = getBlock;
      break;
    case 'coins':
      action = getCoins;
      break;
    case 'coins-week':
      action = getCoinsWeek;
      break;
    case 'is-block':
      action = getIsBlock;
      break;
    case 'peers':
      action = getPeers;
      break;
    case 'mns':
      action = getMNs;
      break;
    case 'tx':
      action = getTX;
      break;
    case 'txs':
      action = getTXs;
      break;
    case 'txs-latest':
      action = getTXsLatest;
      break;
    case 'txs-week':
      action = getTXsWeek;
      break;
    case 'tokens':
      action = getTokens;
      break;
    case 'token':
      action = getToken;
      break;
    case 'verifyTokenOwner':
      action = verifyTokenOwner;
      break;
  }

  const wk = self;
  if (!action) {
    return wk.postMessage({ error: new Error('Type not found!') });
  }

  action(ev.data.query)
    .then((data) => {
      return wk.postMessage({ data, type: ev.data.type });
    })
    .catch((err) => {
      return wk.postMessage({ ...err, type: ev.data.type });
    });
});
