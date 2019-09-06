
import Component from '../../core/Component';
import { date24Format } from '../../../lib/date'
import { Link } from 'react-router-dom';
import moment from 'moment';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import Table from '../Table';

export default class CardTokens extends Component {
  static defaultProps = {
    tokens: []
  };

  static propTypes = {
    tokens: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      cols: [
        { key: 'name', title: 'Token Name' },
        { key: 'ticker', title: 'Token Ticker' },
        { key: 'decimalPos', title: 'Decimal' },
        { key: 'groupIdentifier', title: 'Group Identifier' },
        { key: 'URL', title: 'Url' },
      ]
    };
  };

  render() {
    return (
      <Table
        cols={ this.state.cols }
        data={ this.props.tokens.map(token => {
          return ({
            ...token,
            name: (
              <Link to={ `/token/${ token.groupIdentifier }` }>
                { token.name }
              </Link>
            ),
            ticker: token.ticker,
            decimalPos: token.decimalPos,
            groupIdentifier: (
              <Link to={ `/token/${ token.groupIdentifier }` }>
                { token.groupIdentifier.substring(0, 20) }...
              </Link>
            ),
            URL: (
              <Link to={ `/token/${ token.url }` }>
                { token.URL.substring(0, 20) }...
              </Link>
            ),
          });
        }) } />
    );
  };
}
