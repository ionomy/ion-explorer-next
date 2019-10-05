
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import CardTXs from '../component/Card/CardTXs';
import CardTokens from '../component/Card/CardTokens';
import HorizontalRule from '../component/HorizontalRule';
import Pagination from '../component/Pagination';
import Select from '../component/Select';
import CryptoJS from "crypto-js";
import { PAGINATION_PAGE_SIZE } from '../constants';
import SHA256 from 'sha256';
class TokenInfo extends Component {
  static propTypes = {
    setData: PropTypes.func.isRequired,
    getToken: PropTypes.func.isRequired,
    verifyTokenOwner: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.debounce = null;
    this.state = {
      error: null,
      loading: true,
      token: {},
      tokeninfo: {},
      documenthash: "",
      verifiedCreator: false
    };
  };

  extractDocumentInfo(url){
    console.log('extractDocumentInfo');
    fetch(url)
    .then(response => {
      return response.text()
    })
    .then((text) => {
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
      console.log('start , end', start, end);
      if (start >= 0 && end > start){
        let extracted_data = text.substr(start, end - start + 1);
        this.calcHash(extracted_data);
        this.verifyOwner(extracted_data);
      } else {
        this.setState({'documenthash': 'Invalid Document Format!'})
      }
    })
  }

  verifyOwner(msg){
    if (this.state.tokeninfo.creator == "" || this.state.tokeninfo.creator == null || msg.length <= 0){
      return;
    }

    if (this.state.token.signature == undefined || this.state.token.signature == "No Signature")
    {
      return;
    }

    this.props.verifyTokenOwner({message: msg, address: this.state.tokeninfo.creator, signature: this.state.token.signature})
    .then((data) => {
      this.setState({verifiedCreator: data.status});
    });
  }

  stringToAsciiByteArray(str)
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

  reverseByteArray(arrayIn) {
    var result = [];
    for (var i = arrayIn.length-1; i >= 0; i--) {
      result.push(arrayIn[i]);
    }
    return result;
  }

  toHexString(byteArray) {
    return Array.prototype.map.call(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  }

  calcHash(text){
    let bytes = this.stringToAsciiByteArray(text);
    let sha256_value = SHA256(SHA256(bytes,{asBytes:true}),{asBytes:true});
    let reversed = this.reverseByteArray(sha256_value);
    let hash = this.toHexString(reversed);
    this.setState({documenthash: hash});
  }

  componentDidMount() {
    this.props.setData({isToken: true});
    const groupIdentifier = this.props.match.params.hash;
    console.log('groupIdentifier', groupIdentifier);

    this.props.getToken({ groupIdentifier })
    .then((data) => {
        this.setState({tokeninfo: data});
        fetch(data.URL)
        .then(response => {
          return response.json()
        })
        .then(docData => {
          // Work with JSON data here

          if (docData.chain == undefined){
            if (docData[0].chain == undefined){
              this.setState({token: {chain: '', name: '', ticker:'', summary: '', description:'', creator:'', contact:''}});
            } else {
              if (docData[0].chain == undefined || docData[0].name == undefined){
                this.setState({error: -2, token: {name: data.name}}); //document content error
                return;
              }
              if (docData[1] != undefined){
                  docData[0].signature = docData[1];
              } else {
                  docData[0].signature = "No Signature";
              }
              this.setState({token:docData[0]});
            }
            //this.setState({token:{chain: tokeinfo.chain, name:tokeninfo.name, ticker:toekinfo.ticker, summary: tokeninfo.summary, creator:tokeinfo.creator, contact:tokeinfo.contact}});
          }else {
            if (docData.chain == undefined || docData.name == undefined){
              this.setState({error: -2, token: {name: data.name}}); //document content error
              return;
            }
            docData.signature = "No Signature!";
            this.setState({token:docData});
          }

          this.extractDocumentInfo("https://raw.githubusercontent.com/ioncoincore/ATP-descriptions/master/ION-testnet-MAGIC.json");
        })
        .catch(err => {
          this.setState({error: -1, token: {name: data.name}});
        })
    })
    .catch(error => this.setState({ error, loading: false }));
  };

  componentWillUnmount() {

  };

  render() {
    console.log('this.state.token', this.state.token);
    console.log('this.state.tokeninfo', this.state.tokeninfo);
    if (this.state.error == -1){
      return (
        <div>
          <HorizontalRule
            title="Token Info" />
          <div style={{padding:'15px'}}>Token Name: {this.state.token.name}</div>
          <div style={{padding:'15px', color: 'red', textAlign:'center'}}>Invalidate Document URL! Reading Failed!</div>
          <div className="clearfix" />
        </div>
      );
    }

    if (this.state.error == -2){
      return (
        <div>
          <HorizontalRule
            title="Token Info" />
          <div style={{padding:'15px'}}>Token Name: {this.state.token.name}</div>
          <div style={{padding:'15px', color: 'red', textAlign:'center'}}>Invalidate Document Content</div>
          <div className="clearfix" />
        </div>
      );
    }
    console.log('verifiedCreator', this.state.verifiedCreator);
    return (
      <div>
        <HorizontalRule
          title="Token Info" />
        <div style={{padding:'15px'}}>Token Name: {this.state.token.name}</div>
        <div style={{padding:'15px'}}>Token Ticker: {this.state.token.ticker}</div>
        <div style={{padding:'15px'}}>Token Summary: {this.state.token.summary}</div>
        <div style={{padding:'15px'}}>Token Description: {this.state.token.description}</div>
        <div style={{padding:'15px'}}>Token Creator: {this.state.token.creator} ({this.state.tokeninfo.creator})</div>
        <div style={{padding:'15px'}}>Token Creator Verified: {this.state.verifiedCreator? "Verified": "Not Verified"}</div>
        <div style={{padding:'15px'}}>Token Signature: {this.state.token.signature}</div>
        <div style={{padding:'15px'}}>Document Hash: {this.state.documenthash}</div>
        <div style={{padding:'15px'}}>Token Total Amount: {this.state.tokeninfo.total_amount}</div>
        <div style={{padding:'15px'}}>Token Authorities: {this.state.tokeninfo.token_authorities}</div>
        <div className="clearfix" />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  setData: data => Actions.setData(dispatch, data),
  getToken: query => Actions.getToken(query),
  verifyTokenOwner: query => Actions.verifyTokenOwner(query),
});

const mapState = state => ({
  data: state.data
});

export default connect(mapState, mapDispatch)(TokenInfo);
