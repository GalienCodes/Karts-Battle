/** @suppress {duplicate} */
var cbTennis = cbTennis || {}; 

(function(t) {
	"use strict";

	t.playerList = {
		loadPlayers: function(players, unlocked)
		{
			my.playerRankings = my.rankPlayers(players);
			my.orderPlayers(players);
			my.players = players;
		},
		getPlayerInfo(playerID) {
			return t.playerConfig.find(x => x['id'] == playerID);
		},
		getPlayerInfos: function(playerIDs)
		{
			var playerInfos = [];
			for(var i = 0; i < playerIDs.length; i++)
			{
				playerInfos.push(my.getPlayerInfo(playerIDs[i]));
			}
			return playerInfos;
		},
		getActivePlayers: function() {
			var playerInfos = [];

			for(var i = 0; i < my.players.length; i++)
			{
				var playerInfo = my.players[i];
				var playerID = playerInfo['id'];
				if(!my.playerHasTag(playerID, "inactive")) {
					playerInfos.push(playerInfo);
				}
			}
			return playerInfos;
		},
		getName: function(playerID, format)
		{
			var name = "";
			var playerInfo = my.getPlayerInfo(playerID);

			switch(format)
			{
				case "lastName":
					name = playerInfo["lastName"];
					break;
				default:
					name = playerInfo["firstName"] + " " + playerInfo["lastName"];
					break;
			}
			
			return name;
		},
		playerHasTag: function(playerID, tag) {
			var hasTag = false;
			var playerInfo = my.getPlayerInfo(playerID);
			if(playerInfo["tags"] && playerInfo["tags"].indexOf(tag) != -1) {
				hasTag = true;
			}
			return hasTag;
		},
		orderPlayers: function(players) {
			var player = null;
			var playerRankData = null;

			my["playerOrder"] = my.playerOrder = [];

			for(var i = 0; i < my.playerRankings.length; i++)
			{
				playerRankData = my.playerRankings[i];
				player = players[playerRankData[0]];
				if(t.profile.isUnlockedPlayer(player.id))
				{
					my.playerOrder.push(player.id);
				}
			}

			for(i = 0; i < my.playerRankings.length; i++)
			{
				playerRankData = my.playerRankings[i];
				player = players[playerRankData[0]];
				if(!t.profile.isUnlockedPlayer(player.id))
				{
					my.playerOrder.push(player.id);
				}
			}
		},
		sortSkills: function(playerData)
		{
			var skillRating = 0;
			var skills = playerData["skills"];
			var skillsArray = [];

			var fillCallback = function(v, k) {
				skillRating = parseInt(v, 10); 
				skillsArray.push([k, skillRating]);
			};
			_.each(skills, fillCallback);

			var sortCallback = function(v) {
				return -v[1];
			};
			skillsArray = _.sortBy(skillsArray, sortCallback);

			return skillsArray;
		},
		rankPlayers: function(playerData)
		{
			var skillLevels = [];
			for(var i = 0; i < playerData.length; i++)
			{
				var pData = playerData[i];
				var total = 0;
				var num = 0;
				_.each(pData["skills"], function(v, skillName) {
					total += parseInt(v, 10);
					num++;
				});
				var avg = total / num;
				skillLevels[i] = [i, avg, playerData[i]["id"]];
			}

			skillLevels.sort(function(a, b) {
				return b[1] - a[1];
			});

			return skillLevels;
		},
		getRank: function(playerIndex, skillLevels)
		{
			for(var i = 0; i < skillLevels.length; i++)
			{
				var skillData = skillLevels[i];
				if(skillData[0] === playerIndex)
				{
					return i + 1;
				}
			}
		},
		getRankForID: function(id)
		{
			var players = [];
			var index = 0;

			for(var i = 0; i < my.playerOrder.length; i++)
			{
				var playerID = my.playerOrder[i];
				players.push(my.getPlayerInfo(playerID));
				if(id === playerID)
				{
					index = i;
				}
			}
			
			var playerRankings = my.rankPlayers(players);

			var rank = my.getRank(index, playerRankings); 

			return rank;
		},
		getRankStr: function(rank)
		{
			return rank + "/" + my.playerOrder.length;
		},
		getSkillName: function(skillID)
		{
			var skillNames = {
				"speed": "Speed",
				"touch": "Touch",
				"power": "Power",
				"reaction": "Reaction",
				"accuracy": "Accuracy",
				"stamina": "Stamina",
				"mentality": "Mentality",
				"servePower": "Serve Power",
				"serveAccuracy": "Serve Accuracy",
				"forehand": "Forehand",
				"backhand": "Backhand",
				"volley": "Volley",
				"smash": "Smash",
				"drop": "Drop",
				"lob": "Lob"
			};

			return skillNames[skillID];
		},
		
	};
	var my = t.playerList;

	my["getName"] = my.getName;
	my["playerOrder"] = my.playerOrder;
	my["sortSkills"] = my.sortSkills;
	my["getSkillName"] = my.getSkillName;
	my["rankPlayers"] = my.rankPlayers;
	my["loadPlayers"] = my.loadPlayers;
	my["getPlayerInfos"] = my.getPlayerInfos;
	my["getPlayerInfo"] = my.getPlayerInfo;
	my["getRank"] = my.getRank;
	my["getRankForID"] = my.getRankForID; 
	my["getRankStr"] = my.getRankStr; 
	my["playerHasTag"] = my.playerHasTag;

	window["tPlayerList"] = my;
	
})(cbTennis);

