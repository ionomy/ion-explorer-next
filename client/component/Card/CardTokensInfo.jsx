
import Component from '../../core/Component';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';
import CountUp from '../CountUp';

export default class CardTokensInfo extends Component {
  static defaultProps = {
    avgBlockTime: 90,
    avgMNTime: 24,
    blocks: 0,
    peers: 0,
    status: 'Offline',
    supply: 0
  };

  static propTypes = {
    avgBlockTime: PropTypes.number.isRequired,
    avgMNTime: PropTypes.number.isRequired,
    blocks: PropTypes.number.isRequired,
    peers: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    supply: PropTypes.number.isRequired
  };

  render() {
    const isOn = this.props.status === 'Online';

    return (
      <div className="animated fadeInUp">
      <Card title="Active Tokens" className="card--status" >
        <div className="card__row">
          <span className="card__label">Token system:</span>
          <span className="card__result card__result--status">
            <span className={ `u--text-${ isOn ? 'green' : 'red' }`}>
              { this.props.status }
            </span>
          </span>
        </div>
        <div className="card__row">
          <span className="card__label">Total TOken system:</span>
          <span className="card__result">
            <Link to={ `/block/${ this.props.blocks }` }>
              <b>
                <CountUp
                  decimals={ 0 }
                  duration={ 1 }
                  end={ this.props.blocks }
                  start={ 0 } />
              </b>
            </Link>
          </span>
        </div>
        <div className="card__row">
          <span className="card__label">XDM Current Fee:</span>
          <span className="card__result">
              <b>
                <CountUp
                  decimals={ 4 }
                  duration={ 1 }
                  end={ this.props.supply }
                  start={ 0 } />
              </b>
          </span>
        </div>
        <div className="card__row">
          <span className="card__label">ATOM Current Fee:</span>
          <span className="card__result">
            <Link to="/peer">{ this.props.peers }</Link>
          </span>
        </div>
      </Card>
      </div>
    );
  };
}
