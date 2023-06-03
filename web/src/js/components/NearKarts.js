import React, { useEffect, useState, useCallback, Fragment } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import lifeform from '../../data/models/bot-3.glb';
import imageFrame from '../../images/frame-dark-1.png';
import BrButton from './lib/BrButton';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
  setAlphaToEmissive,
  loadImageToMaterial,
  hueToColor,
  hexColorToInt,
  intToHexColor,
  HitTester,
} from '../helpers/3d';
import { cloneObj, StateCheck, isLocal, localLog } from '../helpers/helpers';
import gameConfig, { partIdToName } from '../../data/world/config';
import getText, { exclamation } from '../../data/world/text';
import { CompactPicker } from 'react-color';
import domtoimage from 'dom-to-image';
import Battle from '../helpers/battle';
let b = new Battle();

function getNearKartsServerURL(forceRemote = false) {
  let url = 'https://localhost:8926';

  if (!isLocal() || forceRemote) {
    url = 'https://i1.muhindogalien.net:8926';
  }

  return url;
}

const nearKartsURL = getNearKartsServerURL();

const DEBUG_FORCE_BATTLE = false;
const DEBUG_FORCE_POST_BATTLE = false;
const DEBUG_IMAGES = false;
const DEBUG_NO_MINT = false;
const DEBUG_KART = false;
const DEBUG_FAST_BATTLE = false;

const loader = new GLTFLoader();

const w = 1000;
const h = 800;
const wPhoto = 400;
const hPhoto = 400;

let textDelay = 2000;
let postBattleDelay = 3000;
if (DEBUG_FAST_BATTLE) {
  textDelay = 200;
}

const LIGHT_INTENSITY = 14;

const keysPressed = {};

