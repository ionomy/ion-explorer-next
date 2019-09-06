
import Component from '../../core/Component';
import { Link } from 'react-router-dom';
import moment from 'moment';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

import Table from '../Table';

export default class CardTXOut extends Component {
  static defaultProps = {
    tx: {}
  };

  static propTypes = {
    tx: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      cols: [
        { key: 'address', title: 'Address' },
        { key: 'value', title: 'Amount' }
      ]
    };
  };

  render () {
    let isCoinStake = this.props.tx.vin[0].coinstake
    return (
      <Table
        cols={this.state.cols}
        data={this.props.tx.vout.map(vout => {
          if (isCoinStake && vout.address !== 'NON_STANDARD') {
            let voutValue
            if (vout.address === this.props.tx.vin[0].address) {
              voutValue = <div>
                <span className="badge badge-success">STAKE REWARD</span>
                <span className="badge badge-success">
                  {numeral(vout.value).format('0,0.0000')} ION
                   </span>
              </div>
            } else {
              voutValue = <div>
                <span className="badge badge-success">MN REWARD</span>
                <span className="badge badge-success">
                  {numeral(vout.value).format('0,0.0000')} ION
                   </span>
              </div>
            }
            return (
              {
                ...vout,
                address: (
                  <Link to={`/address/${ vout.address }`}>{vout.address}</Link>
                ),
                value: voutValue
              })
          } else {
            return (
              {
                ...vout,
                address: (
                  <Link to={`/address/${ vout.address }`}>{vout.address}</Link>
                ),
                value: (

                  <span className="badge badge-success">
              {numeral(vout.value).format('0,0.0000')} ION
            </span>
                )
              })
          }

        })}/>
    )
  };
}
