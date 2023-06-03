const text_consts = {
  "app_name": "NEAR Karts",
  "nft_name": "NEAR Kart",
  "nft_short_name": "Kart",
  "blockchain_name": "NEAR",
  "mint_price": "0.1 NEAR",
  "upgrade_price": "0.1 NEAR"
}

const text_battle = {
  "en": {
    "text_battle_attack_general_1": `{aggressor} tries to ram {victim}`,
    "text_battle_attack_general_2": `{aggressor} drives menacingly towards {victim}`,
    "text_battle_attack_general_3": `{aggressor} goes in on {victim}`,
    "text_battle_attack_general_4": `{aggressor} tries to bump {victim} like it's dodgems`,
    "text_battle_attack_general_5": `{aggressor} goes for a direct hit`,
    "text_battle_attack_laser_1": `{aggressor} fires their "L A S E R"`,
    "text_battle_attack_rocket_1": `{aggressor} launches a rocket`,
    "text_battle_attack_fist_1": `{aggressor} throws some nuts`,
    "text_battle_attack_flamethrower_1": `{aggressor} lights up the arena with the flamethrower`,
    "text_battle_attack_aceed_1": `{aggressor} pumps out some hardcore acid`,
    "text_battle_attack_aceed_2": `{aggressor} ejects a jet of acid`,
    "text_battle_attack_aceed_3": `{aggressor} fires a stream of acid towards {victim}`,
    "text_battle_attack_flipper_1": "{aggressor} gets in close and trys the flipper",
    "text_battle_attack_sword_1": "{aggressor} strikes with the sword",
    "text_battle_attack_axe_1": "{aggressor} brings the axe crashing down on {victim}",
    "text_battle_attack_axe_2": "{aggressor} tries to chop {victim} with the axe",
    "text_battle_attack_hammer_1": "{aggressor} tries to pound {victim} with the hammer",
    "text_battle_attack_hammer_2": "{aggressor} brings the hammer down on {victim}",

    "text_battle_hittype_flamethrower_1": "sizzled",
    "text_battle_hittype_flamethrower_2": "toasted",

    "text_battle_hit_general_1": `{victim} suffers damage`,
    "text_battle_hit_general_2": `{victim} looks bashed up`,
    "text_battle_hit_general_3": `It puts a dent in {victim}`,
    "text_battle_hit_laser_1": `The laser cuts through {victim}`,
    "text_battle_hit_laser_2": `It burns a hole in {victim}`,
    "text_battle_hit_rocket_1": `It explodes on {victim}`,
    "text_battle_hit_rocket_2": `It blasts {victim} across the arena`,
    "text_battle_hit_fist_1": `The workings of {victim} are compromised`,
    "text_battle_hit_fist_2": `{victim} got filled with nut shape holes`,
    "text_battle_hit_flamethrower_1": `{victim}'s kart is {hittyped}`,
    "text_battle_hit_aceed_1": `{victim} got a face full`,
    "text_battle_hit_aceed_2": `{victim} got squelched by 303 millilitres of acieed`,
    "text_battle_hit_aceed_3": `{victim} feels a bit melty`,
    "text_battle_hit_flipper_1": `{victim} spins and crashes to the ground`,
    "text_battle_hit_flipper_2": `{victim} goes flying`,
    "text_battle_hit_sword_1": `It cuts through {victim}'s kart like a knife through butter`,
    "text_battle_hit_sword_2": `{victim} got sliced like a loaf`,
    "text_battle_hit_axe_1": `It takes a piece out of {victim}`,
    "text_battle_hit_axe_2": `{victim} got chopped`,
    "text_battle_hit_hammer_1": `{victim} gets squashed`,
    "text_battle_hit_hammer_2": `{victim} takes a pounding`,
    "text_battle_waiting_1": `Waiting for battle karts to be selected...`,

    "text_battle_color_aceed_1": 'That was naughty, very naughty',
    "text_battle_color_aceed_2": 'Acieed... Acieed',
    "text_battle_color_aceed_3": '{victim} is not looking smiley',
    "text_battle_color_flamethrower_1": '{victim} is on fire today... But not in a good way',
    "text_battle_color_flamethrower_2": "It's getting hot in here",
    "text_battle_color_fist_1": "Thunderfist!",
    "text_battle_color_fist_2": "{victim} looks screwed up",
    "text_battle_color_hammer_1": "Stop    ...Hammertime",
    "text_battle_color_general_1": 'That was cold blooded',
    "text_battle_color_general_2": 'That was brutal',
    "text_battle_color_general_3": 'Holy cow',
    "text_battle_color_general_4": 'Bosh',
    "text_battle_color_general_5": 'Epic',

    "text_battle_shield_evade_1": "{aggressor}'s aim is off",
    "text_battle_shield_evade_2": "{victim} dodges",
    "text_battle_shield_evade_3": "{victim} executes an evasive manouvre",
    "text_battle_shield_evade_4": "{victim}'s body work holds steady",

    "text_battle_shield_kitten_1": "{victim}'s fluffy kitten paws it away",
    "text_battle_shield_kevlar_1": "{victim}'s kevlar shield blocks the attack",
    "text_battle_shield_kevlar_2": "{victim}'s kevlar shield holds steady",

    "text_battle_battle_won": `{winner} wins the battle!!`,
    "text_you_won": "Victorious",
    "text_you_lost": "Defeated",
    "text_won_prize": "You won",
    "text_prize": "Prize",
    "text_level_up": "Level Up",
    "text_new_nft_name": `New ${text_consts.nft_name}`,
    "text_no_prize": "Fresh Air",
    "text_better_luck": "Better luck next time",
    "text_return_to_garage": "Return To Garage"
  }
};

