
const mongoose = require('mongoose');

/**
 * Masternode
 *
 * Connected masternode to the network.
 */
const Token = mongoose.model('Token', new mongoose.Schema({
  __v: { select: false, type: Number },
  txid: { index: true, required: true, type: String },
  creator: {type: String},
  groupIdentifier: { index: true, required: true, type: String },
  decimalPos: { required: false, type: Number },
  name: { required: false, type: String },
  ticker: { required: false, type: String },
  URL: { required: false, type: String },
  total_amount: { required: false, type: String },
  token_authorities: { required: false, type: String },
}, { versionKey: false }), 'tokens');

module.exports =  Token;
