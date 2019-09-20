
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

import { PAGINATION_PAGE_SIZE } from '../constants';

class TokenInfo extends Component {
  static propTypes = {
    setData: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.debounce = null;
    this.state = {
      error: null,
      loading: true,
      pages: 0,
      page: 1,
      size: 10,
      tokens: [],
      token: {},
    };
  };

  componentDidMount() {
    this.props.setData({isToken: true});
    fetch('https://raw.githubusercontent.com/ioncoincore/ATP-descriptions/master/ION-testnet-XDM.json')
    .then(response => {
      return response.json()
    })
    .then(data => {
      // Work with JSON data here
      console.log(data)
      if (data.chain == undefined){
        if (data[0].chain == undefined){
          this.setState({token: {chain: '', name: '', ticker:'', summary: '', description:'', creator:'', contact:''}});
        } else {
          this.setState({token:data[0]});
        }
        //this.setState({token:{chain: tokeinfo.chain, name:tokeninfo.name, ticker:toekinfo.ticker, summary: tokeninfo.summary, creator:tokeinfo.creator, contact:tokeinfo.contact}});
      }else {
        this.setState({token:data});
      }
    })
    .catch(err => {
      // Do something for an error here
    })
  };

  componentWillUnmount() {

  };

  render() {
    console.log('this.state.token', this.state.token);
    return (
      <div>
        <HorizontalRule
          title="Token Info" />
        <div style={{padding:'15px'}}>Token Name: {this.state.token.name}</div>
        <div style={{padding:'15px'}}>Token Ticker: {this.state.token.ticker}</div>
        <div style={{padding:'15px'}}>Token Summary: {this.state.token.summary}</div>
        <div style={{padding:'15px'}}>Token Description: {this.state.token.description}</div>
        <div style={{padding:'15px'}}>Token Creator: {this.state.token.creator}</div>
        <div className="clearfix" />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  setData: data => Actions.setData(dispatch, data)
});

const mapState = state => ({
  data: state.data
});

export default connect(mapState, mapDispatch)(TokenInfo);
