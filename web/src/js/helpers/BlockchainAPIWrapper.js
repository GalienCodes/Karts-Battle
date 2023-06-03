import { getChainInfo } from './wallet';
import { createSuccessInfo, createErrorInfo, result, cloneObj } from './helpers';

/**
 * This class contains a wrapper around ethers and window.ethereum.
 */
 class BlockchainAPIWrapper {
  /**
   * 
   * An event listener callback can be passed to trigger updates.
   * 
   * The event listener will be passed an object as its only parameter.
   *  
   * this.eventListener({ method, type, success, reason, data });
   * 
   * E.g. 
   * 
   * this._triggerEvent('requestAccounts', 'connect', accounts);
   * 
   * This example will send an event from the requestAccounts service method, it happened
   * in the "connect" part of the process. accounts is an array of eth accounts
   * 
   * @param {function} eventListener  
   */
  constructor(provider, signer, eventListener) {
    this.eventListener = eventListener;
    this.provider = provider;
    this.signer = signer;
    this.attachEventHandlers();
  }

  checkEthStatus() {
    let success = true;
    let reason = 'ok';
    let message = '';
    let code = 0;

    if(!window.ethereum) {
      success = false;
      reason = 'error-no-ethereum';
      this._triggerEvent('checkEthStatus', '', {}, success, reason);
    }
    else if(!this.provider || !this.signer) {
      success = false;
      reason = 'error-no-ethers-init';
      this._triggerEvent('checkEthStatus', '', {}, success, reason);
    }

    return { success, reason, message, code };
  }

  async requestAccounts() {
    let { success, reason, message, code } = this.checkEthStatus();
    let accounts = [];

    if(success) {
      try {
        this._triggerEvent('requestAccounts', 'connect', accounts);
      }
      catch(e) {
        success = false;
        reason = 'error-eth-rpc';
        message = e.message;
        code = e.code;

        if (e.code === 4001) {
          this._triggerEvent('requestAccounts', 'connect', e, false, 'error-user-rejected');
        } 
        else {
          this._triggerEvent('requestAccounts', 'connect', e, false, 'error-connection-error');
        }

        console.log(e);
      }
    }

    return result(success, reason, code, message, accounts);
  }

  async getConnectedChainInfo() {
    let { success, reason, message, code } = this.checkEthStatus();
    let chainInfo = {};
  
    if(success) {
      try {
      }
      catch(e) {
        ({ success, reason, message, code} = createErrorInfo('error-ethers', e.code, e.messsage));
        console.log(e);
      }
    }
  
    return result(success, reason, code, message, chainInfo);
  }

  _triggerEvent(method, type, data={}, success=true, reason='ok') {
    if(this.eventListener) {
      this.eventListener({ method, type, success, reason, data });
    }
  }
}

export default BlockchainAPIWrapper;