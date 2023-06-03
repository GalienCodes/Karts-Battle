# Near Karts

Battle Kart dynamic NFTs on NEAR blockchain.
![nEAR kARTS](https://i.ibb.co/ynGP3WP/Screenshot-from-2023-06-03-16-19-31.png)</br>
![kARTS](https://i.ibb.co/DDMxBCr/Screenshot-from-2023-06-03-16-18-04.png) </br>
![Battle Areba](https://i.ibb.co/fnZgbYj/Screenshot-from-2023-06-03-16-17-02.png)

## Demo App:
 https://near-karts.web.app/

## Concept

Equip and pimp a 3D NEAR Kart NFT and mint it on the NEAR blockchain.

NFT is upgradable as the Kart rises through the levels.

#### Battles

* Each battle won increases your NEAR Kart level by 1  
* Win items as your level increases  
* Upgrade and save your NEAR Kart once every **5** levels  
* The name of your NEAR Kart cannot be changed so choose wisely! 


NEAR Karts NFTs are NEP-171 NFTs on the NEAR blockchain.

non_fungible_token_core, non_fungible_token_approval and impl_non_fungible_token_enumeration are implemented for the NEAR Kart NFTs.

**nft_mint** is modified to allow minting only when with verified nft data is provided.

[NEAR Kart NEP-171 Implementation](https://github.com/Muhindo-Galien/Karts-Battle/blob/master/contracts/near/nft/src/lib.rs)

#### The Graph Integration

**⚠ The graph indexer reaches a certain block and then stops indexing so the leaderboard in the application does not stay up to date.**

The Graph is integrated into the application to provide daily and monthly leaderboards.

The NEAR Karts Subgraph also provides:

* A historical record of the NFT for each kart as they are upgraded
* Battle details that can be used to replay previous battles
* Records of minting and upgrading events

## Important Files

[Kart NFT Contract on NEAR](https://github.com/Muhindo-Galien/Karts-Battle/blob/master/contracts/near/nft/src/lib.rs)

[Front end code](https://github.com/Muhindo-Galien/Karts-Battle/tree/master/web/src)  
[App / Wallet / Contract front end ReactJS](https://github.com/Muhindo-Galien/Karts-Battle/blob/master/web/src/App.js)  
[NEAR Karts front end ReactJS](https://github.com/Muhindo-Galien/Karts-Battle/blob/master/web/src/js/components/NearKarts.js)  
