
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Actions from '../../core/Actions';

export default class TokenModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      decryption: {},
    };
  }

  static propTypes = {
    buttonLabel: PropTypes.string,
    className: PropTypes.string,
  };

  toggle = () => {
    console.log(
      'toggle'
    );
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  };


  render() {
    const { buttonLabel, className, vout} = this.props;
    const { modal, decryption } = this.state;
    console.log('className', className);
    if (className == "description"){      
      return (
        <React.Fragment>
          <span className="link-btn" style={{cursor:'pointer'}} onClick={this.toggle}>{buttonLabel}</span>
          <Modal isOpen={modal} toggle={this.toggle} className={className}>
            <ModalHeader toggle={this.toggle}>
              <div>
                Output
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="row" style={{padding:'10px', fontSize:'12px'}}><span style={{fontWeight:'bold', fontSize:'12px', paddingRight:'5px'}}>Output Type:</span> {vout.tokenOutputType}</div>
              <div className="row" style={{padding:'10px', fontSize:'12px'}}><span style={{fontWeight:'bold', fontSize:'12px', paddingRight:'5px'}}>Ticker:</span> {vout.tokenTicker}</div>
              <div className="row" style={{padding:'10px', fontSize:'12px'}}><span style={{fontWeight:'bold', fontSize:'12px', paddingRight:'5px'}}>Name:</span> {vout.tokenName}</div>
              <div className="row" style={{padding:'10px', fontSize:'12px'}}><span style={{fontWeight:'bold', fontSize:'12px', paddingRight:'5px'}}>Decimal:</span> {vout.tokenDecimalPos}</div>
              <div className="row" style={{padding:'10px', fontSize:'12px'}}><span style={{fontWeight:'bold', fontSize:'12px', paddingRight:'5px'}}>URL:</span> {vout.tokenURL}</div>
              <div className="row" style={{padding:'10px', fontSize:'12px'}}><span style={{fontWeight:'bold', fontSize:'12px', paddingRight:'5px'}}>DocumentHash:</span> {vout.tokenDocHash}</div>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={this.toggle}>Close</Button>
            </ModalFooter>
          </Modal>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <span className="link-btn" style={{cursor:'pointer'}} onClick={this.toggle}>{buttonLabel}</span>
          <Modal isOpen={modal} toggle={this.toggle} className={className}>
            <ModalHeader toggle={this.toggle}>
              <div>
                Output
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="row" style={{padding:'10px', fontSize:'12px'}}><span style={{fontWeight:'bold', fontSize:'12px', paddingRight:'5px'}}>Output Type:</span> {vout.tokenOutputType}</div>
              <div className="row" style={{padding:'10px', fontSize:'12px'}}><span style={{fontWeight:'bold', fontSize:'12px', paddingRight:'5px'}}>Ticker:</span> {vout.tokenTicker}</div>
              <div className="row" style={{padding:'10px', fontSize:'12px'}}><span style={{fontWeight:'bold', fontSize:'12px', paddingRight:'5px'}}>Authorities:</span> {vout.tokenAuthorities}</div>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={this.toggle}>Close</Button>
            </ModalFooter>
          </Modal>
        </React.Fragment>
      );
    }

  };
}
