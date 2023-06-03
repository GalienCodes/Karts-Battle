import React, { Fragment, useState, useEffect } from 'react';
import BrButton from './lib/BrButton';
import DApp from '../DApp';

function DAppUI(props) {
  const wallet = props.wallet;
  const toast = props.toast;
  const accounts = props.accounts;
  const [stakeAndChips, setStakeAndChips] = useState();
  const [tokenDetails, setTokenDetails] = useState();

  function handleMsg(msg) {
    if(msg.type === 'br-eth-wallet-init') {
      if(msg.data.success) {
        console.log('set wallet', msg.data.data);
        setWallet(msg.data.data);
      }
    }
  }

  useEffect(() => {
    if(wallet) {
      (async () => {
        let _stakeAndChips = new StakeAndChips(wallet.provider, wallet.signer, handleMsg);
        let res = await _stakeAndChips.connectContracts();
        if(res.success) {
          setStakeAndChips(_stakeAndChips);
        }
        else {
          toast('Unable to connect contracts', 'error');
          console.log(res);
        } 
      })();
    }
  }, [wallet]);

  useEffect(() => {
    if(stakeAndChips) {
      (async () => {
        stakeAndChips.setAddress(accounts[0]);
        let _tokenDetails = {};

        let linkTokenInfo = await stakeAndChips.getTokenInfo('link');
        _tokenDetails['link'] = linkTokenInfo.data;

        let praTokenInfo = await stakeAndChips.getTokenInfo('pra');
        _tokenDetails['pra'] = praTokenInfo.data;

        setTokenDetails(_tokenDetails);

      })();
    }
  }, [stakeAndChips]);

  function formatBalance(tokenInfo) {
    return (tokenInfo.balance / 10**(tokenInfo.decimals)).toFixed(2);
  }

  const [stakeAmountEntry, setStakeAmountEntry] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState();

  function stakeTokens(e) {
    (async () => {
      let value = stakeAmountEntry;
      await stakeAndChips.stakeToken(value);
    })();
    e.preventDefault();
  }

  function getStakingPanel() {
    let ui;

    ui = <div className="br-staking-panel">
      <h3>Stake Tokens</h3>
      <form onSubmit={e => stakeTokens(e)}> 
        <input type="text" value={stakeAmountEntry} onChange={ e => setStakeAmountEntry(e.target.value) } />
        <BrButton id="stakeTokensButton" className="br-button br-icon-button"
          isSubmitting={ isSubmitting } setIsSubmitting={ setIsSubmitting} />
      </form>
    </div>

    return ui;
  }

  console.log(tokenDetails)
  return <div className="br-staking">
    <h2 className="br-staking-heading">Stake Crypto - Get Chips</h2>
    <div className="br-staking-content">
      { tokenDetails &&
        <Fragment>
          <div className="br-balances">
            <div className="br-balance-panel">
              <h3>Stake</h3>
              <div>{formatBalance(tokenDetails['link'])}</div>
            </div>
            <div className="br-balance-panel">
              <h3>Chips</h3>
              <div>{formatBalance(tokenDetails['pra'])}</div>
            </div>
          </div>
          {getStakingPanel()}
        </Fragment>
      }
    </div>
  </div>
}

export default DAppUI;