
require('babel-polyfill');
require('../lib/cron');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const fetch = require('../lib/fetch');
const { forEach } = require('p-iteration');
const locker = require('../lib/locker');
const moment = require('moment');
// Models.
const Token = require('../model/token');

/**
 * Get a list of the mns and request IP information
 * from freegeopip.net.
 */
async function syncTokens() {
  const date = moment().utc().startOf('minute').toDate();

  await Token.remove({});

  // Increase the timeout for masternode.
  rpc.timeout(10000); // 10 secs

  const tokens = await rpc.call('tokeninfo', ["all", "true"]);
  const inserts = [];
  for (let i=0; i<tokens.length; i++){
    let tk = tokens[i];
    console.log('tk.groupIdentifier', tk.groupIdentifier);
    const scaninfo = await rpc.callForToken('scantokens', ["start", tk.groupIdentifier]);
    let total_amount = "";
    let token_authorities = "";
    if (!scaninfo.hasOwnProperty('error')){
      total_amount = scaninfo.total_amount;
      token_authorities = scaninfo.token_authorities;
    }
    console.log('total_amount', total_amount);
    console.log('token_authorities', token_authorities);
    const token = new Token({
      txid: tk.creation.txid,
      creator: tk.creation.address,
      groupIdentifier: tk.groupIdentifier,
      decimalPos: tk.decimalPos,
      name: tk.name,
      ticker: tk.ticker,
      URL: tk.URL,
      total_amount: total_amount,
      token_authorities: token_authorities
    });
    inserts.push(token);
  }
  console.log(inserts);
  // await forEach(tokens, async (tk) => {
  //   const scaninfo = await rpc.call('scantokens', ["start", tk.groupIdentifier]);
  //   const token = new Token({
  //     txid: tk.creation.txid,
  //     creator: tk.creation.address,
  //     groupIdentifier: tk.groupIdentifier,
  //     decimalPos: tk.decimalPos,
  //     name: tk.name,
  //     ticker: tk.ticker,
  //     URL: tk.URL,
  //     total_amount: scaninfo.total_amount,
  //     token_authorities: scaninfo.token_authorities
  //   });
  //   inserts.push(token);
  // });

  if (inserts.length) {
    await Token.insertMany(inserts);
  }
}

/**
 * Handle locking.
 */
async function update() {
  const type = 'tokens';
  let code = 0;

  try {
    locker.lock(type);
    await syncTokens();
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