const text = {
  "en": {
    "text_kart_name_label": `Enter ${text_consts.nft_name} name...`,
    "text_battle_started": `Battle has commenced!!`,
    "text_no_battle": `No battle to watch`,
    "text_battle_loading": `Arena is being prepared for battle...`,
    "text_battle_arena": `Battle Arena`,
    "text_battle": `Battle`,
    "text_your_kart": `Your ${text_consts.nft_short_name}`,
    "text_opponent_kart": `Opponent ${text_consts.nft_short_name}`,
    "text_vs": `Vs`,
    "text_get_new_decals": `Get new decals by winning battles!`,
    "text_unlock_items": `Unlock items as you rise through the levels!`,
    "text_creating_image": `Photographing ${text_consts.nft_name} for NFT`,
    "text_mint_request": `Minting on ${text_consts.blockchain_name} blockchain`,
    "text_upgrade_request": `Upgrading on ${text_consts.blockchain_name} blockchain`,
    "text_finding_opponent": `Finding opponent on ${text_consts.blockchain_name} blockchain`,
    "text_locked": `${text_consts.nft_name} is locked for upgrades`,
    "text_next_upgrade": `Next upgrade at level {next_upgrade_level}`,
    "text_upgrade_save": `Upgrade and save your ${text_consts.nft_short_name} on ${text_consts.blockchain_name}`,
    "text_level": `Level`,
    "text_leaderboard_waiting": `Leaderboard is waiting for data`,
    "text_leaderboard_processing": `New battle results are added after a short processing time`,


    "text_help_welcome": `Welcome to ${text_consts.app_name}`,
    "text_help_near_karts": `${text_consts.app_name} is a system for creating Battle Kart NFTs`,
    "text_help_garage": `In your garage you equip and pimp your ${text_consts.nft_name}.`,
    "text_help_equip_pimp": `Equip and pimp your ${text_consts.nft_name}`,
    "text_help_mint": `Mint it on the ${text_consts.blockchain_name} blockchain for ${text_consts.mint_price}`,
    "text_help_garage_title": `Garage`,
    "text_help_battle_title": `Battles`,
    "text_help_battle": `Each battle won increases your ${text_consts.nft_name} level by 1`,
    "text_help_level_up": `Unlock items as your level increases`,
    "text_help_upgrade": `You can upgrade and save your ${text_consts.nft_name} once every 5 levels`,
    "text_help_kart_name": `The name of your ${text_consts.nft_name} cannot be changed so choose wisely!`,
    "text_help_no_equip_benefit": `Your equipment does not effect on the battle outcome`,
    "text_help_look_cool": `It just makes your ${text_consts.nft_name} look cool!`,
    "text_try_later": `Please try again later`,

    "text_alpha_warning": `${text_consts.app_name} is an alpha demo running on ${text_consts.blockchain_name} testnet`,
    "text_data_loss_warning": `${text_consts.nft_name} and data may be removed as the app is developed`,

    "success_save_kart": `${text_consts.nft_name} saved!!`,
    "success_image_upload": `${text_consts.nft_short_name} image uploaded`,

    "error_chain_unavailable": `${text_consts.blockchain_name} is currently unavailable`,
    "error_save_kart": `Error saving ${text_consts.nft_name}`,
    "error_no_active_kart": `No ${text_consts.nft_name} is active`,
    "error_check_console": "Check console for details",
    "error_mint_kart": `Error minting ${text_consts.nft_name}`,
    "error_upgrade_kart": `Error upgrading ${text_consts.nft_name}`,
    "error_starting_battle": `Error starting battle`,
    "error_no_opponent_selected": `Error no opponent selected`,
    "error_no_battle_self": `Error ${text_consts.nft_name} cannot battle self`,
    "error_no_kart_name": `No name supplied for ${text_consts.nft_name}`,
    "error_image_upload_failed": `Image upload failed`,
    "error_upgrade_kart_locked": `${text_consts.nft_name} is locked for upgrades`,
    "error_signature_verification_failed": `Signature verification of cid failed`,
    "error_pubkey_is_not_signer": `Pub Key is not a registered signer`,
    "error_mint_payment_too_low": `Minting requires an attached deposit of at least ${text_consts.mint_price}`,
    "error_upgrade_payment_too_low": `Upgrade requires an attached deposit of at least ${text_consts.upgrade_price}`
  }
};

const langs = ["en"];
let lang = langs[0];

for(let lang of langs) {
  Object.assign(text[lang], text_battle[lang]);
}

export default function getText(id, replacements) {
  let t = text[lang][id] || id;
  if(replacements) {
    for(let k of Object.keys(replacements)) {
      t = t.replaceAll(`{${k}}`, `${replacements[k]}`);
    }
  }
  return t;
}

export function getBattleText() {
  return text_battle[lang];
}

export function exclamation(text) {
  return text + '!!';
}