
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
  docStatus: { required: false, type: Boolean },
  docTicker: { required: false, type: String },
  docName: { required: false, type: String },
  docChain: { required: false, type: String },
  docSummary: { required: false, type: String },
  docDescription: { required: false, type: String },
  docCreator: { required: false, type: String },
  docContact: { required: false, type: String },
  docHash: {required: false, type:String},
  docSignature: { required: false, type: String },
  verifiedOwner: { required: false, type: Boolean },
  total_amount: { required: false, type: String },
  token_authorities: { required: false, type: String },
}, { versionKey: false }), 'tokens');

module.exports =  Token;
