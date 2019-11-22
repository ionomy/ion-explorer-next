
require('babel-polyfill');
const blockchain = require('../lib/blockchain');
const { exit, rpc } = require('../lib/cron');
const { forEachSeries } = require('p-iteration');
const locker = require('../lib/locker');
const util = require('./util');
// Models.
const Block = require('../model/block');
const TX = require('../model/tx');
const UTXO = require('../model/utxo');
const STXO = require('../model/stxo');

/**
 * Process the blocks and transactions.
 * @param {Number} start The current starting block height.
 * @param {Number} stop The current block height at the tip of the chain.
 */
async function syncBlocks(start, stop, clean = false) {
  if (clean) {
    await Block.remove({ height: { $gte: start, $lte: stop } });
    await TX.remove({ blockHeight: { $gte: start, $lte: stop } });
    await UTXO.remove({ blockHeight: { $gte: start, $lte: stop } });
    await STXO.remove({ blockHeight: { $gte: start, $lte: stop } });
  }

  for(let height = start; height <= stop; height++) {
    const hash = await rpc.call('getblockhash', [height]);
    const rpcblock = await rpc.call('getblock', [hash]);

    const block = new Block({
      hash,
      height,
      bits: rpcblock.bits,
      confirmations: rpcblock.confirmations,
      createdAt: new Date(rpcblock.time * 1000),
      diff: rpcblock.difficulty,
      merkle: rpcblock.merkleroot,
      nonce: rpcblock.nonce,
      prev: rpcblock.prevblockhash ? rpcblock.prevblockhash : 'GENESIS',
      size: rpcblock.size,
      txs: rpcblock.tx ? rpcblock.tx : [],
      ver: rpcblock.version
    });

    await block.save();

    await forEachSeries(block.txs, async (txhash) => {
      var rpctx = await util.getTX(txhash);
      if (blockchain.isTokenTransaction(rpctx)){
        rpctx = await util.getTokenTx(txhash);
      }

      if (blockchain.isPoS(block)) {
        await util.addPoS(block, rpctx);
      } else {
        await util.addPoW(block, rpctx);
      }
    });

    console.log(`Height: ${ block.height } Hash: ${ block.hash }`);
  }
}

function hexToString(hexx) {
  var hex = hexx.toString()//force conversion
  var str = ''
  for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
  return str
}

/**
 * Handle locking.
 */
async function update() {
  await syncBlocks(1330566, 1330567, true);
  //var str = "6a0438564c05054d41474943054d616769630204003468747470733a2f2f696f6e636f696e2e6f72672f4154502d64657363726970746f72732f746f6b656e2d4d414749432e6a736f6e208b7bab2b801a3edba3bf356e4e10ae2026bcc4ec7afb8deddc149840736c913f";
  //console.log(hexToString(str));
  exit(0);
}

update();