document.addEventListener('keydown', (e) => {
  keysPressed[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (e) => {
  keysPressed[e.key.toLowerCase()] = false;
});

const stateCheck = new StateCheck();
let battleTimer;

const postBattleScreens = {
  NONE: 0,
  RESULT: 1,
  LEVEL_UP: 2,
  PRIZE_PREPARE: 4,
  PRIZE_RESULT: 5,
  PRIZE_SUMMARY: 6,
  END: 7,
};

function NearKarts(props) {
  const showModal = props.showModal;
  const nftList = props.nftList;
  const nftData = props.nftData;
  const tokensLoaded = props.tokensLoaded;
  const activeTokenId = props.activeTokenId;
  const execute = props.execute;
  const processingActions = props.processingActions;
  const toast = props.toast;
  const battleKarts = props.battleKarts;
  const battleResult = props.battleResult;
  const battleConfig = props.battleConfig;
  const setBattleConfig = props.setBattleConfig;
  const screens = props.screens;
  const screen = props.screen;
  const setScreen = props.setScreen;
  const newKart = props.newKart;
  const getTextureURL = props.getTextureURL;
  const getImageURL = props.getImageURL;

  window.nftData = nftData;

  const threeRef = React.createRef();
  const threePhotoRef = React.createRef();
  const photoComposerRef = React.createRef();
  const battleTextRef = React.createRef();

  const [scene, setScene] = useState();
  const [camera, setCamera] = useState();
  const [sjScene, setSJScene] = useState();
  const [photoScene, setPhotoScene] = useState();
  const [photoSubScene, setPhotoSubScene] = useState();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [groupIndex, setGroupIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [prevNFTData, setPrevNFTData] = useState({});
  const [kartNameEntry, setKartNameEntry] = useState('');
  const [replayReq, setReplayReq] = useState(0);
  const [controlEntry, setControlEntry] = useState({
    ...gameConfig.defaultKartEntry,
  });
  const [kartStyleInitialized, setKartStyleInitialized] = useState();

  const [imageDataURL, setImageDataURL] = useState('');
  const [kartImageRendered, setKartImageRendered] = useState(false);
  const [renderRequested, setRenderRequested] = useState();
  const [prevScreen, setPrevScreen] = useState(screens.GARAGE);
  const [battle, setBattle] = useState({});
  const [battleText, setBattleText] = useState([]);
  const [battlePower, setBattlePower] = useState([100, 100]);
  const [battleHit, setBattleHit] = useState([0, 0]);
  const [battleAttacking, setBattleAttacking] = useState([0, 0]);
  const [battleStarted, setBattleStarted] = useState();
  const [battleEnded, setBattleEnded] = useState();
  const [orbitControls, setOrbitControls] = useState();
  const [garagePanel, setGaragePanel] = useState('equip');
  const [postBattleScreen, setPostBattleScreen] = useState(
    postBattleScreens.NONE
  );

  function kartChanged(nftData, prevNFTData) {
    let keys = Object.keys(gameConfig.baseNFTData);

    let changedKeys = [];

    for (let key of keys) {
      if (nftData[key] !== prevNFTData[key]) {
        changedKeys.push(key);
      }
    }

    return changedKeys;
  }

  function nftDataToKartConfig(nftData) {
    let kartConfig = {};
    for (let side of ['left', 'right']) {
      if (nftData[side] >= gameConfig.shield_index_start) {
        kartConfig[side] =
          gameConfig.shields_side[nftData[side] - gameConfig.shield_index_start]
            ?.id || 'empty';
      } else {
        kartConfig[side] =
          gameConfig.weapons_range[nftData[side]]?.id || 'empty';
      }
    }

    kartConfig.front = gameConfig.weapons_melee[nftData.front]?.id || 'empty';
    kartConfig.skin = gameConfig.skin[nftData.skin]?.id || 'SkinPlastic';
    kartConfig.transport =
      gameConfig.transport[nftData.transport]?.id || 'TransportWheels';

    kartConfig.color = intToHexColor(nftData.color1);

    kartConfig.decal1 = nftData.decal1;
    kartConfig.decal2 = nftData.decal2;
    kartConfig.decal3 = nftData.decal3;

    kartConfig.unlockedDecals = nftData.extra1
      ? [...nftData.extra1.split(','), '0', '7']
      : ['', '0', '7'];

    return kartConfig;
  }

  function validDecal(decal) {
    let isValid =
      !decal || decal === '0' || controlEntry.unlockedDecals.includes(decal);
    return isValid;
  }

  function kartConfigToNFTData(kartConfig) {
    let nftData = { ...gameConfig.baseNFTData };
    let index;

    for (let side of ['left', 'right']) {
      let elem = kartConfig[side];
      if (elem.startsWith('Weapon')) {
        index = gameConfig.weapons_range.findIndex((x) => x.id === elem);
        nftData[side] = index > 0 ? index : 0;
      } else if (elem.startsWith('Shield')) {
        index = gameConfig.shields_side.findIndex((x) => x.id === elem);
        nftData[side] = index > -1 ? index + gameConfig.shield_index_start : 0;
      }
    }

    index = gameConfig.weapons_melee.findIndex(
      (x) => x.id === kartConfig.front
    );
    nftData.front = index > 0 ? index : 0;
    index = gameConfig.skin.findIndex((x) => x.id === kartConfig.skin);
    nftData.skin = index > 0 ? index : 0;
    index = gameConfig.transport.findIndex(
      (x) => x.id === kartConfig.transport
    );
    nftData.transport = index > 0 ? index : 0;

    nftData.color1 = hexColorToInt(kartConfig.color);

    nftData.decal1 = kartConfig.decal1;
    nftData.decal2 = kartConfig.decal2;
    nftData.decal3 = kartConfig.decal3;

    return nftData;
  }

  useEffect(() => {
    let changedKeys = kartChanged(nftData, prevNFTData);

    if (changedKeys.length && nftData !== {}) {
      let kartConfig = nftDataToKartConfig(nftData);
      setControlEntry(kartConfig);
      setPrevNFTData({ ...nftData });
      if (DEBUG_FORCE_BATTLE) {
        startBattle();
      }
    }
  }, [nftData, prevNFTData]);

  function startHidden(name) {
    let hidden = false;
    for (let start of gameConfig.start_hidden) {
      if (name.startsWith(start)) {
        hidden = true;
      }
    }
    return hidden;
  }

  const styleScene = useCallback((scene, controlEntry) => {
    scene.traverse((o) => {
      if (startHidden(o.name)) {
        o.visible = false;
      }

      if (controlEntry.left) {
        let name = controlEntry.left;

        if (
          o.name === 'BotTurretL' &&
          name.startsWith('Weapon') &&
          !name.endsWith('Empty')
        ) {
          o.visible = true;
        }

        if (o.name.startsWith(name + 'L')) {
          o.visible = true;
        }
      }

      if (controlEntry.right) {
        let name = controlEntry.right;

        if (
          o.name === 'BotTurretR' &&
          name.startsWith('Weapon') &&
          !name.endsWith('Empty')
        ) {
          o.visible = true;
        }

        if (o.name.startsWith(name + 'R')) {
          o.visible = true;
        }
      }

      if (controlEntry.front) {
        let name = controlEntry.front;

        if (
          o.name === 'BotTurretFront' &&
          name.startsWith('Weapon') &&
          !name.endsWith('Empty')
        ) {
          o.visible = true;
        }

        if (o.name.startsWith(name)) {
          o.visible = true;
        }
      }

      if (controlEntry.transport) {
        if (o.name.startsWith(controlEntry.transport)) {
          o.visible = true;
        }
      }

      if (o.name === 'BotBody1') {
        for (let child of o.children) {
          if (child.material.name === 'MatBodyDecal1') {
            loadImageToMaterial(
              child.material,
              getTextureURL('badge', controlEntry.decal1)
            );
          }
          if (
            child.material.name === 'MatBody' ||
            child.material.name === 'MatBodyDecal1'
          ) {
            child.material.color = new THREE.Color(controlEntry.color);
            child.material.emissiveIntensity = 5;

            if (controlEntry.skin === 'SkinPlastic') {
              child.material.flatShading = false;
              child.material.roughness = 0;
              child.material.metalness = 0;
            }
            if (controlEntry.skin === 'SkinCarbonFibre') {
              child.material.flatShading = true;
              child.material.roughness = 0.8;
              child.material.metalness = 0;
            }
            if (controlEntry.skin === 'SkinAluminium') {
              child.material.flatShading = true;
              child.material.roughness = 0.4;
              child.material.metalness = 0.5;
            }
            if (controlEntry.skin === 'SkinSteel') {
              child.material.flatShading = true;
              child.material.roughness = 0.2;
              child.material.metalness = 1;
            }

            child.material.needsUpdate = true;
          }
        }
      }

      setKartStyleInitialized(true);
    });
  }, []);

  useEffect(() => {
    if (sjScene) {
      styleScene(sjScene, controlEntry);
    }
  }, [sjScene, controlEntry, styleScene]);

  useEffect(() => {
    if (photoSubScene) {
      styleScene(photoSubScene, controlEntry);
    }
  }, [photoSubScene, controlEntry, styleScene]);

  useEffect(() => {
    if (scene) {
      loader.load(
        lifeform,
        function (gltf) {
          scene.add(gltf.scene);
          setSJScene(gltf.scene);
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    }
  }, [scene]);

  useEffect(() => {
    if (photoScene) {
      loader.load(
        lifeform,
        function (gltf) {
          photoScene.add(gltf.scene);
          setPhotoSubScene(gltf.scene);
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    }
  }, [photoScene]);

  const createScene = useCallback(
    (
      threeElem,
      w,
      h,
      camPos,
      orbitControls = false,
      refreshEvery = 1,
      camLookAt = [0, 0, 0]
    ) => {
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(50, w / h, 1, 10);
      camera.position.copy(camPos);
      camera.lookAt(camLookAt[0], camLookAt[1], camLookAt[2]);

      let controls;

      if (orbitControls) {
        controls = new OrbitControls(camera, threeElem);
        controls.target.set(0, 0.4, 0);
        controls.minDistance = 3;
        controls.maxDistance = 4.5;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI / 2.1;
        controls.autoRotate = false;
        setOrbitControls(controls);
      }

      var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });

      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(w, h);
      renderer.setClearColor(0x000000);
      renderer.toneMapping = THREE.ReinhardToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = 'initial';
      threeElem.appendChild(renderer.domElement);

      let lights = addPointLights(scene, 0xffffff, LIGHT_INTENSITY, 10, [
        new THREE.Vector3(5, 5, 5),
        new THREE.Vector3(-5, 5, 5),
        new THREE.Vector3(0, 5, -2),
      ]);

      let i = 0;
      var animate = function () {
        requestAnimationFrame(animate);
        if (controls) controls.update();

        if (i++ % refreshEvery === 0) {
          renderer.render(scene, camera);
        }
      };

      animate();

      return { scene, camera };
    },
    []
  );

  useEffect(() => {
    let { scene, camera } = createScene(
      threeRef.current,
      w,
      h,
      new THREE.Vector3(0, 0.5, 4),
      true,
      4,
      [0, -1.5, 0]
    );
    setScene(scene);
    setCamera(camera);

    let { scene: photoScene, camera: photoCamera } = createScene(
      threePhotoRef.current,
      wPhoto,
      hPhoto,
      new THREE.Vector3(0, 1.6, 3.6),
      false,
      20,
      [0, -0.5, 0]
    );
    setPhotoScene(photoScene);
  }, []);

  function addPointLights(scene, color, intensity, dist, positions = []) {
    let lights = [];
    for (let pos of positions) {
      const light = new THREE.PointLight(color, intensity, dist);
      light.position.copy(pos);
      scene.add(light);
      lights.push(light);
    }
    return lights;
  }

  function toggleAutoRotate() {
    if (orbitControls) {
      orbitControls.autoRotate = !orbitControls.autoRotate;
    }
  }

  function getControl(action, src) {
    let processing = processingActions?.[action];

    return (
      <div
        className={
          'br-strange-juice-control ' + (processing ? 'br-border-hide' : '')
        }
        onClick={(e) => execute(action)}
        key={action}
      >
        <div className='br-strange-juice-overlay-image-container'>
          <img
            className={
              'br-strange-juice-overlay-image ' +
              (processing ? 'br-anim-shake-short br-hurt' : '')
            }
            alt='Plug socket'
            src={src}
          />
        </div>
        <div
          className={
            'br-strange-juice-overlay-text ' +
            (processing ? 'br-anim-text-pulse' : '')
          }
        >
          {getText('icon_' + action)}
        </div>
      </div>
    );
  }

  function getControlSet(setId, gameConfig) {
    if (screen !== screens.GARAGE || !nftData.version) {
      return;
    }
    let controlSetUI = [];
    let elems = [];
    let index = 0;
    let disabled;
    let validIndex = getMaxWeaponIndexForLevel(nftData.level);

    if (setId === 'left' || setId === 'right') {
      let optionsWeapon = [];
      let optionsShield = [];

      elems = gameConfig.weapons_range;

      index = 0;
      for (let elem of elems) {
        disabled = index > validIndex;
        optionsWeapon.push(
          <option key={setId + elem.id} disabled={disabled} value={elem.id}>
            {elem.name}
          </option>
        );
        index++;
      }

      elems = gameConfig.shields_side;

      index = 0;
      for (let elem of elems) {
        disabled = index > validIndex;
        optionsShield.push(
          <option key={setId + elem.id} disabled={disabled} value={elem.id}>
            {elem.name}
          </option>
        );
        index++;
      }

      controlSetUI.push(
        <optgroup key={setId + 'Weapons'} label='Weapons'>
          {optionsWeapon}
        </optgroup>
      );
      controlSetUI.push(
        <optgroup key={setId + 'Shields'} label='Shields'>
          {optionsShield}
        </optgroup>
      );
    } else if (setId.startsWith('decal')) {
      elems = gameConfig.decals;

      for (let elem of elems) {
        disabled = !validDecal(elem.id);

        controlSetUI.push(
          <option key={setId + elem.id} disabled={disabled} value={elem.id}>
            {elem.name}
          </option>
        );
      }
    } else {
      if (setId === 'front') {
        elems = gameConfig.weapons_melee;
      } else if (setId === 'skin') {
        elems = gameConfig.skin;
      } else if (setId === 'transport') {
        elems = gameConfig.transport;
      }

      index = 0;
      for (let elem of elems) {
        disabled = index > validIndex;
        controlSetUI.push(
          <option key={setId + elem.id} disabled={disabled} value={elem.id}>
            {elem.name}
          </option>
        );
        index++;
      }
    }

    return (
      <select
        key={setId + 'select'}
        className='br-feature-select'
        value={controlEntry[setId]}
        onChange={(e) => changeControl(setId, e.target.value)}
      >
        {controlSetUI}
      </select>
    );
  }

  function changeControl(setId, value) {
    let _controlEntry = { ...controlEntry };
    _controlEntry[setId] = value;
    setControlEntry(_controlEntry);
  }

  function getControlRow(title, control) {
    return (
      <div className='br-feature-row' key={title}>
        <div className='br-feature-title'>{title}</div>
        <div className='br-feature-control'>{control}</div>
      </div>
    );
  }

  function colorChanged(color, event) {
    changeControl('color', color.hex);
  }

  function getColorChooser() {
    const pickerStyle = {
      padding: '0.5em',
    };

    return (
      <div style={pickerStyle}>
        <CompactPicker onChange={colorChanged} />
      </div>
    );
  }

  function showBeginnerHelp() {
    return nftList.length === 0;
  }

  function getControlUI(gameConfig, strangeJuice) {
    let controlUI = [];

    if (garagePanel === 'equip') {
      if (showBeginnerHelp()) {
        controlUI.push(
          <div className='br-info-message'>
            <i className='fa fa-info br-info-icon'></i>
            {getText('text_unlock_items')}
          </div>
        );
      }

      controlUI.push(getControlRow('Left', getControlSet('left', gameConfig)));
      controlUI.push(
        getControlRow('Right', getControlSet('right', gameConfig))
      );
      controlUI.push(
        getControlRow('Front', getControlSet('front', gameConfig))
      );
      controlUI.push(
        getControlRow('Wheels', getControlSet('transport', gameConfig))
      );
      controlUI.push(getControlRow('Skin', getControlSet('skin', gameConfig)));
    } else {
      controlUI.push(
        getControlRow(
          'Color',
          <div key='ColorChooser'>{getColorChooser()}</div>
        )
      );

      if (showBeginnerHelp()) {
        controlUI.push(
          <div className='br-info-message'>
            <i className='fa fa-info br-info-icon'></i>
            {getText('text_get_new_decals')}
          </div>
        );
      }

      controlUI.push(
        getControlRow('Decal', getControlSet('decal1', gameConfig))
      );
    }

    return controlUI;
  }

  useEffect(() => {
    let lineIndexChanged = stateCheck.changed('lineIndex1', lineIndex, -1);
    let replayReqChanged = stateCheck.changed('replayReq1', replayReq, 0);

    if (lineIndexChanged || replayReqChanged) {
      if (groupIndex > -1 && groupIndex < battleText.length) {
        let timer = setTimeout(() => {
          if (battleText.length) {
            let isLastLineInGroup =
              lineIndex === battleText[groupIndex].length - 1;

            if (isLastLineInGroup) {
              let isLastGroup = groupIndex === battleText.length - 1;

              if (!isLastGroup) {
                setGroupIndex(groupIndex + 1);
                setLineIndex(0);
              } else {
                setBattleEnded(true);
              }
            } else {
              setLineIndex(lineIndex + 1);
            }
          }
        }, textDelay);

        return () => {
          clearInterval(timer);
        };
      }
    }
  }, [groupIndex, lineIndex, battleText, replayReq]);

  useEffect(() => {
    let battleEndedChanged = stateCheck.changed('battleEnded1', battleEnded);
    if (battleEndedChanged && battleEnded) {
      setPostBattleScreen(postBattleScreens.RESULT);
    }
  }, [battleEnded, toast, battleConfig]);

  useEffect(() => {
    if (postBattleScreen !== postBattleScreens.NONE) {
      clearInterval(battleTimer);
      battleTimer = setTimeout(() => {
        if (postBattleScreen === postBattleScreens.RESULT) {
          if (battle.winner === 0) {
            setPostBattleScreen(postBattleScreens.LEVEL_UP);
          } else {
            setPostBattleScreen(postBattleScreens.END);
          }
        } else if (postBattleScreen === postBattleScreens.LEVEL_UP) {
          setPostBattleScreen(postBattleScreens.PRIZE_PREPARE);
        } else if (postBattleScreen === postBattleScreens.PRIZE_PREPARE) {
          setPostBattleScreen(postBattleScreens.PRIZE_RESULT);
        } else if (postBattleScreen === postBattleScreens.PRIZE_RESULT) {
          setPostBattleScreen(postBattleScreens.END);
        }
      }, postBattleDelay);

      return () => {
        clearInterval(battleTimer);
      };
    } else {
      clearInterval(battleTimer);
    }
  }, [postBattleScreen]);

  useEffect(() => {
    setGroupIndex(0);
    setBattleStarted(false);
    setBattleEnded(false);
    setLineIndex(-1);
    setReplayReq(replayReq + 1);
  }, [battleText]);

  useEffect(() => {
    let lineIndexChanged = stateCheck.changed('lineIndexBP', lineIndex, -1);

    if (lineIndexChanged && battleText.length) {
      if (b?.rounds?.length) {
        let roundData = b.rounds[groupIndex].data;
        let aggressor = roundData.aggressor;
        let victim = 1 - aggressor;
        let score = roundData.score;
        let lines = battleText[groupIndex];

        let isFirstLine = lineIndex === 0;
        let isLastLine = lineIndex === lines.length - 1;

        if (isFirstLine) {
          setBattleStarted(true);
          setBattleHit([0, 0]);
          let attacking = [1, 0];
          if (aggressor === 1) attacking = [0, 1];
          setBattleAttacking(attacking);
        } else if (isLastLine) {
          let powerHome = Math.max(100 - roundData.totals[1], 0);
          let powerAway = Math.max(100 - roundData.totals[0], 0);
          setBattlePower([powerHome, powerAway]);

          if (roundData.score > 0) {
            let battleHit = [0, 1];
            if (aggressor === 1) battleHit = [1, 0];
            setBattleHit(battleHit);
          }
        }
      }
    }
  }, [groupIndex, lineIndex, battleText]);

  function getMintUpgradeUI() {
    let ui;

    if (nftData.level === 0) {
      ui = (
        <Fragment>
          <div className='br-text-entry-row-label'>
            <input
              type='text'
              placeholder={getText('text_kart_name_label')}
              value={kartNameEntry}
              onChange={(e) => setKartNameEntry(e.target.value)}
            />
          </div>
          <div className='br-text-entry-row-control'>
            <BrButton
              label='Mint'
              id='render'
              className='br-button'
              onClick={render}
              isSubmitting={
                renderRequested || processingActions['mintWithImage']
              }
            />
          </div>
        </Fragment>
      );
    } else {
      if (nftData.locked) {
        let nextUpgradeLevel = (Math.floor(nftData.level / 5) + 1) * 5;
        ui = (
          <div className='br-info-message br-full-width'>
            <i className='fa fa-info br-info-icon'></i>
            <div>
              {getText('text_locked')}
              <br />
              {getText('text_next_upgrade', {
                next_upgrade_level: nextUpgradeLevel,
              })}
            </div>
          </div>
        );
      } else {
        ui = (
          <Fragment>
            <div className='br-text-entry-row-label'>
              {getText('text_upgrade_save')}
            </div>
            <div className='br-text-entry-row-control'>
              <BrButton
                label='Upgrade'
                id='upgrade'
                className='br-button'
                onClick={render}
                isSubmitting={renderRequested || processingActions['upgrade']}
              />
            </div>
          </Fragment>
        );
      }
    }

    return ui;
  }

  function getContractControls() {
    return (
      <div className='br-contract-controls'>
        {nftData && (
          <div className='br-text-entry-row'>{getMintUpgradeUI()}</div>
        )}
      </div>
    );
  }

  function getTextUI(storyLines) {
    let linesUI = [];

    let i = 0;
    for (let line of storyLines) {
      linesUI.push(
        <div className='br-strange-juice-story-line' key={i++}>
          {line}
        </div>
      );
    }

    return <div className='br-strange-juice-story-lines'>{linesUI}</div>;
  }

  function kartName(kartTitle) {
    kartTitle = kartTitle || '';
    return kartTitle.replace('A NEAR Kart Called ', '');
  }

  function displayNFTs(nftList, activeTokenId) {
    let nftUI = [];
    let active = false;

    for (let nft of nftList) {
      if (activeTokenId === nft.token_id) {
        active = true;
      } else {
        active = false;
      }

      nftUI.push(
        <div
          className={
            'br-nft-list-item ' + (active ? 'br-nft-list-item-selected' : '')
          }
          key={nft.token_id}
          onClick={(e) => execute('selectNFT', nft.token_id)}
        >
          {kartName(nft.metadata.title)}
        </div>
      );
    }

    let newKartActive = false;
    if (!activeTokenId || activeTokenId === 'new_kart') {
      newKartActive = true;
    }

    nftUI.push(
      <div
        className={
          'br-nft-list-item ' +
          (newKartActive ? 'br-nft-list-item-selected' : '')
        }
        key='new_kart'
        onClick={(e) => newKart()}
      >
        {getText('text_new_nft_name')}
      </div>
    );

    return (
      <Fragment>
        <div className='br-nft-list flexcroll'>{nftUI}</div>
      </Fragment>
    );
  }

  function dataURLToFile(src, fileName, mimeType) {
    return fetch(src)
      .then(function (res) {
        return res.arrayBuffer();
      })
      .then(function (buf) {
        return new File([buf], fileName, { type: mimeType });
      });
  }

  function render() {
    toast(getText('text_creating_image'));
    setRenderRequested(true);
    /*
     * Convers a hidden threejs canvas to a dataURL
     * setImageDataURL sets the imageDataURL of an offscreen composer element which applys rounded corners etc.
     * This needs a time to update so set kartImageRendered to let that happen
     * In the useEffect for kartImageRendered, dom-to-image does its job and calls saveImageData to upload
     */
    let dataURL = threePhotoRef.current
      .getElementsByTagName('canvas')[0]
      .toDataURL();
    setImageDataURL(dataURL);
    setKartImageRendered(true);
  }

  const mintOrUpgrade = useCallback(
    (verifiedImageData) => {
      let newNFTData = kartConfigToNFTData(controlEntry);
      newNFTData.level = nftData.level;
      newNFTData.locked = nftData.locked;

      verifiedImageData.name = kartNameEntry;
      verifiedImageData.nftData = newNFTData;

      if (nftData.level === 0) {
        toast(getText('text_mint_request'));
        execute('mintWithImage', verifiedImageData);
      } else {
        if (!nftData.locked) {
          toast(getText('text_upgrade_request'));
          execute('upgrade', verifiedImageData);
        } else {
          toast(getText('error_upgrade_kart_locked', 'warning'));
        }
      }
    },
    [controlEntry, execute, kartNameEntry, nftData, toast]
  );

  const saveImageData = useCallback(
    async (dataURL) => {
      let f = await dataURLToFile(dataURL, 'bla.png', 'image/png');

      try {
        let fd = new FormData();
        fd.append('file', f);
        let r = await fetch(`${nearKartsURL}/upload`, {
          method: 'POST',
          headers: {},
          body: fd,
        });

        let j = await r.json();
        if (j.success) {
          if (true) {
            toast(getText('success_image_upload'));
            localLog('image data ', getImageURL(j.data.cid));
            if (!DEBUG_NO_MINT) {
              mintOrUpgrade(j.data);
            }
          }
        } else {
          toast(getText('error_image_upload_failed'), 'error');
        }
      } catch (e) {
        toast(getText('error_image_upload_failed'), 'error');
      }

      setKartImageRendered(false);
      setRenderRequested(false);
    },
    [toast, mintOrUpgrade]
  );

  useEffect(() => {
    if (
      stateCheck.changed('kartImageRendered', kartImageRendered, false) &&
      kartImageRendered
    ) {
      domtoimage
        .toPng(photoComposerRef.current, {
          width: 400,
          height: 400,
          style: { display: 'block' },
        })
        .then(function (dataUrl) {
          saveImageData(dataUrl);
        })
        .catch(function (error) {
          console.error('Unable to render composed Kart image', error);
        });
    }
  }, [kartImageRendered, saveImageData, photoComposerRef]);

  useEffect(() => {
    if (battle.battle) {
      battle.kartConfigs = [
        nftDataToKartConfig(battle.karts[0]),
        nftDataToKartConfig(battle.karts[1]),
      ];

      b.load(battle);
      b.generate();

      localLog('battle', b, b.rounds.length);

      let _battleText = [];
      while (!b.finished) {
        let round = b.next();
        _battleText.push(round.text);
      }
      setBattleText(_battleText);
    }
  }, [battle]);

  function displayBattleText(battleText) {
    let lines = [];
    let groupLines = [];

    let textGroupIndex = 0;
    for (let group of battleText) {
      if (!battleStarted || textGroupIndex > groupIndex) {
        break;
      }
      let textLineIndex = 0;
      groupLines = [];

      for (let line of group) {
        let isCurrentGroup = textGroupIndex === groupIndex; // Only limit displayed lines for currentGroup

        let activeLineClass = '';

        if (isCurrentGroup && textLineIndex === lineIndex) {
          activeLineClass = 'br-battle-text-line-active';
        }

        let id = `br-battle-text-line-${textGroupIndex}-${textLineIndex}`;
        groupLines.push(
          <div
            className={'br-battle-text-line ' + activeLineClass}
            id={id}
            key={id}
          >
            {line}
          </div>
        );

        textLineIndex++;

        if (isCurrentGroup && textLineIndex > lineIndex) {
          break;
        }
      }
      textGroupIndex++;

      let id = `br-battle-text-group-${textGroupIndex}`;
      lines.push(
        <div className='br-battle-text-group' id={id} key={id}>
          {groupLines.reverse()}
        </div>
      );
    }

    if (lines.length) {
      lines.reverse();
    }

    return (
      <div className='br-battle-text' ref={battleTextRef}>
        {lines}
      </div>
    );
  }

  useEffect(() => {
    setBattleText([]);

    if (screen === screens.BATTLE) {
      setPostBattleScreen(
        DEBUG_FORCE_POST_BATTLE
          ? postBattleScreens.RESULT
          : postBattleScreens.NONE
      );
      setBattlePower([100, 100]);
      setBattleHit([0, 0]);
      setBattleAttacking([0, 0]);
      b.reset();
      setBattle(battleConfig);
    } else if (screen === screens.GARAGE) {
      setBattle({});
    }
  }, [screen]);

  function changeScreen(screenID) {
    setPrevScreen(screen);
    setScreen(screenID);
  }

  function startBattle() {
    toast(getText('text_finding_opponent'));
    execute('gameSimpleBattle');
  }

  function watchBattle() {
    toast(getText('text_battle_started'));
    changeScreen(screens.BATTLE);
  }

  function getScreenClass(screenId) {
    let screenClass = 'br-screen-hidden';

    if (screenId === screen) {
      screenClass = 'br-screen-current loading-fade-in-fast';
    } else if (screenId === prevScreen) {
      screenClass = 'br-screen-prev loading-fade-out-instant';
    }

    return screenClass;
  }

  useEffect(() => {
    if (battleKarts.length) {
      changeScreen(screens.BATTLE_SETUP);
    }
  }, [battleKarts]);

  useEffect(() => {
    if (battleResult && battleResult.metadata) {
      setBattleConfig(battleResult);
      setScreen(screens.BATTLE_SETUP);
    }
  }, [battleResult]);

  function getGaragePanelTabs() {
    let equipActiveClass = garagePanel === 'equip' ? ' br-pill-active ' : '';
    let pimpActiveClass = garagePanel === 'pimp' ? ' br-pill-active ' : '';

    return (
      <div className='br-pills'>
        <div
          className={'br-pill br-pill-left' + equipActiveClass}
          onClick={(e) => setGaragePanel('equip')}
        >
          Equipment
        </div>
        <div
          className={'br-pill br-pill-right' + pimpActiveClass}
          onClick={(e) => setGaragePanel('pimp')}
        >
          Pimping
        </div>
      </div>
    );
  }

  function getMaxWeaponIndexForLevel(level) {
    if (!level) {
      level = 0;
    }
    let weapon_index = Math.max(level + 2, 3);
    return weapon_index;
  }

  function getScreenPostBattle(postBattleScreen) {
    let content;

    if (postBattleScreen === postBattleScreens.RESULT) {
      content = (
        <div className='br-post-battle-panel br-post-battle-result'>
          {battle.winner === 0 ? (
            <div className='br-post-battle-text br-post-battle-result-won'>
              {exclamation(getText('text_you_won'))}
            </div>
          ) : (
            <div className='br-post-battle-text br-post-battle-result-lost'>
              {exclamation(getText('text_you_lost'))}
            </div>
          )}
        </div>
      );
    } else if (postBattleScreen === postBattleScreens.LEVEL_UP) {
      content = (
        <div className='br-post-battle-panel br-post-battle-level-up-start'>
          <h3 className='br-post-battle-title br-level-up'>
            {exclamation(getText('text_level_up'))}
          </h3>
          <div className='br-post-battle-text br-level-up-level'>
            {nftData.level}
          </div>
        </div>
      );
    } else if (postBattleScreen === postBattleScreens.PRIZE_PREPARE) {
      content = (
        <div className='br-post-battle-panel br-post-battle-prize-prepare'>
          <h3 className='br-post-battle-title br-prize'>
            {getText('text_prize')}
          </h3>
          <div className='br-prize-spinner'>
            <div className='br-question-mark br-question-mark-anim'></div>
          </div>
        </div>
      );
    } else if (postBattleScreen === postBattleScreens.PRIZE_RESULT) {
      let prizeSummary;
      let title = exclamation(getText('text_no_prize'));
      let image;
      let decalName;
      title = getText('text_won_prize', { prize_name: decalName });
      if (battle.prize > 0) {
        decalName = partIdToName('decals', battleConfig.prize.toString());
        image = getTextureURL('badge', battle.prize.toString());
      } else {
        decalName = getText('text_no_prize');
        prizeSummary = getText('text_better_luck');
      }

      content = (
        <div className='br-post-battle-panel br-post-battle-prize-result'>
          <h3 className='br-post-battle-title br-prize'>{title}</h3>
          {image ? (
            <img className='br-prize-image' src={image} alt='Prize' />
          ) : (
            ''
          )}
          <div className='br-post-battle-text'>
            {decalName ? decalName : ''}
          </div>
          {prizeSummary ? (
            <div className='br-prize-summary loading-fade-in'>
              {' '}
              {prizeSummary}{' '}
            </div>
          ) : (
            ''
          )}
        </div>
      );
    } else if (postBattleScreen === postBattleScreens.END) {
      content = (
        <div className='br-post-battle-panel br-post-battle-end'>
          <div className='br-post-battle-end-panel'>
            <div className='br-post-battle-end-replay'>
              <BrButton
                label='Replay'
                id='br-post-battle-replay-button'
                className='br-button'
                onClick={(e) => replay()}
              />
            </div>
            <div className='br-post-battle-end-garage'>
              <BrButton
                label={getText('text_return_to_garage')}
                id='br-post-battle-garage-button'
                className='br-button'
                onClick={(e) => changeScreen(screens.GARAGE)}
              />
            </div>
          </div>
        </div>
      );
    }

    return <div className='br-post-battle-screen'>{content}</div>;
  }

  function getScreenGarage() {
    let nftListUI;

    nftListUI = (
      <div className='br-nft-gallery'>
        {tokensLoaded ? displayNFTs(nftList, activeTokenId) : ''}
        {!nftList.length ? (
          <div className='br-info-message-start'>
            <i className='fa fa-info br-info-icon'></i>
            <div className='br-space-right'>{getText('text_help_welcome')}</div>
            <BrButton
              label='The System'
              id='helpMore'
              className='br-button'
              onClick={(e) => showModal()}
            />
          </div>
        ) : (
          ''
        )}
        {nftList.length && nftData.level > 0 ? (
          <BrButton
            label='Battle'
            id='gameSimpleBattle'
            className='br-button'
            onClick={(e) => startBattle()}
            isSubmitting={processingActions['gameSimpleBattle']}
          />
        ) : (
          ''
        )}
      </div>
    );

    return (
      <Fragment>
        <div
          className={
            'br-screen br-screen-garage ' + getScreenClass(screens.GARAGE)
          }
        >
          {nftListUI}
          <div className='br-garage loading-fade-in'>
            <div className='br-strange-juice-3d' ref={threeRef}>
              <div className='br-3d-overlay loading-fade-out-slow'></div>
              <div className='br-level'>
                {getText('text_level')}
                <div className='br-level-number'>{nftData.level}</div>
              </div>
              <button
                className='br-autorotate-button br-button br-icon-button'
                onMouseDown={toggleAutoRotate}
              >
                <i className='fa fa-sync-alt'></i>
              </button>
            </div>
            <div className='br-strange-juice-overlay'>
              {getGaragePanelTabs()}
              {getControlUI(gameConfig, nftData)}
              {getContractControls()}
            </div>
          </div>

          <div className='br-offscreen'>
            <div
              className='br-photo-composer'
              ref={photoComposerRef}
              style={{ width: wPhoto, height: hPhoto }}
            >
              <img className='br-photo-frame' src={imageFrame} alt='Frame' />
              <img
                alt='Kart NFT'
                src={imageDataURL}
                style={{
                  width: '400px',
                  height: '400px',
                  borderRadius: '80px',
                }}
              />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

  function getScreenBattleSetup() {
    return (
      <div
        className={
          'br-screen br-screen-battle-setup ' +
          getScreenClass(screens.BATTLE_SETUP)
        }
      >
        <div className='br-back-button-holder'>
          <BrButton
            label={<i className='fa fa-arrow-left'></i>}
            id='go-battle-setup-to-garage'
            className='br-button'
            onClick={(e) => changeScreen(screens.GARAGE)}
          />
        </div>
        <h1>{getText('text_battle_arena')}</h1>
        {battleKarts.length ? (
          <div className='br-battle-setup'>
            <div className='br-battle-setup-home'>
              <h3>{getText('text_your_kart')}</h3>
              <div className='br-battle-setup-home-kart'>
                <img
                  className={'br-battle-viewer-image'}
                  alt='Home Kart'
                  src={getImageURL(battleKarts[0].media)}
                />
                <div className='br-battle-setup-home-kart-name'>
                  {kartName(battleKarts[0].title)}
                </div>
              </div>
            </div>
            <div className='br-battle-setup-vs'>
              <h1>{getText('text_vs')}</h1>
              <BrButton
                label='Battle'
                id='battle'
                className='br-button'
                onClick={(e) => watchBattle()}
              />
            </div>
            <div className='br-battle-setup-away'>
              <h3>{getText('text_opponent_kart')}</h3>
              <div className='br-battle-setup-home-kart'>
                <img
                  className={'br-battle-viewer-image'}
                  alt='Home Kart'
                  src={getImageURL(battleKarts[1].media)}
                />
                <div className='br-battle-setup-away-kart-name'>
                  {kartName(battleKarts[1].title)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='br-battle-setup-loading-panel'>
            <h3>{getText('text_battle_waiting_1')}</h3>
          </div>
        )}
      </div>
    );
  }

  function replay() {
    setPostBattleScreen(
      DEBUG_FORCE_POST_BATTLE ? postBattleScreens.RESULT : postBattleScreen.NONE
    );
    setLineIndex(0);
    setGroupIndex(0);
    setBattlePower([100, 100]);
    setReplayReq(replayReq + 1);
    setBattleEnded(false);
  }

  function getScreenBattle() {
    let ui;
    if (battle.battle && battleText.length) {
      let homeMetadata = battle.metadata[0];
      let awayMetadata = battle.metadata[1];

      ui = (
        <div className='br-battle-viewer'>
          <div
            className={
              'br-battle-viewer-panel' +
              (battleAttacking[0] ? ' br-battle-viewer-attacking ' : '') +
              (battleHit[0] ? ' box-hit ' : '')
            }
          >
            <div className='br-battle-viewer-kart-details'>
              {kartName(homeMetadata.title)}
            </div>
            <div className='br-power-bar-panel'>
              <div
                className={
                  'br-power-bar-outer' +
                  (battleHit[0] ? ' br-anim-shake-short br-hurt' : '')
                }
              >
                <div
                  className='br-power-bar-inner'
                  style={{ width: `${battlePower[0]}%` }}
                ></div>
              </div>
              <div className='br-power'>{battlePower[0]}</div>
            </div>
            <div className='br-battle-viewer-image-panel'>
              <img
                className={
                  'br-battle-viewer-image ' + (battleHit[0] ? 'box-hit' : '')
                }
                alt='Home Kart'
                src={getImageURL(homeMetadata.media)}
              />
            </div>
          </div>
          <div className='br-battle-viewer-main-panel'>
            {postBattleScreen !== postBattleScreens.NONE
              ? getScreenPostBattle(postBattleScreen)
              : ''}

            {(battleAttacking[0] || battleAttacking[1]) &&
            !(battleHit[0] || battleHit[1]) ? (
              <div className='br-battle-visuals'>
                <div
                  className={
                    'br-battle-arrows br-battle-arrows-anim' +
                    (battleAttacking[1] ? ' br-reverse ' : '')
                  }
                ></div>
              </div>
            ) : (
              ''
            )}

            {displayBattleText(battleText)}
          </div>
          <div
            className={
              'br-battle-viewer-panel' +
              (battleAttacking[1] ? ' br-battle-viewer-attacking ' : '') +
              (battleHit[1] ? ' box-hit ' : '')
            }
          >
            <div className='br-battle-viewer-kart-details'>
              {kartName(awayMetadata.title)}
            </div>
            <div className='br-power-bar-panel'>
              <div
                className={
                  'br-power-bar-outer' +
                  (battleHit[1] ? ' br-anim-shake-short br-hurt' : '')
                }
              >
                <div
                  className='br-power-bar-inner'
                  style={{ width: `${battlePower[1]}%` }}
                ></div>
              </div>
              <div className='br-power'>{battlePower[1]}</div>
            </div>
            <div className='br-battle-viewer-image-panel'>
              <img
                className={
                  'br-battle-viewer-image ' + (battleHit[1] ? 'box-hit' : '')
                }
                alt='Away Kart'
                src={getImageURL(awayMetadata.media)}
              />
            </div>
          </div>
        </div>
      );
    } else {
      ui = (
        <div className='br-screen-battle-no-battle'>
          <h3>{getText('text_battle_loading')}</h3>
        </div>
      );
    }

    return (
      <div
        className={
          'br-screen br-screen-battle ' + getScreenClass(screens.BATTLE)
        }
      >
        <div className='br-back-button-holder'>
          <BrButton
            label={<i className='fa fa-arrow-left'></i>}
            id='go-battle-to-garage'
            className='br-button'
            onClick={(e) => changeScreen(screens.GARAGE)}
          />
        </div>
        <h2>{getText('text_battle')}</h2>
        <div className='br-battle-controls-holder'>
          <BrButton
            label='Replay'
            id='go-battle-to-garage'
            className='br-button'
            onClick={(e) => replay()}
          />
        </div>
        {ui}
      </div>
    );
  }

  return (
    <div className='br-screen-container'>
      {getScreenGarage()}
      {getScreenBattleSetup()}
      {getScreenBattle()}

      <div className='br-photo-booth' ref={threePhotoRef}></div>
    </div>
  );
}

export default NearKarts;
