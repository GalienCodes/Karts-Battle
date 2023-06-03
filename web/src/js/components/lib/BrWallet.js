import React, { Fragment, useState, useEffect } from 'react';
import { result, cloneObj } from '../../helpers/helpers';
import BrButton from './BrButton';
import connect from './BrConnect';

function BrWallet(props) {
  const toast = props.toast;
  const [isConnecting, setIsConnecting] = useState();
  const [isConnected, setIsConnected] = useState();

  function handleMsg(msg) {
    if(!msg.success && msg.reason === 'error-no-ethereum') {
      toast(<div>This browser has no ethereum<br />Try MetaMask!</div>);
    }
    else {
      if(msg.method === 'receiveData') {
      }
      if(msg.method === 'requestAccounts') {
        if(msg.success) {
          toast(<div>Ethereum is connected!!<div className="er-break-long-word">{JSON.stringify(msg.data)}</div></div>);
        }
        else {
          if(msg.reason === 'error-user-rejected') {
            toast('Please connect with MetaMask');
          }
          else {
            toast('Error connecting to ethereum');
            console.error(msg);
          }
        }
      }
      else if(msg.type === 'accountsChanged' && msg.success) {
        let accounts = msg.data;
        toast(<div>Received account changed message</div>);
      }
      else {
        console.log('Unhandled message (just letting you know)', msg);
      }
    }
  }

  function connectNEAR() {

  }

  return (
    <Fragment>
      <BrButton label="Connect" id="connectEthereum" className="br-button br-icon-button"
      onClick={connectNEAR} isSubmitting={ isConnecting } setIsSubmitting={ setIsConnecting}
      disabledLabel={ isConnected ? 'Connected' : ''}
      handleMsg={handleMsg} />
    </Fragment>
  );
}

export default BrWallet;