cbTennis.playerConfig = 
// jsonVariableStart  
[
	{
		"id": "roger-fedora", 
		"firstName": "Roger",
		"lastName": "Fedora",
		"nationality": "ch",
		"age": "32",
		"sex": "m",
		"height": "185",
		"weight": "85",
		"hand": "0",
		"skills": {
			"speed": "87",
			"touch": "99",
			"power": "90",
			"reaction": "94",
			"accuracy": "90",
			"stamina": "88",
			"mentality": "90",
			"servePower": "85",
			"serveAccuracy": "96",
			"forehand": "92",
			"backhand": "94",
			"volley": "95",
			"smash": "89",
			"drop": "83",
			"lob": "94",
			"net": "97"
		},
		"appearance": {
			"headShot": "federer200.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "federer/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopMBandThin", "HeadTopMBandOverFed"],
			"body": ["BodyGuy"],
			"topWear": ["TopWearShirt"],
			"legWear": ["LegWearShorts"],
			"head": ["PlayerHeadGuy"],
			"eye": ["PlayerEyeGuy"],
			"colour1": ["1", "1", "1"],
			"colour2": ["0.9", "0.9", "0.9"],
			"eyeColour": ["0.4", "0.3", "0.0"],
			"skin": ["0.80", "0.65", "0.4"]
		}
	},
	{
		"id": "angular-murray", 
		"firstName": "Angular",
		"lastName": "Murray",
		"nationality": "gb",
		"age": "33",
		"sex": "m",
		"height": "190",
		"weight": "84",
		"hand": "0",
		"skills": {
			"speed": "88",
			"touch": "99",
			"power": "90",
			"reaction": "88",
			"accuracy": "90",
			"stamina": "85",
			"mentality": "88",
			"servePower": "90",
			"serveAccuracy": "88",
			"forehand": "92",
			"backhand": "92",
			"volley": "97",
			"smash": "90",
			"drop": "96",
			"lob": "90",
			"net": "97"
		},
		"appearance": {
			"headShot": "murray200.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1_orange.png",
			"playerSprite": "murray/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopMMurrayHair"],
			"body": ["BodyGuy"],
			"topWear": ["TopWearShirt"],
			"legWear": ["LegWearShorts"],
			"head": ["PlayerHeadGuy"],
			"eye": ["PlayerEyeGuy"],
			"colour1": ["0", "0", "0.7"],
			"colour2": ["1", "1", "1"],
			"eyeColour": ["0.3", "0.3", "0.2"],
			"skin": ["0.9", "0.55", "0.45"]
		}
	},
	{
		"id": "rafael-ada", 
		"firstName": "Rafael",
		"lastName": "Ada",
		"nationality": "es",
		"age": "34",
		"sex": "m",
		"height": "185",
		"weight": "85",
		"hand": "1",
		"skills": {
			"speed": "93",
			"touch": "90",
			"power": "95",
			"reaction": "99",
			"accuracy": "92",
			"stamina": "92",
			"mentality": "90",
			"servePower": "92",
			"serveAccuracy": "94",
			"forehand": "92",
			"backhand": "94",
			"volley": "92",
			"smash": "93",
			"drop": "85",
			"lob": "90",
			"net": "93"
		},
		"appearance": {
			"headShot": "nadal200.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "nadal/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopMThickBand", "HeadTopMTidyHairNadal"],
			"body": ["BodyGuy"],
			"topWear": ["TopWearShirt"],
			"legWear": ["LegWearShorts"],
			"head": ["PlayerHeadGuy"],
			"eye": ["PlayerEyeGuy"],
			"colour1": ["1", "0.4", "0"],
			"colour2": ["0.5", "0", "0"],
			"eyeColour": ["0.2", "0.1", "0.0"],
			"skin": ["0.7", "0.55", "0.3"],
			"exColour": {
				"ThickBand": [0.005, 0.005, 0.025],
				"TidyHair": [0.03, 0.01, 0]
			}
		}
	},
	{
		"id": "ovak-clockovic", 
		"firstName": "Ovak",
		"lastName": "Clokovic",
		"shortName": "Clk",
		"nationality": "rs",
		"age": "33",
		"sex": "m",
		"height": "188",
		"weight": "82",
		"hand": "0",
		"skills": {
			"speed": "96",
			"touch": "97",
			"power": "95",
			"reaction": "96",
			"accuracy": "97",
			"stamina": "96",
			"mentality": "96",
			"servePower": "95",
			"serveAccuracy": "96",
			"forehand": "99",
			"backhand": "96",
			"volley": "93",
			"smash": "95",
			"drop": "94",
			"lob": "94",
			"net": "91"	
		},
		"appearance": {
			"headShot": "djokovic200.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopMDjokHair"],
			"body": ["BodyGuy"],
			"topWear": ["TopWearShirt"],
			"legWear": ["LegWearShorts"],
			"head": ["PlayerHeadGuy"],
			"eye": ["PlayerEyeGuy"],
			"colour1": ["0.7", "0", "0"],
			"colour2": ["0", "0", "0.8"],
			"eyeColour": ["0.3", "0.3", "0.2"],
			"skin": ["0.75", "0.55", "0.35"]
		}
	},
	{
		"tags": ["inactive"],
		"id": "stan-vaxpinger", 
		"firstName": "Stan",
		"lastName": "Vaxpinger",
		"nationality": "ch",
		"age": "29",
		"sex": "m",
		"height": "183",
		"weight": "81",
		"hand": "0",
		"skills": {
			"speed": "94",
			"touch": "88",
			"power": "90",
			"reaction": "94",
			"accuracy": "92",
			"stamina": "85",
			"mentality": "90",
			"servePower": "94",
			"serveAccuracy": "92",
			"forehand": "82",
			"backhand": "98",
			"volley": "90",
			"smash": "85",
			"drop": "85",
			"lob": "90",
			"net": "85"
		},
		"appearance": {
			"headShot": "Wawrinka.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopMSpikeUnderlay", "HeadTopMSpikeComb"],
			"body": ["BodyGuy"],
			"topWear": ["TopWearShirt"],
			"legWear": ["LegWearShorts"],
			"head": ["PlayerHeadGuy"],
			"eye": ["PlayerEyeGuy"],
			"colour1": ["0.5", "0", "0"],
			"colour2": ["1", "1", "1"],
			"eyeColour": ["0.2", "0.1", "0.0"]
		}
	},
	{
		"id": "super-stefanos", 
		"firstName": "Super",
		"lastName": "Stefanos",
		"nationality": "gr",
		"age": "22",
		"sex": "m",
		"height": "193",
		"weight": "89",
		"hand": "0",
		"skills": {
			"speed": "99",
			"touch": "95",
			"power": "94",
			"reaction": "94",
			"accuracy": "92",
			"stamina": "90",
			"mentality": "84",
			"servePower": "90",
			"serveAccuracy": "92",
			"forehand": "98",
			"backhand": "92",
			"volley": "93",
			"smash": "93",
			"drop": "89",
			"lob": "93",
			"net": "82"
		},
		"appearance": {
			"headShot": "Berdych.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopMFancyHair", "HeadTopMFullBand", "HeadTopMTash"],
			"body": ["BodyGuy"],
			"topWear": ["TopWearShirt"],
			"legWear": ["LegWearShorts"],
			"head": ["PlayerHeadGuy"],
			"eye": ["PlayerEyeGuy"],
			"colour1": ["0", "0.2", "0.8"],
			"colour2": ["1", "1", "1"],
			"colour3": ["0", "0.2", "0.8"],
			"eyeColour": ["0.20", "0.10", "0.05"],
			"exColour": {
				"ThickBand": [1, 1, 1],
				"TidyHair": [0.15, 0.08, 0],
				"Tash": [0.4, 0.3, 0.06]
			}
		}
	},
	{
		"id": "alex-backhander", 
		"firstName": "Alexander",
		"lastName": "Backhander",
		"nationality": "de",
		"age": "23",
		"sex": "m",
		"height": "198",
		"weight": "90",
		"hand": "0",
		"skills": {
			"speed": "94",
			"touch": "92",
			"power": "99",
			"reaction": "93",
			"accuracy": "94",
			"stamina": "90",
			"mentality": "84",
			"servePower": "99",
			"serveAccuracy": "80",
			"forehand": "92",
			"backhand": "99",
			"volley": "93",
			"smash": "93",
			"drop": "87",
			"lob": "95",
			"net": "82"
		},
		"appearance": {
			"headShot": "Berdych.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopMHairWide", "HeadTopMFrontBand"],
			"body": ["BodyGuy"],
			"topWear": ["TopWearShirt"],
			"legWear": ["LegWearShorts"],
			"head": ["PlayerHeadGuy"],
			"eye": ["PlayerEyeGuy"],
			"colour1": ["0", "0", "0"],
			"colour2": ["0.75", "0.05", "0.05"],
			"colour3": ["1", "0.7", "0.1"],
			"eyeColour": ["0.20", "0.20", "0.35"],
			"skin": ["0.80", "0.5", "0.2"],
			"exColour": {
				"ThickBand": [1, 1, 1],
				"TidyHair": [0.22, 0.1, 0.01]
			}
		}
	},
	{
		"tags": ["inactive"],
		"id": "tom-blendych", 
		"firstName": "Tom",
		"lastName": "Blendych",
		"nationality": "cz",
		"age": "28",
		"sex": "m",
		"height": "196",
		"weight": "91",
		"hand": "0",
		"skills": {
			"speed": "94",
			"touch": "86",
			"power": "94",
			"reaction": "94",
			"accuracy": "92",
			"stamina": "90",
			"mentality": "84",
			"servePower": "90",
			"serveAccuracy": "92",
			"forehand": "98",
			"backhand": "92",
			"volley": "93",
			"smash": "93",
			"drop": "89",
			"lob": "93",
			"net": "82"
		},
		"appearance": {
			"headShot": "Berdych.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopMCurvedFringeUnderCap", "HeadTopMCapForward"],
			"body": ["BodyGuy"],
			"topWear": ["TopWearShirt"],
			"legWear": ["LegWearShorts"],
			"head": ["PlayerHeadGuy"],
			"eye": ["PlayerEyeGuy"],
			"colour1": ["0.5", "0", "0"],
			"colour2": ["1", "1", "1"],
			"colour3": ["0", "0", "0.5"],
			"eyeColour": ["0.5", "0.5", "0.8"]
		}
	},
	{
		"id": "joe-samba", 
		"firstName": "Joe",
		"lastName": "Samba",
		"nationality": "fr",
		"age": "28",
		"sex": "m",
		"height": "188",
		"weight": "91",
		"hand": "0",
		"skills": {
			"speed": "90",
			"touch": "94",
			"power": "90",
			"reaction": "94",
			"accuracy": "92",
			"stamina": "90",
			"mentality": "93",
			"servePower": "90",
			"serveAccuracy": "86",
			"forehand": "90",
			"backhand": "90",
			"volley": "90",
			"smash": "93",
			"drop": "85",
			"lob": "82",
			"net": "96"
		},
		"appearance": {
			"headShot": "tsonga.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopMMarine"],
			"body": ["BodyGuy"],
			"topWear": ["TopWearShirt"],
			"legWear": ["LegWearShorts"],
			"head": ["PlayerHeadGuy"],
			"eye": ["PlayerEyeGuy"],
			"colour1": ["0", "0", "0.3"],
			"colour2": ["0.3", "0", "0"],
			"colour3": ["1", "1", "1"],
			"skin": ["0.64","0.37","0.19"],
			"eyeColour": ["0.2", "0.1", "0.0"],
			"exColour": {
				"BlackHair": [0, 0, 0]
			}
		}
	},
	{
		"id": "dom-turing", 
		"firstName": "Dom",
		"lastName": "Turing",
		"nationality": "at",
		"age": "27",
		"sex": "m",
		"height": "185",
		"weight": "79",
		"hand": "0",
		"skills": {
			"speed": "90",
			"touch": "90",
			"power": "92",
			"reaction": "99",
			"accuracy": "92",
			"stamina": "94",
			"mentality": "93",
			"servePower": "94",
			"serveAccuracy": "99",
			"forehand": "97",
			"backhand": "92",
			"volley": "90",
			"smash": "93",
			"drop": "82",
			"lob": "90",
		 	"net": "84"	
		},
		"appearance": {
			"headShot": "delpotro.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopMTieBand", "HeadTopMTieBandQuiffOver", "HeadTopMTieBandBackHair"],
			"body": ["BodyGuy"],
			"topWear": ["TopWearShirt"],
			"legWear": ["LegWearShorts"],
			"head": ["PlayerHeadGuy"],
			"eye": ["PlayerEyeGuy"],
			"colour1": ["0.9", "0.05", "0.05"],
			"colour2": ["1", "1", "1"],
			"colour3": ["0.9", "0.05", "0.05"],
			"eyeColour": ["0.24", "0.21", "0.23"],
			"skin": ["0.9", "0.65", "0.5"],
			"exColour": {
				"DarkBrownHair": [0.24, 0.15, 0.11],
				"HeadTopTieBandColor": [1, 1, 1]
			}
		}
	},
	{
		"tags": ["inactive"],
		"id": "dell-potro", 
		"firstName": "Dell",
		"lastName": "Potro",
		"nationality": "es",
		"age": "28",
		"sex": "m",
		"height": "188",
		"weight": "91",
		"hand": "0",
		"skills": {
			"speed": "80",
			"touch": "80",
			"power": "90",
			"reaction": "94",
			"accuracy": "92",
			"stamina": "90",
			"mentality": "93",
			"servePower": "94",
			"serveAccuracy": "95",
			"forehand": "99",
			"backhand": "92",
			"volley": "90",
			"smash": "93",
			"drop": "82",
			"lob": "90",
		 	"net": "84"	
		},
		"appearance": {
			"headShot": "delpotro.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopMTieBand", "HeadTopMTieBandQuiffOver", "HeadTopMTieBandBackHair"],
			"body": ["BodyGuy"],
			"topWear": ["TopWearShirt"],
			"legWear": ["LegWearShorts"],
			"head": ["PlayerHeadGuy"],
			"eye": ["PlayerEyeGuy"],
			"colour1": ["0.5", "0", "0"],
			"colour2": ["1", "0.4", "0"],
			"colour3": ["0", "0", "0"],
			"eyeColour": ["0.3", "0.6", "0.4"]
		}
	},
	{
		"tags": ["inactive"],
		"id": "richard-classquet", 
		"firstName": "Richy",
		"lastName": "Classquet",
		"nationality": "fr",
		"age": "29",
		"sex": "m",
		"height": "185",
		"weight": "75",
		"hand": "0",
		"skills": {
			"speed": "88",
			"touch": "80",
			"power": "90",
			"reaction": "94",
			"accuracy": "98",
			"stamina": "90",
			"mentality": "93",
			"servePower": "90",
			"serveAccuracy": "88",
			"forehand": "85",
			"backhand": "97",
			"volley": "90",
			"smash": "90",
			"drop": "92",
			"lob": "86",
		 	"net": "96"	
		},
		"appearance": {
			"headShot": "richardclassquet.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopMCapBackward"],
			"body": ["BodyGuy"],
			"topWear": ["TopWearShirt"],
			"legWear": ["LegWearShorts"],
			"head": ["PlayerHeadGuy"],
			"eye": ["PlayerEyeGuy"],
			"colour1": ["0", "0", "0.6"],
			"colour2": ["1", "1", "1"],
			"colour3": ["1", "0", "0"],
			"eyeColour": ["0.1", "0.1", "0"]
		}
	},
	{
		"tags": ["inactive"],
		"id": "nick-ios", 
		"firstName": "Nick",
		"lastName": "Ios",
		"nationality": "au",
		"age": "20",
		"sex": "m",
		"height": "193",
		"weight": "78",
		"hand": "0",
		"skills": {
			"speed": "90",
			"touch": "80",
			"power": "95",
			"reaction": "94",
			"accuracy": "84",
			"stamina": "80",
			"mentality": "93",
			"servePower": "98",
			"serveAccuracy": "90",
			"forehand": "99",
			"backhand": "92",
			"volley": "90",
			"smash": "93",
			"drop": "80",
			"lob": "88",
		 	"net": "78"	
		},
		"appearance": {
			"headShot": "nickios.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopMMarine"],
			"body": ["BodyGuy"],
			"topWear": ["TopWearShirt"],
			"legWear": ["LegWearShorts"],
			"head": ["PlayerHeadGuy"],
			"eye": ["PlayerEyeGuy"],
			"colour1": ["0.25", "1", "0.4"],
			"colour2": ["1", "0.8", "0.25"],
			"colour3": ["0.25", "0.5", "0.4"],
			"eyeColour": ["0.2", "0.1", "0.0"],
			"skin": ["0.85", "0.6", "0.35"]
		}
	},
	{
		"id": "dan-mad4dev", 
		"firstName": "Dan",
		"lastName": "Mad4Dev",
		"nationality": "ru",
		"age": "25",
		"sex": "m",
		"height": "198",
		"weight": "83",
		"hand": "0",
		"skills": {
			"speed": "94",
			"touch": "98",
			"power": "94",
			"reaction": "94",
			"accuracy": "93",
			"stamina": "98",
			"mentality": "93",
			"servePower": "94",
			"serveAccuracy": "95",
			"forehand": "99",
			"backhand": "92",
			"volley": "90",
			"smash": "93",
			"drop": "86",
			"lob": "90",
		 	"net": "84"	
		},
		"appearance": {
			"headShot": "marinparadic.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopMRightParting"],
			"body": ["BodyGuy"],
			"topWear": ["TopWearShirt"],
			"legWear": ["LegWearShorts"],
			"head": ["PlayerHeadGuy"],
			"eye": ["PlayerEyeGuy"],
			"colour1": ["0.95", "0.05", "0.07"],
			"colour2": ["0.19", "0.34", "0.67"],
			"colour3": ["1", "1", "1"],
			"skin": ["0.65", "0.55", "0.35"],
			"eyeColour": ["0.29", "0.16", "0.09"],
			"exColour": {
				"HeadTopMRightParting": [0.23, 0.14, 0.09]
			}
		}
	},
	{
		"tags": ["inactive"],
		"id": "marin-paradic", 
		"firstName": "Marine",
		"lastName": "Paradic",
		"nationality": "hr",
		"age": "26",
		"sex": "m",
		"height": "198",
		"weight": "89",
		"hand": "0",
		"skills": {
			"speed": "80",
			"touch": "88",
			"power": "92",
			"reaction": "94",
			"accuracy": "93",
			"stamina": "98",
			"mentality": "93",
			"servePower": "94",
			"serveAccuracy": "95",
			"forehand": "99",
			"backhand": "92",
			"volley": "90",
			"smash": "93",
			"drop": "86",
			"lob": "90",
		 	"net": "84"	
		},
		"appearance": {
			"headShot": "marinparadic.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopMFedVertex"],
			"body": ["BodyGuy"],
			"topWear": ["TopWearShirt"],
			"legWear": ["LegWearShorts"],
			"head": ["PlayerHeadGuy"],
			"eye": ["PlayerEyeGuy"],
			"colour1": ["0.5", "0", "0"],
			"colour2": ["1", "1", "1"],
			"colour3": ["0", "0.2", "0.55"],
			"skin": ["0.91", "0.73", "0.42"],
			"eyeColour": ["0.2", "0.1", "0.0"]
		}
	},
	{
		"tags": ["inactive"],
		"id": "thrustin-doc-brown", 
		"firstName": "Thrustin",
		"lastName": "Doc Brown",
		"nationality": "de",
		"age": "30",
		"sex": "m",
		"height": "196",
		"weight": "78",
		"hand": "0",
		"skills": {
			"speed": "97",
			"touch": "90",
			"power": "84",
			"reaction": "96",
			"accuracy": "80",
			"stamina": "85",
			"mentality": "75",
			"servePower": "92",
			"serveAccuracy": "90",
			"forehand": "83",
			"backhand": "84",
			"volley": "80",
			"smash": "85",
			"drop": "92",
			"lob": "94",
		 	"net": "99"	
		},
		"appearance": {
			"headShot": "thrustindocbrown.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopMBandOverNadal"],
			"body": ["BodyGuy"],
			"topWear": ["TopWearShirt"],
			"legWear": ["LegWearShorts"],
			"head": ["PlayerHeadGuy"],
			"eye": ["PlayerEyeGuy"],
			"colour1": ["0.85", "0", "0"],
			"colour2": ["0", "0", "0"],
			"colour3": ["1", "0.8", "0"],
			"skin": ["0.6", "0.33", "0.24"],
			"eyeColour": ["0.2", "0.1", "0.0"]
		}
	},
	{
		"id": "john-pysner", 
		"firstName": "John",
		"lastName": "Pysner",
		"nationality": "us",
		"age": "30",
		"sex": "m",
		"height": "208",
		"weight": "111",
		"hand": "0",
		"skills": {
			"speed": "88",
			"touch": "80",
			"power": "99",
			"reaction": "90",
			"accuracy": "92",
			"stamina": "86",
			"mentality": "94",
			"servePower": "97",
			"serveAccuracy": "98",
			"forehand": "96",
			"backhand": "90",
			"volley": "92",
			"smash": "92",
			"drop": "82",
			"lob": "82",
		 	"net": "70"	
		},
		"appearance": {
			"headShot": "johnpysner.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopMCapBackward"],
			"body": ["BodyGuy"],
			"topWear": ["TopWearShirt"],
			"legWear": ["LegWearShorts"],
			"head": ["PlayerHeadGuy"],
			"eye": ["PlayerEyeGuy"],
			"colour1": ["0.7", "0", "0"],
			"colour2": ["0", "0", "0.8"],
			"colour3": ["1", "1", "1"],
			"eyeColour": ["0.2", "0.2", "0.4"],
			"skin": ["0.8", "0.6", "0.5"]
		}
	},
	{ 
		"id": "barty-party", 
		"firstName": "No Barty, No",
		"lastName": "Party",
		"nationality": "au",
		"age": "24",
		"sex": "f",
		"height": "166",
		"weight": "62",
		"hand": "0",
		"skills": {
			"speed": "95",
			"touch": "97",
			"power": "98",
			"reaction": "94",
			"accuracy": "95",
			"stamina": "98",
			"mentality": "93",
			"servePower": "97",
			"serveAccuracy": "90",
			"forehand": "96",
			"backhand": "92",
			"volley": "90",
			"smash": "93",
			"drop": "95",
			"lob": "90",
			"net": "88"
		},
		"appearance": {
			"headShot": "li-na.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFRadwanskaPony", "HeadTopFLadiesCapOverHair"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["1", "0.8", "0.2"],
			"colour2": ["0.2", "0.5", "0.2"],
			"colour3": ["1", "0.8", "0.2"],
			"skin": ["0.9", "0.6", "0.5"],
			"eyeColour": ["0.3", "0.2", "0.2"],
			"exColour": {
				"LadiesVisor": [0.9, 0.9, 0.9]
			}
		}
	},
	{
		"id": "niceli-osmasha", 
		"firstName": "Niceli",
		"lastName": "Osmasha",
		"nationality": "jp",
		"age": "23",
		"sex": "f",
		"height": "180",
		"weight": "75",
		"hand": "0",
		"skills": {
			"speed": "92",
			"touch": "96",
			"power": "99",
			"reaction": "93",
			"accuracy": "92",
			"stamina": "90",
			"mentality": "93",
			"servePower": "99",
			"serveAccuracy": "92",
			"forehand": "96",
			"backhand": "92",
			"volley": "92",
			"smash": "93",
			"drop": "90",
			"lob": "92",
			"net": "89"
		},
		"appearance": {
			"headShot": "niceli-osmasha.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFOsakaHair", "HeadTopFOsakaBob", "HeadTopFLadiesVisorOverHair"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["0", "0.01", "0.02"],
			"colour2": ["0.9", "0.25", "0.08"],
			"colour3": ["0.9", "0.25", "0.08"],
			"skin": ["0.60", "0.4", "0.30"],
			"eyeColour": ["0.15", "0.05", "0.05"],
			"exColour": {
				"LadiesVisor": [0.125, 0.15, 0.2]
			}
		}
	},
	{
		"id": "s-williams", 
		"firstName": "Serena",
		"lastName": "Wikiams",
		"nationality": "us",
		"age": "32",
		"sex": "f",
		"height": "175",
		"weight": "70",
		"hand": "0",
		"skills": {
			"speed": "91",
			"touch": "92",
			"power": "98",
			"reaction": "91",
			"accuracy": "92",
			"stamina": "90",
			"mentality": "91",
			"servePower": "90",
			"serveAccuracy": "92",
			"forehand": "93",
			"backhand": "92",
			"volley": "90",
			"smash": "93",
			"drop": "95",
			"lob": "90",
			"net": "88"
		},
		"appearance": {
			"headShot": "s-williams.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFSerenaCurls", "HeadTopFSerenaBand", "HeadTopFSerenaBobble"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["0", "0", "0.8"],
			"colour2": ["0.7", "0", "0"],
			"colour3": ["1", "1", "1"],
			"skin": ["0.6", "0.33", "0.24"],
			"eyeColour": ["0.2", "0.1", "0.0"]
		}
	},
	{
		"id": "sofia-kotlin", 
		"firstName": "Sofia",
		"lastName": "Kotlin",
		"nationality": "us",
		"age": "22",
		"sex": "f",
		"height": "170",
		"weight": "57",
		"hand": "0",
		"skills": {
			"speed": "99",
			"touch": "92",
			"power": "90",
			"reaction": "99",
			"accuracy": "90",
			"stamina": "94",
			"mentality": "94",
			"servePower": "86",
			"serveAccuracy": "90",
			"forehand": "92",
			"backhand": "90",
			"volley": "90",
			"smash": "90",
			"drop": "94",
			"lob": "92", 
			"net": "90"
		},
		"appearance": {
			"headShot": "li-na.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFUnderVisorNew", "HeadTopFUnderVisorPony","HeadTopFLadiesVisorNew"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["0.8", "0.4", "0.3"],
			"colour2": ["1", "1", "1"],
			"colour3": ["1", "0.3", "0"],
			"eyeColour": ["0.1", "0.3", "0.35"],
			"skin": [0.7, 0.5, 0.28],
			"exColour": {
				"LadiesVisorColorMain": [1, 0.47, 0.1],
				"LadiesVisorColorFront": [0.8, 0.2, 0.02],
				"BlackHair": [0.25, 0.18, 0.07]
			}
		}
	},
	{
		"id": "elina-baselina", 
		"firstName": "Elina",
		"lastName": "Baselina",
		"nationality": "ua",
		"age": "26",
		"sex": "f",
		"height": "174",
		"weight": "60",
		"hand": "0",
		"skills": {
			"speed": "90",
			"touch": "88",
			"power": "99",
			"reaction": "94",
			"accuracy": "95",
			"stamina": "90",
			"mentality": "94",
			"servePower": "86",
			"serveAccuracy": "90",
			"forehand": "93",
			"backhand": "93",
			"volley": "92",
			"smash": "90",
			"drop": "94",
			"lob": "92", 
			"net": "90"
		},
		"appearance": {
			"headShot": "li-na.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFUnderVisorNew", "HeadTopFUnderVisorPony","HeadTopFLadiesVisorNew"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["0.8", "0.8", "0"],
			"colour2": ["0.07", "0.13", "1"],
			"colour3": ["0.8", "0.8", "0"],
			"eyeColour": ["0.25", "0.25", "0.35"],
			"skin": [0.7, 0.5, 0.4], 
			"exColour": {
				"LadiesVisorColorMain": [1, 0.8, 0.8],
				"LadiesVisorColorFront": [0.8, 0.8, 0.8],
				"BlackHair": [0.6, 0.5, 0.2]
			}
		}
	},

	{
		"id": "li-na", 
		"firstName": "Vi",
		"lastName": "Nano",
		"nationality": "cn",
		"age": "32",
		"sex": "f",
		"height": "172",
		"weight": "70",
		"hand": "0",
		"skills": {
			"speed": "94",
			"touch": "97",
			"power": "82",
			"reaction": "92",
			"accuracy": "90",
			"stamina": "90",
			"mentality": "90",
			"servePower": "86",
			"serveAccuracy": "90",
			"forehand": "94",
			"backhand": "90",
			"volley": "88",
			"smash": "89",
			"drop": "92",
			"lob": "85", 
			"net": "90"
		},
		"appearance": {
			"headShot": "li-na.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFUnderVisorOld", "HeadTopFBackStrands", "HeadTopFLadiesVisorOld", "HeadTopFVisorBobble"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["0.8", "0", "0"],
			"colour2": ["0.7", "0.7", "0"],
			"colour3": ["1", "1", "1"],
			"eyeColour": ["0.2", "0.1", "0.0"],
			"skin": ["0.7", "0.55", "0.2"],
			"exColour": {
				"BlackHair": [0, 0, 0]
			}
		}
	},
	{
		"tags": ["inactive"],
		"id": "ag-radwanska", 
		"firstName": "Agnieszka",
		"lastName": "Radideska",
		"nationality": "pl",
		"age": "25",
		"sex": "f",
		"height": "173",
		"weight": "56",
		"hand": "0",
		"skills": {
			"speed": "94",
			"touch": "89",
			"power": "92",
			"reaction": "94",
			"accuracy": "92",
			"stamina": "98",
			"mentality": "93",
			"servePower": "90",
			"serveAccuracy": "92",
			"forehand": "96",
			"backhand": "92",
			"volley": "90",
			"smash": "93",
			"drop": "88",
			"lob": "90",
		 	"net": "83"	
		},
		"appearance": {
			"headShot": "ag-radwanska.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFRadwanskaPony", "HeadTopFRadwanskaHairClip", "HeadTopFRadwanskaBobble"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["0.8", "0", "0"],
			"colour2": ["1", "1", "1"],
			"colour3": ["1", "1", "1"] 
		}
	},
	{
		"id": "maria-shara", 
		"firstName": "Maria C.", 
		"lastName": "Sharpova",
		"nationality": "ru",
		"age": "27",
		"sex": "f",
		"height": "188",
		"weight": "59",
		"hand": "0",
		"skills": {
			"speed": "98",
			"touch": "84",
			"power": "92",
			"reaction": "94",
			"accuracy": "92",
			"stamina": "90",
			"mentality": "93",
			"servePower": "90",
			"serveAccuracy": "92",
			"forehand": "96",
			"backhand": "92",
			"volley": "92",
			"smash": "93",
			"drop": "94",
			"lob": "90",
		 	"net": "92"	
		},
		"appearance": {
			"headShot": "maria-shara.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFSharaHair", "HeadTopFSharaClip1", "HeadTopFSharaClip2", "HeadTopFSharaBobble"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["1", "1", "1"],
			"colour2": ["1", "1", "1"],
			"colour3": ["1", "1", "1"],
			"eyeColour": ["0.3", "0.2", "0.0"],
			"exColour": {
				"LadiesHair": [0.65, 0.65, 0.35]
			}
		}
	},
	{
		"id": "vic-aza", 
		"firstName": "Victoria",
		"lastName": "Azurenka",
		"nationality": "by",
		"age": "31",
		"sex": "f",
		"height": "183",
		"weight": "67",
		"hand": "0",
		"skills": {
			"speed": "94",
			"touch": "86",
			"power": "90",
			"reaction": "94",
			"accuracy": "92",
			"stamina": "90",
			"mentality": "93",
			"servePower": "90",
			"serveAccuracy": "90",
			"forehand": "94",
			"backhand": "92",
			"volley": "85",
			"smash": "88",
			"drop": "92",
			"lob": "86",
		 	"net": "86"	
		},
		"appearance": {
			"headShot": "vic-aza.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFAzaHair", "HeadTopFBraidPony", "HeadTopFBraidPonyTopBobble", "HeadTopFBraidPonyBottomBobble"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["0.29", "0.65", "0.34"],
			"colour2": ["0.78", "0.19", "0.24"],
			"colour3": ["0.4", "0.5", "0.7"],
			"eyeColour": ["0.5", "0.5", "0.8"]
		}
	},
	{
		"id": "petra-kv", 
		"firstName": "Petra",
		"lastName": "Kvitcrowdova",
		"nationality": "cz",
		"age": "31",
		"sex": "f",
		"height": "182",
		"weight": "70",
		"hand": "1",
		"skills": {
			"speed": "90",
			"touch": "90",
			"power": "90",
			"reaction": "87",
			"accuracy": "92",
			"stamina": "93",
			"mentality": "85",
			"servePower": "96",
			"serveAccuracy": "98",
			"forehand": "99",
			"backhand": "94",
			"volley": "86",
			"smash": "92",
			"drop": "89",
			"lob": "94",
			 "net": "80"	
		},
		"appearance": {
			"headShot": "petra-kv.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFHairKv", "HeadTopFFrontBandKv"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["0.7", "0", "0"],
			"colour2": ["0", "0", "0.7"],
			"colour3": ["1", "1", "1"],
			"eyeColour": ["0.5", "0.5", "0.8"]
		}
	},
	{
		"id": "simona-halep", 
		"firstName": "Simona",
		"lastName": "Hal",
		"nationality": "ro",
		"age": "29",
		"sex": "f",
		"height": "168",
		"weight": "60",
		"hand": "0",
		"skills": {
			"speed": "90",
			"touch": "92",
			"power": "98",
			"reaction": "94",
			"accuracy": "98",
			"stamina": "90",
			"mentality": "93",
			"servePower": "90",
			"serveAccuracy": "92",
			"forehand": "87",
			"backhand": "92",
			"volley": "96",
			"smash": "94",
			"drop": "97",
			"lob": "82",
			"net": "98"
		},
		"appearance": {
			"headShot": "simona-halep.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFHalepHair", "HeadTopFHalepBand", "HeadTopFHalepBobble"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["0.7", "0.7", "0"],
			"colour2": ["0.2", "0.2", "0.7"],
			"colour3": ["0.4", "0.8", "0.9"],
		 	"eyeColour": ["0.3", "0.6", "0.4"]	
		}
	},
	{
		"id": "jelena-j", 
		"firstName": "Jelena",
		"lastName": "Pingovic",
		"nationality": "rs",
		"age": "36",
		"sex": "f",
		"height": "171",
		"weight": "64",
		"hand": "0",
		"skills": {
			"speed": "88",
			"touch": "94",
			"power": "95",
			"reaction": "92",
			"accuracy": "90",
			"stamina": "90",
			"mentality": "93",
			"servePower": "88",
			"serveAccuracy": "90",
			"forehand": "90",
			"backhand": "90",
			"volley": "92",
			"smash": "88",
			"drop": "92",
			"lob": "90",
			"net": "82"
		},
		"appearance": {
			"headShot": "jelena-j.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFJankovic"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["0.7", "0", "0"],
			"colour2": ["0", "0", "0.8"],
			"colour3": ["0", "0", "0.3"],
			"skin": ["0.81", "0.53", "0.32"],
			"eyeColour": ["0.4", "0.4", "0.7"]
		}
	},
	{
		"id": "jo-koder", 
		"firstName": "Johanna",
		"lastName": "Koder",
		"nationality": "gb",
		"age": "29",
		"sex": "f",
		"height": "180",
		"weight": "68",
		"hand": "0",
		"skills": {
			"speed": "90",
			"touch": "82",
			"power": "94",
			"reaction": "88",
			"accuracy": "70",
			"stamina": "99",
			"mentality": "99",
			"servePower": "95",
			"serveAccuracy": "87",
			"forehand": "96",
			"backhand": "90",
			"volley": "94",
			"smash": "88",
			"drop": "92",
			"lob": "85",
			"net": "84"
		},
		"appearance": {
			"headShot": "angelic-kernel.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFSharaHair", "HeadTopFSharaBobble", "HeadTopFLadiesVisorOverHair"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["1", "1", "1"],
			"colour2": ["0.1", "0.2", "0.5"],
			"colour3": ["1", "1", "1"],
			"skin": ["0.81", "0.53", "0.32"],
			"eyeColour": ["0.2", "0.2", "0.05"],
			"exColour": {
				"LadiesHair": [0.18, 0.08, 0.02]
			}
		}
	},
	{
		"tags": ["inactive"],
		"id": "angelic-kernel", 
		"firstName": "Angelic",
		"lastName": "Kernel",
		"nationality": "de",
		"age": "27",
		"sex": "f",
		"height": "172",
		"weight": "68",
		"hand": "0",
		"skills": {
			"speed": "90",
			"touch": "82",
			"power": "94",
			"reaction": "85",
			"accuracy": "85",
			"stamina": "90",
			"mentality": "85",
			"servePower": "88",
			"serveAccuracy": "87",
			"forehand": "96",
			"backhand": "90",
			"volley": "94",
			"smash": "88",
			"drop": "92",
			"lob": "85",
			"net": "84"
		},
		"appearance": {
			"headShot": "angelic-kernel.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFSharaHair", "HeadTopFSharaClip1", "HeadTopFSharaClip2", "HeadTopFSharaBobble", "HeadTopFLadiesVisorOverHair"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["0.85", "0", "0"],
			"colour2": ["1", "0.8", "0"],
			"colour3": ["0", "0", "0"],
			"skin": ["0.81", "0.53", "0.32"],
			"eyeColour": ["0.4", "0.4", "0.7"]
		}
	},
	{
		"tags": ["inactive"],
		"id": "sabine-linuski", 
		"firstName": "Sabine",
		"lastName": "Linuski",
		"nationality": "de",
		"age": "25",
		"sex": "f",
		"height": "178",
		"weight": "70",
		"hand": "0",
		"skills": {
			"speed": "88",
			"touch": "90",
			"power": "98",
			"reaction": "86",
			"accuracy": "92",
			"stamina": "90",
			"mentality": "84",
			"servePower": "90",
			"serveAccuracy": "92",
			"forehand": "90",
			"backhand": "85",
			"volley": "88",
			"smash": "88",
			"drop": "98",
			"lob": "90",
			"net": "82"
		},
		"appearance": {
			"headShot": "sabine-linuski.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFHairKv", "HeadTopFFrontBandKv"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["1", "0.8", "0"],
			"colour2": ["0.85", "0", "0"],
			"colour3": ["0", "0", "0"],
			"skin": ["0.81", "0.53", "0.32"],
			"eyeColour": ["0.5", "0.5", "0.8"]
		}
	},
	{
		"id": "karolina-pleskova", 
		"firstName": "Karolina",
		"lastName": "Pleskova",
		"nationality": "cz",
		"age": "28",
		"sex": "f",
		"height": "186",
		"weight": "70",
		"hand": "0",
		"skills": {
			"speed": "90",
			"touch": "88",
			"power": "94",
			"reaction": "88",
			"accuracy": "96",
			"stamina": "90",
			"mentality": "94",
			"servePower": "94",
			"serveAccuracy": "90",
			"forehand": "96",
			"backhand": "90",
			"volley": "94",
			"smash": "88",
			"drop": "92",
			"lob": "89",
			"net": "90"
		},
		"appearance": {
			"headShot": "pleskova.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFRadwanskaPony", "HeadTopFRadwanskaBobble"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["0.5", "0", "0"],
			"colour2": ["0", "0", "0.5"],
			"colour3": ["1", "1", "1"],
			"skin": [0.67, 0.47, 0.3],
			"eyeColour": [0.15, 0.18, 0.2],
			"exColour": {
				"BrownBlondeHair": [0.06, 0.03, 0.01],
				"RedBobble": [0, 0, 0]
			}
		}
	},
	{
		"tags": ["inactive"],
		"id": "lucie-pathorova", 
		"firstName": "Lucy",
		"lastName": "Pathorova",
		"nationality": "cz",
		"age": "28",
		"sex": "f",
		"height": "177",
		"weight": "65",
		"hand": "0",
		"skills": {
			"speed": "90",
			"touch": "88",
			"power": "94",
			"reaction": "88",
			"accuracy": "96",
			"stamina": "90",
			"mentality": "94",
			"servePower": "94",
			"serveAccuracy": "90",
			"forehand": "96",
			"backhand": "90",
			"volley": "94",
			"smash": "88",
			"drop": "92",
			"lob": "89",
			"net": "90"
		},
		"appearance": {
			"headShot": "lucie-pathorova.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFAzaHair", "HeadTopFBraidPony", "HeadTopFBraidPonyTopBobble", "HeadTopFBraidPonyBottomBobble"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["0.5", "0", "0"],
			"colour2": ["0", "0", "0.5"],
			"colour3": ["1", "1", "1"],
			"skin": ["0.81", "0.53", "0.32"],
			"eyeColour": ["0.5", "0.6", "0.7"]
		}
	},
	{
		"tags": ["inactive"],
		"id": "caroline-dvoraki", 
		"firstName": "Carol",
		"lastName": "Wozniak",
		"nationality": "dk",
		"age": "24",
		"sex": "f",
		"height": "179",
		"weight": "58",
		"hand": "0",
		"skills": {
			"speed": "98",
			"touch": "90",
			"power": "94",
			"reaction": "94",
			"accuracy": "94",
			"stamina": "90",
			"mentality": "90",
			"servePower": "94",
			"serveAccuracy": "88",
			"forehand": "97",
			"backhand": "90",
			"volley": "92",
			"smash": "93",
			"drop": "74",
			"lob": "85",
			"net": "86"
		},
		"appearance": {
			"headShot": "caroline-dvoraki.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFSharaHair", "HeadTopFSharaClip1", "HeadTopFSharaClip2", "HeadTopFSharaBobble", "HeadTopFLadiesVisorOverHair"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["1", "1", "1"],
			"colour2": ["0.9", "0", "0"],
			"colour3": ["1", "1", "1"],
			"skin": ["0.81", "0.53", "0.32"],
			"eyeColour": ["0.5", "0.6", "0.7"]
		}
	},
	{
		"id": "mouse-nkeys", 
		"firstName": "Mousen",
		"lastName": "Keys",
		"nationality": "us",
		"age": "26",
		"sex": "f",
		"height": "178",
		"weight": "66",
		"hand": "0",
		"skills": {
			"speed": "88",
			"touch": "86",
			"power": "98",
			"reaction": "94",
			"accuracy": "92",
			"stamina": "90",
			"mentality": "88",
			"servePower": "85",
			"serveAccuracy": "88",
			"forehand": "93",
			"backhand": "90",
			"volley": "90",
			"smash": "88",
			"drop": "98",
			"lob": "90",
			"net": "82"
		},
		"appearance": {
			"headShot": "mousen-keys.jpg",
			"frontSprite": "hitting_sprite_1.png",
			"backSprite": "hitting_spritebk_1.png",
			"playerSprite": "djokovic/all_actions/spriteSheetFull.png",
			"headTop": ["HeadTopFSerenaCurls", "HeadTopFSerenaBand", "HeadTopFSerenaBobble"],
			"body": ["BodyGirl"],
			"topWear": ["TopWearBlouse"],
			"legWear": ["LegWearHotPants"],
			"head": ["PlayerHeadNiceGirl"],
			"eye": ["PlayerEyeGirl"],
			"colour1": ["1", "1", "1"],
			"colour2": ["0", "0", "0.8"],
			"colour3": ["0.7", "0", "0"],
			"skin": ["0.7", "0.43", "0.34"],
			"eyeColour": ["0.2", "0.1", "0.0"]
		}
	}
]
// jsonVariableEnd
;

window["tPlayers"] = cbTennis.playerConfig;
