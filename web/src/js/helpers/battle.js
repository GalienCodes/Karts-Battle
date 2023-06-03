import { cloneObj } from "./helpers";
import getText, { getBattleText, exclamation } from "../../data/world/text";
import seedrandom from 'seedrandom';
import { getRandomInt, getRandomListEntry, shuffleArray } from "./math";

const battleText = getBattleText();

export default class Battle {
  constructor() { 
    let battleTexts = {};

    for(let id of Object.keys(battleText)) {
      let idParts = id.split('_');
      let type = idParts[2];
      let subType = idParts[3];

      if(!(type in battleTexts)) {
        battleTexts[type] = {};
      }

      if(!(subType in battleTexts[type])) {
        battleTexts[type][subType] = [];
      }

      battleTexts[type][subType].push(battleText[id]);
    }

    this.battleTexts = battleTexts;
  }
  
  reset() {
    this.finished = false;
    this.rounds = [];
    this.roundIndex = 0;
  }

  load(battleResult) {
    this.battleResult = cloneObj(battleResult);
    this.kartIDs = [this.battleResult.home_token_id, this.battleResult.away_token_id];
    this.kartNames = [this.kartName(this.battleResult.metadata[0].title), this.kartName(this.battleResult.metadata[1].title)];
    this.kartImages = [this.battleResult.metadata[0].media, this.battleResult.metadata[1].media]
    this.karts = [this.battleResult.karts[0], this.battleResult.karts[1]];
    this.winnerName = this.kartNames[this.battleResult.winner];
    this.finished = false;
    this.rounds = [];
    this.roundIndex = 0;
    this._initWeapons();
    this.generate();
  }

  _initWeapons() {
    let weapons = [[], []];
    let shields = [[], []];

    for(let i = 0; i < 2; i++) {
      let kartConfig = this.battleResult.kartConfigs[i];

      for(let part of ['left', 'right', 'front']) {
        if(kartConfig[part] && !kartConfig[part].endsWith('Empty')) {
          if(kartConfig[part].startsWith('Weapon')) {
            weapons[i].push(kartConfig[part].replace('Weapon', '').toLowerCase());
          }
          else if(kartConfig[part].startsWith('Shield')) {
            shields[i].push(kartConfig[part].replace('Shield', '').toLowerCase());
          }
        }
      }
    }

    this.kartWeapons = weapons;
    this.kartShields = shields;
  }

  kartName(kartTitle) {
    return kartTitle.replace('A NEAR Kart Called ', '');
  }

  generate() {
    let battleSeed = this.battleResult.battle.toString();
    this.rng = seedrandom(battleSeed); 

    this.rounds = [];
    let winner = this.battleResult.winner;
    let loser = 1 - winner;

    let score1 = 0;
    let roundScores1 = [];
    let score2= 0;
    let roundScores2 = [];

    let roundIndex = 0;

    let SHIELD_CHANCE = 5;
    let BUMP_CHANCE_BY_WEAPON_COUNT = [2, 4, 8];
    let BOTTOM_SCORE = 10;
    let TOP_SCORE = 30;
    let POWER_SCORE = 26;

    do {
      let roundScore = 0;
      let miss1 = getRandomInt(0, SHIELD_CHANCE, this.rng) === 0;

      if(!miss1) {
        roundScore = getRandomInt(BOTTOM_SCORE, TOP_SCORE, this.rng);
        score1 += roundScore;
      }

      let weapon = getRandomListEntry(this.kartWeapons[winner], this.rng);

      let bumpChance = BUMP_CHANCE_BY_WEAPON_COUNT[this.kartWeapons[winner].length];
      if(!weapon || getRandomInt(0, bumpChance, this.rng) === 0) {
        weapon = 'general';
      }
      
      let shield;

      if(roundScore === 0) {
        shield = getRandomListEntry(this.kartShields[loser], this.rng);

        if(!shield) {
          shield = 'evade';
        }
      }

      roundScores1[roundIndex++] = { aggressor: winner, score: roundScore, weapon, shield };

    } while(score1 < 100);

    roundIndex = 0;
    do {
      let roundScore = 0;
      let miss1 = getRandomInt(0, SHIELD_CHANCE, this.rng) === 0;

      if(!miss1) {
        roundScore = getRandomInt(BOTTOM_SCORE, TOP_SCORE, this.rng);
        score2 += roundScore;
      }

      let weapon = getRandomListEntry(this.kartWeapons[loser], this.rng);

      let bumpChance = BUMP_CHANCE_BY_WEAPON_COUNT[this.kartWeapons[loser].length];
      if(!weapon || getRandomInt(0, bumpChance, this.rng) === 0) {
        weapon = 'general';
      }

      let shield;

      if(roundScore === 0) {
        shield = getRandomListEntry(this.kartShields[winner], this.rng);

        if(!shield) {
          shield = 'evade';
        }
      }

      roundScores2[roundIndex++] = { aggressor: loser, score: roundScore, weapon, shield }; 

    } while(score2 < 90);

    roundScores2.pop();

    let winningRound = roundScores1.pop();

    let rounds = [...roundScores1, ...roundScores2];
    shuffleArray(rounds, this.rng);
    rounds.push(winningRound);

    let playIndex = 0;
    let totals = [0, 0];

    for(let round of rounds) {
      let text = '';

      totals[round.aggressor] += round.score;
      round.totals = [...totals];

      let roundDetails = {
        text: [],
        data: round
      }

      let weapon = round.weapon;
      let shield = round.shield;
      let aggressor = round.aggressor;
      let victim = 1 - aggressor; 
      let score = round.score;

      text = getRandomListEntry(this.battleTexts['attack'][weapon], this.rng);
      text = text.replace('{aggressor}', this.kartNames[aggressor]);
      text = text.replace('{victim}', this.kartNames[victim]);
      roundDetails.text.push(text);

      if(shield) {
        text = getRandomListEntry(this.battleTexts['shield'][shield], this.rng);
        text = text.replace('{aggressor}', this.kartNames[aggressor]);
        text = text.replace('{victim}', this.kartNames[victim]);
        roundDetails.text.push(text);
      }
      else {
        text = getRandomListEntry(this.battleTexts['hit'][weapon], this.rng);
        text = text.replace('{aggressor}', this.kartNames[aggressor]);
        text = text.replace('{victim}', this.kartNames[victim]);

        if(this.battleTexts['hittype'][weapon]) {
          let hitType = getRandomListEntry(this.battleTexts['hittype'][weapon], this.rng);
          text = text.replace('{hittyped}', hitType);
        }

        roundDetails.text.push(text);

        if(score >= POWER_SCORE) {
          let colorTexts = this.battleTexts['color'][weapon];
          if(!colorTexts) colorTexts = this.battleTexts['color']['general']; 

          text = getRandomListEntry(colorTexts, this.rng);
          text = text.replace('{aggressor}', this.kartNames[aggressor]);
          text = text.replace('{victim}', this.kartNames[victim]);

          roundDetails.text.push(exclamation(text));
        }
      }

      if(++playIndex === rounds.length) {
        text = getText('text_battle_battle_won').replace('{winner}', this.winnerName);
        roundDetails.text.push(text);
      }
      
      this.rounds.push(roundDetails);
    }
  }

  next() {
    let round = this.rounds[this.roundIndex];

    if(++this.roundIndex >= this.rounds.length) {
      this.finished = true;
    }

    return round;
  }

  ended() {
    this.finished = true;
  }
}

