
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

  const tokens = await rpc.call('tokeninfo', ["all"]);
  const inserts = [];
  await forEach(tokens, async (tk) => {
    const token = new Token({
      txid: tk.txid,
      groupIdentifier: tk.groupIdentifier,
      decimalPos: tk.decimalPos,
      name: tk.name,
      ticker: tk.ticker,
      URL: tk.URL,
    });

    inserts.push(token);
  });

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
