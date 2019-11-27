
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
    };
  };

  componentDidMount() {
    this.props.setData({isToken: true});
    const groupIdentifier = this.props.match.params.hash;
    console.log('groupIdentifier', groupIdentifier);
    this.props.getToken({ groupIdentifier })
    .then((data) => {
        this.setState({token: data});
    })
    .catch(error => this.setState({ error, loading: false }));
  };

  componentWillUnmount() {

  };

  render() {
    console.log('this.state.token', this.state.token);
    if (this.state.token.docStatus == false){
      return (
        <div>
          <HorizontalRule
            title="Token Info" />
          <div style={{padding:'15px'}}>Token Name: {this.state.token.name}</div>
          <div style={{padding:'15px'}}>Token Ticker: {this.state.token.ticker}</div>
          <div style={{padding:'15px'}}>Token ID: {this.state.token.groupIdentifier}</div>
          <div style={{padding:'15px', color: 'red', textAlign:'center'}}>&#10005; Invalidate Document Content! Reading Failed!</div>
          <div style={{textAlign:'center'}}>Doc URL: <a href={this.state.token.URL} style={{color:'#245498'}}>{this.state.token.URL}</a></div>
          <div className="clearfix" />
        </div>
      );
    }

    return (
      <div>
        <HorizontalRule
          title="Token Info" />
        <div style={{padding:'15px'}}><span style={{fontWeight:'bold'}}>Token Name:</span> {this.state.token.docName}</div>
        <div style={{padding:'15px'}}><span style={{fontWeight:'bold'}}>Token Ticker:</span>  {this.state.token.docTicker}</div>
        <div style={{padding:'15px'}}><span style={{fontWeight:'bold'}}>Token ID:</span>  {this.state.token.groupIdentifier}</div>
        <div style={{padding:'15px'}}><span style={{fontWeight:'bold'}}>Total Token Supply:</span>  {this.state.token.total_amount} {this.state.token.docTicker}</div>
        <div style={{padding:'15px'}}><span style={{fontWeight:'bold'}}>Token Summary:</span>  {this.state.token.docSummary}</div>
        <div style={{padding:'15px'}}><span style={{fontWeight:'bold'}}>Token Description:</span>  {this.state.token.docDescription}</div>
        <div style={{padding:'15px'}}><span style={{fontWeight:'bold'}}>Description Document:</span>
          <a target="_blank" href={this.state.token.URL} style={{paddingLeft: '5px', color:'#245498'}}>{this.state.token.URL}</a> ({this.state.token.docHash})
        </div>
        <div style={{padding:'15px'}}>
          {!this.state.token.verifiedOwner && <span><span style={{fontWeight:'bold', paddingRight:'10px'}}>{this.state.token.docCreator}</span><img src="/img/ticker-not-verfied.png" style={{marginLeft:'5px'}}/> (Not Verified)</span>}
          {this.state.token.verifiedOwner &&  <span>
            <span style={{fontWeight:'bold', paddingRight:'10px'}}>Token Creator:</span>{this.state.token.docCreator}<img src="/img/ticker-verified.png" style={{marginLeft:'5px'}}/>                        
            <p>(<a target="_blank" href={'/#/address/'+this.state.token.creator} style={{paddingLeft:'5px', color:'#245498'}}>
               {this.state.token.creator}
               </a>)</p>
          </span>}
        </div>
        <div style={{padding:'15px'}}><span style={{fontWeight:'bold'}}>Token Signature:</span> {this.state.token.docSignature}</div>
        {/*<div style={{padding:'15px'}}><span style={{fontWeight:'bold'}}>Token Total Amount:</span> {this.state.token.total_amount}</div>
        <div style={{padding:'15px'}}><span style={{fontWeight:'bold'}}>Token Authorities:</span> {this.state.token.token_authorities}</div>*/}
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
