
require('babel-polyfill');
require('../lib/cron');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
//const fetch = require('../lib/fetch');
const isofetch = require('isomorphic-fetch');
const { forEach } = require('p-iteration');
const locker = require('../lib/locker');
const moment = require('moment');
const SHA256 = require('sha256');
// Models.
const Token = require('../model/token');

/**
 * Get a list of the mns and request IP information
 * from freegeopip.net.
 */
 function stringToAsciiByteArray(str)
 {
     var bytes = [];
    for (var i = 0; i < str.length; ++i)
    {
        var charCode = str.charCodeAt(i);
       if (charCode > 0xFF)  // char > 1 byte since charCodeAt returns the UTF-16 value
       {
           throw new Error('Character ' + String.fromCharCode(charCode) + ' can\'t be represented by a US-ASCII byte.');
       }
        bytes.push(charCode);
    }
     return bytes;
 }

 function reverseByteArray(arrayIn) {
   var result = [];
   for (var i = arrayIn.length-1; i >= 0; i--) {
     result.push(arrayIn[i]);
   }
   return result;
 }

 function toHexString(byteArray) {
   return Array.prototype.map.call(byteArray, function(byte) {
     return ('0' + (byte & 0xFF).toString(16)).slice(-2);
   }).join('');
 }

 function calcHash(text){
   let bytes = stringToAsciiByteArray(text);
   let sha256_value = SHA256(SHA256(bytes,{asBytes:true}),{asBytes:true});
   let reversed = reverseByteArray(sha256_value);
   let hash = toHexString(reversed);
   return hash;
 }


function ValidateDocument(docData){
  if (docData.length == 2){
    if (docData[0].chain == undefined || docData[0].ticker == undefined || docData[0].name == undefined ||
      docData[0].summary == undefined || docData[0].description == undefined || docData[0].creator == undefined
      || docData[0].contact == undefined || docData[0].contact.email == undefined){
      return null;
    } else {
        return docData;
    }
  } else {
    return null;
  }
}

function extractMainPartFromDoc(text){
  let start=-1, end=-1;
  let a = 0;
  for (let i=0; i < text.length; i++){
    if (text[i] == '{' && start == -1){
      start = i;
    }

    if (text[i] == '{'){
        a++;
    }

    if (text[i] == '}' && start != -1){
      a--;
      if (a == 0){
        end = i;
      }

    }
  }
  if (start >= 0 && end > start){
    const extracted_data = text.substr(start, end - start + 1);
    return extracted_data;
  } else {
    return null;
  }
}

function getDocumentHash(text){
  let extracted_data = extractMainPartFromDoc(text);
  if (extracted_data){
    return calcHash(extracted_data);
  } else {
    return null;
  }
}

async function getVerified(url, creator, signature){
  const res = await fetch("http://178.63.71.35:8000/verifymessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "url": url,
      "creator": creator,
      "signature": signature
    })
  });
  const result = await res.json();
  return result.res;
}

async function syncTokens() {
  const date = moment().utc().startOf('minute').toDate();
  // Increase the timeout for masternode.
  rpc.timeout(10000); // 10 secs

  const tokens = await rpc.callForToken('tokeninfo', ["all", "true"]);
  const inserts = [];
  if (tokens == null) return;
  for (let i=0; i<tokens.length; i++){
    let tk = tokens[i];
    const scaninfo = await rpc.callForToken('scantokens', ["start", tk.groupID]);
    let total_amount = "";
    let token_authorities = "";
    if (scaninfo != null){
      total_amount = scaninfo.total_tokenAmount;
      token_authorities = scaninfo.total_groupAuthorities;
    }
    const token = new Token({
      txid: tk.creation.txid,
      creator: tk.creation.address,
      groupIdentifier: tk.groupID,
      decimalPos: tk.decimalPos,
      name: tk.name,
      ticker: tk.ticker,
      URL: tk.URL,
      total_amount: total_amount,
      token_authorities: token_authorities,
      docStatus: false,
      docChain: "",
      docCreator: "",
      docContact: "",
      docName: "",
      docSummary: "",
      docDescription: "",
      docTicker: "",
      docSignature: "",
      docHash: tk.documentHash,
      verifiedOwner: false
    });

    try {
      let response = await fetch(token.URL);
      console.log('response');
      let res = await response.json();
      const docData = ValidateDocument(res);
      if (docData){
        token.docChain = docData[0].chain;
        token.docCreator = docData[0].creator;
        token.docContact = docData[0].contact.email;
        token.docName = docData[0].name;
        token.docSummary = docData[0].summary;
        token.docDescription = docData[0].description;
        token.docTicker = docData[0].ticker;
        token.docSignature = docData[1];
        token.docStatus = true;

        let responsefortext = await fetch(token.URL);
        let textData = await responsefortext.text();
        //const docHash = getDocumentHash(textData);
        //console.log('docHash', docHash);
        //if (docHash){
         // token.docHash = docHash;
        //}
        if (token.docCreator != "" && token.docSignature != ""){

          const res = await getVerified(token.URL, token.creator, token.docSignature);
          if (res == true){
            token.verifiedOwner = res;
          }
        }
      }
    } catch(err) {
      console.log(tk.URL, err);
    }
    inserts.push(token);
  }
  console.log('---------------------------------------------------');
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
    await Token.remove({});
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
