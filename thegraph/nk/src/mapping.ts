import { near, BigInt, json, log } from "@graphprotocol/graph-ts"
import { NearKartsSimpleBattle, ScoreDaily, ScoreMonthly, NearKart } from "../generated/schema"

export function handleReceipt(
  receiptWithOutcome: near.ReceiptWithOutcome
): void {

  receiptWithOutcome.block.header
  let logs = receiptWithOutcome.outcome.logs;
  let homeAccount = receiptWithOutcome.receipt.predecessorId;
  let tsStr = receiptWithOutcome.block.header.timestampNanosec.toString();
  let msInDay = BigInt.fromI32(86400000)
  let msInMonth = BigInt.fromI64(2592000000);
  let timestampNano = BigInt.fromString(tsStr);
  let timestamp = timestampNano.div(BigInt.fromU64(1e6 as u64));
  let period = timestamp.div(msInDay);
  let periodMonth = timestamp.div(msInMonth);

  for(let i = 0; i < logs.length; i++) {
    let eventStr = '';
    let l = logs[i];

    if(l.startsWith('EVENT_JSON:')) {
      let obj = json.try_fromString(l.replace('EVENT_JSON:', ''));

      if(obj.isOk) {
        let jo = obj.value.toObject();
        let event = jo.get('event');
        eventStr = event ? event.toString() : '';

        log.info('ev {}', [eventStr]);
        if(eventStr == 'nft_mint') {
          let data = jo.get('data');
          let dataObj = data ? data.toArray() : null;
          let mintInfoJsonValue = dataObj ? dataObj[0] : null;
          let mintInfo = mintInfoJsonValue ? mintInfoJsonValue.toObject() : null;

          if(mintInfo) {
            let tokenIdJsonValue = mintInfo.get('token_ids');
            let tokenId = tokenIdJsonValue ? tokenIdJsonValue.toArray()[0].toString() : '';

            if(tokenId) {
              let entity = new NearKart(tokenId)

              entity.ownerId = homeAccount;
              entity.tokenId = tokenId;
              entity.save();
            }
          }
        }
        else if(eventStr == 'configure_on_mint' || eventStr == 'configure_on_upgrade') {
          let data = jo.get('data');
          let kartMeta = data ? data.toObject() : null;

          if(kartMeta) {
            let tokenIdJsonValue = kartMeta.get('token_id');
            let tokenId = tokenIdJsonValue ? tokenIdJsonValue.toString() : '';

            if(tokenId) {
              let nameJsonValue = kartMeta.get('name');
              let name = nameJsonValue ? nameJsonValue.toString() : '';

              let mediaJsonValue = kartMeta.get('media');
              let media = mediaJsonValue ? mediaJsonValue.toString() : '';

              let nearKart = NearKart.load(tokenId);
              
              if(nearKart) {
                nearKart.name = name;
                nearKart.media = media;
                nearKart.mediaHistory = nearKart.mediaHistory ? nearKart.mediaHistory as Array<string> : [media];
                nearKart.save();
              }
            }
          }
        }
        else if(eventStr == 'game_simple_battle') {
          let data = jo.get('data');
          let dataObj = data ? data.toObject() : null;

          if(dataObj) {
            let entity = new NearKartsSimpleBattle(receiptWithOutcome.receipt.id.toHex())

            entity.homeAccount = homeAccount;
            entity.timestamp = timestamp;

            let homeTokenId = dataObj.get('home_token_id');
            entity.homeTokenId = homeTokenId ? homeTokenId.toString() : '';

            let awayTokenId = dataObj.get('away_token_id');
            entity.awayTokenId = awayTokenId ? awayTokenId.toString() : '';

            let winner = dataObj.get('winner');
            entity.winner = winner ? winner.toI64() as i32 : 0;
            
            let battle = dataObj.get('battle');
            entity.battle = battle ? battle.toBigInt() : new BigInt(0);

            let prize = dataObj.get('prize');
            entity.prize = prize ? prize.toString() : '';

            let extra = dataObj.get('extra');
            entity.extra = extra ? extra.toString() : '';

            entity.save();

            let nearKart = NearKart.load(entity.homeTokenId);

            if(nearKart) {
              let scoreDailyId = entity.homeTokenId + '_' + period.toString();
              let scoreDailyEntity = ScoreDaily.load(scoreDailyId);

              if(!scoreDailyEntity) {
                scoreDailyEntity = new ScoreDaily(scoreDailyId);
              }

              scoreDailyEntity.period = period;
              if(entity.winner == 0) {
                scoreDailyEntity.numWins++;
              }
              else {
                scoreDailyEntity.numLosses++;
              }

              scoreDailyEntity.nearKart = entity.homeTokenId;
              scoreDailyEntity.save();

              let scoreMonthlyId = entity.homeTokenId + '_' + periodMonth.toString();
              let scoreMonthlyEntity = ScoreMonthly.load(scoreMonthlyId);

              if(!scoreMonthlyEntity) {
                scoreMonthlyEntity = new ScoreMonthly(scoreMonthlyId);
              }

              scoreMonthlyEntity.period = periodMonth;
              if(entity.winner == 0) {
                scoreMonthlyEntity.numWins++;
              }
              else {
                scoreMonthlyEntity.numLosses++;
              }

              scoreMonthlyEntity.nearKart = entity.homeTokenId;
              scoreMonthlyEntity.save();
            }
          }
        }
      }
      else {
        log.info('Unregistered event {}', [obj.value.toString()]);
      }
    }
  }
}
