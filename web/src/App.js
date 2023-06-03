/* global BigInt */
import { useState, useEffect, useCallback, Fragment } from 'react';
import Logo from './images/near-karts-1.png';
import * as Tone from 'tone';
import './scss/styles.scss';
import { toast as toasty } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as nearAPI from 'near-api-js';
import BrButton from './js/components/lib/BrButton';
import { initNear } from './js/helpers/near';
import { localLog } from './js/helpers/helpers';
import NearKarts from './js/components/NearKarts';
import getText from './data/world/text';
import bigInt from 'big-integer';
import Modal from 'react-modal';
import gameConfig from './data/world/config';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const baseImageURL =
  'https://storage.googleapis.com/birdfeed-01000101.appspot.com/strange-juice-1/';
const TOAST_TIMEOUT = 4000;
const NEAR_ENV = 'testnet';
const BOATLOAD_OF_GAS = '300000000000000';

const nearkartsAddress = 'nearkarts1.muhindogalien.testnet';
const nearContractConfig = {
  [nearkartsAddress]: {
    viewMethods: [
      'nft_tokens_for_owner',
      'near_kart_get_config',
      'nft_get_token_metadata',
      'get_num_karts',
      'get_token_id_by_index',
      'get_last_battle',
    ],
    changeMethods: ['nft_mint', 'upgrade', 'game_simple_battle'],
  },
};

const MS_IN_DAY = 86400000;
const MS_IN_MONTH = MS_IN_DAY * 30;

const screens = {
  GARAGE: 1,
  BATTLE_SETUP: 2,
  BATTLE: 3,
};

const highScoreModes = {
  DAILY: 1,
  MONTHLY: 2,
};

const helpModes = {
  INTRO: 1,
  BATTLE: 2,
};

const GRAPH_API =
  'https://api.thegraph.com/subgraphs/name/muhindo-galien/near-karts';
const client = new ApolloClient({
  uri: GRAPH_API,
  cache: new InMemoryCache(),
});

