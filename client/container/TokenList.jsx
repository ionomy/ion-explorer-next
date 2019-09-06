
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

class TokenList extends Component {
  static propTypes = {
    getTokens: PropTypes.func.isRequired,
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
    };
  };

  componentDidMount() {
    this.props.setData({isToken: true});
    this.getTokens();
  };

  componentWillUnmount() {
    if (this.debounce) {
      clearTimeout(this.debounce);
      this.debounce = null;
    }
  };

  getTokens = () => {
    this.setState({ loading: true }, () => {
      if (this.debounce) {
        clearTimeout(this.debounce);
      }

      this.debounce = setTimeout(() => {
        this.props
          .getTokens({
            limit: this.state.size,
            skip: (this.state.page - 1) * this.state.size
          })
          .then(({ pages, tokens }) => {
            if (this.debounce) {
              this.setState({ pages, tokens, loading: false });
            }
          })
          .catch(error => this.setState({ error, loading: false }));
      }, 800);
    });
  };

  handlePage = page => this.setState({ page }, this.getTokens);

  handleSize = size => this.setState({ size, page: 1 }, this.getTokens);

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }
    const selectOptions = PAGINATION_PAGE_SIZE;

    const select = (
      <Select
        onChange={ value => this.handleSize(value) }
        selectedValue={ this.state.size }
        options={ selectOptions } />
    );

    return (
      <div>
        <HorizontalRule
          select={ select }
          title="Tokens" />
        <CardTokens tokens={ this.state.tokens } />
        <Pagination
          current={ this.state.page }
          className="float-right"
          onPage={ this.handlePage }
          total={ this.state.pages } />
        <div className="clearfix" />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getTokens: query => Actions.getTokens(null, query),
  setData: data => Actions.setData(dispatch, data)
});

const mapState = state => ({
  data: state.data
});

export default connect(mapState, mapDispatch)(TokenList);
