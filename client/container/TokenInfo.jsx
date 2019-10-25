
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
          <div style={{padding:'15px', color: 'red', textAlign:'center'}}>Invalidate Document Content! Reading Failed!</div>
          <div className="clearfix" />
        </div>
      );
    }

    return (
      <div>
        <HorizontalRule
          title="Token Info" />
        <div style={{padding:'15px'}}>Token Name: {this.state.token.docName}</div>
        <div style={{padding:'15px'}}>Token Ticker: {this.state.token.docTicker}</div>
        <div style={{padding:'15px'}}>Token Summary: {this.state.token.docSummary}</div>
        <div style={{padding:'15px'}}>Token Description: {this.state.token.docDescription}</div>
        <div style={{padding:'15px'}}>Token Creator: {this.state.token.docCreator} ({this.state.token.creator})</div>
        <div style={{padding:'15px'}}>Token Creator Verified: 
	    {this.state.token.verifiedOwner && <div style={{display:'inline', padding:'10px', fontWeight:'bold'}}><img src="/img/ticker-verified.png"/> Verified</div>}
	    {!this.state.token.verifiedOwner && <div style={{display:'inline', padding:'10px', fontWeight:'bold'}}><img src="/img/ticker-not-verfied.png"/> Not Verified</div>}
	</div>
        <div style={{padding:'15px'}}>Token Signature: {this.state.token.docSignature}</div>
        <div style={{padding:'15px'}}>Document Hash: {this.state.token.docHash}</div>
        <div style={{padding:'15px'}}>Token Total Amount: {this.state.token.total_amount}</div>
        <div style={{padding:'15px'}}>Token Authorities: {this.state.token.token_authorities}</div>
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