function App() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showingHighScores, setShowingHighScores] = useState(false);
  const [highScoreMode, setHighScoreMode] = useState(highScoreModes.DAILY);
  const [highScoreData, setHighScoreData] = useState([]);
  const [helpMode, setHelpMode] = useState(helpModes.INTRO);
  const [contract, setContract] = useState();
  const [currentUser, setCurrentUser] = useState();
  const [nearConfig, setNearConfig] = useState();
  const [nearProvider, setNearProvider] = useState();
  const [wallet, setWallet] = useState();
  const [walletSignedIn, setWalletSignedIn] = useState(true);
  const [nftContract, setNFTContract] = useState();
  const [tokensLoaded, setTokensLoaded] = useState(true);
  const [nftList, setNFTList] = useState([]);
  const [nftData, setNFTData] = useState({});
  const [nftMetadata, setNFTMetadata] = useState({});
  const [activeTokenId, setActiveTokenId] = useState();
  const [activeKart, setActiveKart] = useState('');
  const [processingActions, setProcessingActions] = useState({});
  const [battleResult, setBattleResult] = useState({});
  const [battleKarts, setBattleKarts] = useState([]);
  const [battleConfig, setBattleConfig] = useState({});
  const [lastBattle, setLastBattle] = useState({});
  const [screen, setScreen] = useState(screens.GARAGE);

  function toast(message, type = 'info') {
    toasty[type](message, {
      position: 'top-right',
      autoClose: TOAST_TIMEOUT,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark',
    });
  }

  function doubleToast(message1, message2, type = 'info') {
    toast(
      <Fragment>
        <div>{message1}</div>
        <div>{message2}</div>
      </Fragment>,
      type
    );
  }

  useEffect(() => {
    if (showingHighScores) {
      let period = 0;
      let highScoreEntity;

      if (highScoreMode === highScoreModes.DAILY) {
        period = Math.floor(new Date().getTime() / MS_IN_DAY);
        highScoreEntity = 'scoreDailies';
      } else {
        period = Math.floor(new Date().getTime() / MS_IN_MONTH);
        highScoreEntity = 'scoreMonthlies';
      }

      const q = `
        query($period: BigInt) {
          ${highScoreEntity}( orderBy: numWins, orderDirection:desc, where: { period: $period}, first: 10) {
            id
            period
            numWins
            numLosses
            nearKart {
              id
              name
              media,
              ownerId
            }
          }
        }
    `;

      client
        .query({ query: gql(q), variables: { period } })
        .then((data) => {
          if (data.data) {
            let _highScoreData = [];

            if (highScoreMode === highScoreModes.DAILY) {
              _highScoreData = data.data.scoreDailies;
            } else {
              _highScoreData = data.data.scoreMonthlies;
            }

            setHighScoreData(_highScoreData);
          }
        })
        .catch((err) => {
          console.log('Error fetching data: ', err);
        });
    }
  }, [showingHighScores, highScoreMode]);

  const connect = useCallback(async () => {
    (async () => {
      localLog('connecting');
      try {
        let { currentUser, nearConfig, walletConnection, provider } =
          await initNear(NEAR_ENV, '.muhindogalien.testnet');

        setContract(contract);
        setCurrentUser(currentUser);
        setNearConfig(nearConfig);
        localLog('wallet', walletConnection);
        setWallet(walletConnection);
        setNearProvider(provider);
      } catch (e) {
        doubleToast(
          getText('error_chain_unavailable'),
          getText('text_try_later'),
          'error'
        );
        console.log(e);
      }
    })();
  }, [contract]);

  useEffect(() => {
    connect();
  }, [connect]);

  const connectNFT = useCallback(
    async (contractAddress) => {
      const { viewMethods, changeMethods } =
        nearContractConfig[contractAddress];
      const _nftContract = await new nearAPI.Contract(
        wallet.account(),
        contractAddress,
        {
          viewMethods,
          changeMethods,
          sender: wallet.getAccountId(),
        }
      );

      setNFTContract(_nftContract);
    },
    [wallet]
  );

  useEffect(() => {
    if (wallet && wallet?.isSignedIn()) {
      connectNFT(nearkartsAddress);
    }
  }, [wallet, connectNFT]);

  function getTextureURL(element, style) {
    if (!style) style = 0;
    let url = baseImageURL + `set-1-${element}-${style}.png`;
    return url;
  }

  function getIconURL(element, style = '1') {
    let url = baseImageURL + `icons-1-${element}-${style}.png`;
    return url;
  }

  function getImageURL(cid) {
    let imageURL = cid;
    if (!cid.startsWith('http')) {
      imageURL = `https://storage.googleapis.com/near-karts/${cid}.png`;
    }
    return imageURL;
  }

  const signIn = () => {
    if (wallet?.isSignedIn()) {
      (async () => {
        wallet.signOut();
        setNFTData({});
        setNFTList([]);
        setActiveTokenId(0);
        setWalletSignedIn(false);
      })();
    } else {
      const { changeMethods } = nearContractConfig[nearkartsAddress];

      wallet.requestSignIn(
        { contractId: nearkartsAddress, methodNames: changeMethods }, //contract requesting access
        'NEAR Karts', //optional name
        null, //optional URL to redirect to if the sign in was successful
        null //optional URL to redirect to if the sign in was NOT successful
      );
      setWallet(wallet);
    }
  };

  async function execute(action, data) {
    if (!processingActions[action]) {
      let _processingActions = { ...processingActions };
      _processingActions[action] = true;
      setProcessingActions(_processingActions);
      let reloadTokens = false;

      let nearPenny = bigInt(10).pow(bigInt(22));
      let pointOneNear = nearPenny.times(bigInt(10));

      if (action === 'mintWithImage') {
        localLog('mwi', data);
        localLog('mwi', data.nftData);
        let name = data.name.slice(0, 32);

        if (!name) {
          doubleToast(
            getText('error_mint_kart'),
            getText('error_no_kart_name'),
            'warning'
          );
        } else {
          let tokenId = name.replace(/\s+/g, '') + Date.now().toString();

          try {
            await nftContract.nft_mint(
              {
                token_id: tokenId,
                receiver_id: wallet.getAccountId(),
                name,
                near_kart_new: data.nftData,
                cid: data.cid,
                sig: data.sigHex,
                pub_key: data.pubKeyHex,
              },
              BOATLOAD_OF_GAS,
              pointOneNear.toString()
            );

            reloadTokens = true;
          } catch (e) {
            toast(getText('error_mint_kart'), 'error');
          }
        }
      }
      if (action === 'upgrade') {
        localLog('upgrade', data);
        localLog('upgrade', data.nftData);

        if (data.nftData.locked) {
          toast(getText('error_upgrade_kart_locked', 'warning'));
        } else {
          let tokenId = activeTokenId;
          if (!tokenId) {
            doubleToast(
              getText('error_save_kart'),
              getText('error_no_active_kart'),
              'error'
            );
          } else {
            try {
              await nftContract.upgrade(
                {
                  token_id: tokenId,
                  near_kart_new: data.nftData,
                  cid: data.cid,
                  sig: data.sigHex,
                  pub_key: data.pubKeyHex,
                },
                BOATLOAD_OF_GAS,
                pointOneNear.toString()
              );

              reloadTokens = true;
            } catch (e) {
              toast(getText('error_upgrade_kart'), 'error');
              localLog(e);
            }
          }
        }
      } else if (action === 'gameSimpleBattle') {
        try {
          let tokenId = activeTokenId;
          if (!tokenId) {
            toast(getText('error_no_active_kart'), 'error');
          } else {
            let result = await nftContract.game_simple_battle(
              {
                token_id: tokenId,
              },
              BOATLOAD_OF_GAS,
              '0'
            );

            let homeKart = await nftContract.near_kart_get_config({
              token_id: result.home_token_id,
            });
            let awayKart = await nftContract.near_kart_get_config({
              token_id: result.away_token_id,
            });

            let homeMetadata = await nftContract.nft_get_token_metadata({
              token_id: result.home_token_id,
            });
            let awayMetadata = await nftContract.nft_get_token_metadata({
              token_id: result.away_token_id,
            });

            result.karts = [homeKart, awayKart];
            result.metadata = [homeMetadata, awayMetadata];
            setLastBattle(result);
            viewBattle(result);
            reloadTokens = true;
          }
        } catch (e) {
          toast(getText('error_starting_battle'), 'error');
          console.log(e);
        }
      } else if (action === 'selectNFT') {
        setActiveTokenId(data);
      }

      if (reloadTokens) {
        let tokensForOwnerRes = await nftContract.nft_tokens_for_owner({
          account_id: wallet.getAccountId(),
        });
        setNFTList(tokensForOwnerRes);
      }

      delete _processingActions[action];
      setProcessingActions(_processingActions);
    }
  }

  useEffect(() => {
    if (nftContract && wallet && wallet.getAccountId()) {
      (async () => {
        let _nftList = await nftContract.nft_tokens_for_owner({
          account_id: wallet.getAccountId(),
        });
        if (_nftList.length && !activeTokenId) {
          setActiveTokenId(_nftList[0].token_id);
        }
        setNFTList(_nftList);
        setTokensLoaded(true);
      })();
    }
  }, [nftContract, wallet]);

  const selectNFT = useCallback(
    (tokenId) => {
      (async () => {
        for (let token of nftList) {
          if (token.token_id === tokenId) {
            let nftData = await nftContract.near_kart_get_config({
              token_id: tokenId,
            });
            setNFTData(nftData);
            let _tokenMetadata = await nftContract.nft_get_token_metadata({
              token_id: tokenId,
            });
            setNFTMetadata(_tokenMetadata);
            setActiveKart(token);
          }
        }
      })();
    },
    [nftList, nftContract]
  );

  const newKart = useCallback(
    (isInitializing) => {
      setActiveTokenId('new_kart');
      setNFTData({ ...gameConfig.baseNFTData });
    },
    [setActiveTokenId, setNFTData]
  );

  useEffect(() => {
    if (nftList && tokensLoaded) {
      if (nftList.length === 0) {
        newKart(true);
      } else {
        let numKarts = nftList.length;
        setActiveTokenId(nftList[numKarts - 1].token_id);
        selectNFT(nftList[numKarts - 1].token_id);
      }
    }
  }, [nftList, tokensLoaded, newKart, selectNFT]);

  useEffect(() => {
    if (nftContract && wallet) {
      (async () => {
        try {
          let result = await nftContract.get_last_battle({
            account_id: wallet.getAccountId(),
          });

          let homeKart = await nftContract.near_kart_get_config({
            token_id: result.home_token_id,
          });
          let awayKart = await nftContract.near_kart_get_config({
            token_id: result.away_token_id,
          });

          let homeMetadata = await nftContract.nft_get_token_metadata({
            token_id: result.home_token_id,
          });
          let awayMetadata = await nftContract.nft_get_token_metadata({
            token_id: result.away_token_id,
          });

          result.karts = [homeKart, awayKart];
          result.metadata = [homeMetadata, awayMetadata];

          setLastBattle(result);
        } catch (e) {
          console.log('Error loading last battle', e);
        }
      })();
    }
  }, [nftContract, wallet]);

  useEffect(() => {
    if (nftList.length) {
      localLog('ATID', activeTokenId);
      if (activeTokenId) {
        for (let nft of nftList) {
          if (nft.token_id === activeTokenId) {
            selectNFT(nft.token_id);
          }
        }
      } else {
        if (activeTokenId !== 'new_kart') {
          let numKarts = nftList.length;
          selectNFT(nftList[numKarts - 1].token_id);
        }
      }
    }
  }, [nftList, activeTokenId, selectNFT]);

  function getIntroPanel() {
    let ui = (
      <div className='br-intro-panel'>
        <div className='br-intro'>
          <div className='br-intro-section'>Humanity is in peril</div>
          <div className='br-intro-section'>
            Many disagreements are reported
          </div>
          <div className='br-intro-section'>
            To settle this we will battle... in NEAR Karts!
          </div>
          <div className='br-intro-section'>
            Own your Karts. Win your battles. Humanity will be saved.
          </div>
        </div>
        <Fragment>
          <BrButton
            label={wallet?.isSignedIn() ? 'Sign out' : 'Sign in (NEAR Testnet)'}
            id='signIn'
            className='br-button'
            onClick={signIn}
          />
        </Fragment>
        <div className='br-front-screen-image'></div>
        <div className='br-intro-section'>
          NEAR Karts are NFTs on the NEAR Blockchain
        </div>
      </div>
    );

    return ui;
  }

  function kartName(kartTitle) {
    kartTitle = kartTitle || '';
    return kartTitle.replace('A NEAR Kart Called ', '');
  }

  function viewBattle(battle) {
    setBattleConfig(battle);
    setBattleKarts(battle.metadata);
    setScreen(screens.BATTLE_SETUP);
  }

  function getLastBattleUI() {
    let lastBattleUI;

    if (lastBattle && lastBattle.metadata) {
      lastBattleUI = (
        <div className='br-last-battle-panel'>
          <div className='br-last-battle-details'>
            Last Battle:&nbsp;
            {kartName(lastBattle.metadata[0].title)} v{' '}
            {kartName(lastBattle.metadata[1].title)}
          </div>
          <BrButton
            label='View'
            id='viewBattle'
            className='br-button'
            onClick={(e) => viewBattle(lastBattle)}
            isSubmitting={processingActions['viewBattle']}
          />
        </div>
      );
    }

    return lastBattleUI;
  }

  function getHelpText() {
    let ui;

    let introActiveClass =
      helpMode === helpModes.INTRO ? ' br-pill-active ' : '';
    let battleActiveClass =
      helpMode === helpModes.BATTLE ? ' br-pill-active ' : '';

    ui = (
      <Fragment>
        <div className='br-help-controls'>
          <div className='br-pills'>
            <div
              className={
                'br-pill br-pill-border br-pill-left br-pill-left-border' +
                introActiveClass
              }
              onClick={(e) => setHelpMode(helpModes.INTRO)}
            >
              Intro
            </div>
            <div
              className={
                'br-pill br-pill-border br-pill-right br-pill-right-border' +
                battleActiveClass
              }
              onClick={(e) => setHelpMode(helpModes.BATTLE)}
            >
              Battles
            </div>
          </div>
        </div>
        {helpMode === helpModes.INTRO ? (
          <div className='br-help-panel'>
            <div className='br-help-line'>{getText('text_help_welcome')}</div>
            <div className='br-help-line'>
              {getText('text_help_near_karts')}
            </div>
            <div className='br-help-line'>{getText('text_help_garage')}</div>
            <div className='br-help-line'>{getText('text_help_mint')}</div>
            <div className='br-help-highlight'>
              {getText('text_help_kart_name')}
            </div>
            <div className='br-info-message br-info-message-start br-space-top br-full-width br-info-message-warning'>
              <i className='fa fa-info br-info-icon'></i>
              {getText('text_alpha_warning')}
              <br />
              {getText('text_data_loss_warning')}
            </div>
          </div>
        ) : (
          <div className='br-help-panel'>
            <div className='br-help-line'>{getText('text_help_battle')}</div>
            <div className='br-help-line'>{getText('text_help_level_up')}</div>
            <div className='br-help-highlight'>
              {getText('text_help_upgrade')}
            </div>
            <div className='br-info-message br-info-message-start br-space-top br-full-width'>
              <i className='fa fa-info br-info-icon'></i>
              {getText('text_help_no_equip_benefit')}
              <br />
              {getText('text_help_look_cool')}
            </div>
          </div>
        )}
      </Fragment>
    );

    return ui;
  }

  function getHighScores() {
    let rows = [];
    let table;
    let ui;

    if (highScoreData?.length) {
      for (let h of highScoreData) {
        let mediaURL = getImageURL(h.nearKart.media);

        rows.push(
          <tr className='br-highscore-row' key={h.id}>
            <td className='br-highscore-media-td'>
              <img className='br-kart-image-tiny' src={mediaURL} alt='Kart' />
            </td>
            <td className='br-highscore-td'>{h.nearKart.name}</td>
            <td className='br-highscore-td'>{h.nearKart.ownerId}</td>
            <td className='br-highscore-td'>{h.numWins}</td>
            <td className='br-highscore-td'>{h.numLosses}</td>
          </tr>
        );

        table = (
          <table className='br-highscore-table'>
            <thead>
              <th className='br-highscore-media'></th>
              <th className='br-highscore-name'>Kart</th>
              <th className='br-highscore-owner'>Owner</th>
              <th className='br-highscore-wins'>Wins</th>
              <th className='br-highscore-losses'>Defeats</th>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        );
      }
    }

    let dailyActiveClass =
      highScoreMode === highScoreModes.DAILY ? ' br-pill-active ' : '';
    let monthlyActiveClass =
      highScoreMode === highScoreModes.MONTHLY ? ' br-pill-active ' : '';

    ui = (
      <Fragment>
        <div className='br-highscore-controls'>
          <div className='br-pills'>
            <div
              className={
                'br-pill br-pill-border br-pill-left br-pill-left-border' +
                dailyActiveClass
              }
              onClick={(e) => setHighScoreMode(highScoreModes.DAILY)}
            >
              Daily
            </div>
            <div
              className={
                'br-pill br-pill-border br-pill-right br-pill-right-border' +
                monthlyActiveClass
              }
              onClick={(e) => setHighScoreMode(highScoreModes.MONTHLY)}
            >
              Monthly
            </div>
          </div>
        </div>
        {table ? (
          table
        ) : (
          <div className='br-info-message'>
            {getText('text_leaderboard_waiting')}
          </div>
        )}
        <div className='br-small-message br-space-top'>
          {getText('text_leaderboard_processing')}
        </div>
      </Fragment>
    );

    return <div className='br-highscore-panel'>{ui}</div>;
  }

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      borderRadius: '8px 8px 0 0',
      padding: 0,
    },
    overlay: { zIndex: 999 },
  };

  function openModal() {
    setModalIsOpen(true);
  }

  function afterOpenModal() {}

  function closeModal() {
    setModalIsOpen(false);
  }

  function showModal(id) {
    setShowingHighScores(false);
    openModal();
  }

  function closeHighScoreModal() {
    setShowingHighScores(false);
  }

  function showHighScoreModal() {
    closeModal();
    setShowingHighScores(true);
  }

  localLog('nftList', nftList);
  localLog('nftData', nftData);
  localLog('nftMetadata', nftMetadata);
  localLog('Last battle: ', lastBattle);

  let isSignedIn = wallet?.isSignedIn() && walletSignedIn; // NEAR sign out doesn't have await so need this trick with walletSignedIn

  return (
    <div className='br-page'>
      <div>
        <Modal
          isOpen={modalIsOpen}
          onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel='NEAR Karts'
        >
          <div className='br-modal-title'>
            <h2 className='br-modal-heading'>NEAR Karts</h2>
            <div className='br-modal-close'>
              <BrButton
                label={<i className='fas fa-times-circle' />}
                className='br-button br-icon-button'
                onClick={closeModal}
              />
            </div>
          </div>
          <div className='br-modal-panel'>
            <div className='br-modal-content>'>
              {getHelpText('introduction')}
            </div>
          </div>
        </Modal>
      </div>
      <div>
        <Modal
          isOpen={showingHighScores}
          onRequestClose={closeHighScoreModal}
          style={customStyles}
          contentLabel='NEAR Karts Leaderboard'
          appElement={document.getElementById('root')}
        >
          <div className='br-modal-title'>
            <h2 className='br-modal-heading'>Leaderboard</h2>
            <div className='br-modal-close'>
              <BrButton
                label={<i className='fas fa-times-circle' />}
                className='br-button br-icon-button'
                onClick={closeHighScoreModal}
              />
            </div>
          </div>
          <div className='br-modal-panel'>
            <div className='br-modal-content>'>
              {getHighScores(highScoreMode)}
            </div>
          </div>
        </Modal>
      </div>
      <div className='br-header'>
        <div className='br-header-logo-panel'>
          {isSignedIn && screen !== screens.BATTLE ? getLastBattleUI() : ''}
        </div>
        <div className='br-header-title-panel'>
          <img
            className='br-header-logo'
            alt='Muhindo Galien Head'
            src={Logo}
          />
        </div>
        <div className='br-header-controls-panel'>
          <div className='br-header-controls'>
            {screen === screens.GARAGE ? (
              <button
                className='br-button br-icon-button'
                onMouseDown={showModal}
              >
                <i className='fa fa-info'></i>
              </button>
            ) : (
              ''
            )}
            <Fragment>
              <BrButton
                label='Leaderboard'
                id='showHighScoresButton'
                className='br-button'
                onClick={showHighScoreModal}
              />
            </Fragment>
            {isSignedIn ? (
              <Fragment>
                <BrButton
                  label={wallet?.isSignedIn() ? 'Sign out' : 'Sign in'}
                  id='signIn'
                  className='br-button'
                  onClick={signIn}
                />
              </Fragment>
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
      <div className='br-content'>
        {isSignedIn ? (
          <NearKarts
            nftList={nftList}
            nftData={nftData}
            nftMetadata={nftMetadata}
            selectNFT={selectNFT}
            setNFTData={setNFTData}
            activeTokenId={activeTokenId}
            setActiveTokenId={setActiveTokenId}
            activeKart={activeKart}
            processingActions={processingActions}
            execute={execute}
            toast={toast}
            battleResult={battleResult}
            battleKarts={battleKarts}
            lastBattle={lastBattle}
            setBattleResult={setBattleResult}
            battleConfig={battleConfig}
            setBattleConfig={setBattleConfig}
            screens={screens}
            screen={screen}
            setScreen={setScreen}
            showModal={showModal}
            newKart={newKart}
            tokensLoaded={tokensLoaded}
            getTextureURL={getTextureURL}
            getIconURL={getIconURL}
            getImageURL={getImageURL}
          />
        ) : (
          ''
        )}
        {!wallet?.isSignedIn() ? getIntroPanel() : ''}
      </div>
    </div>
  );
}

export default App;
