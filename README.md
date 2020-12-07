# Welcome to Decentraland Pictionary Circus

## The scene allows several players (connected to the same realm) to play the Pictionary game together.

### How to draw

The first player must enter the phonebox at the center of the scene.
Here is a Link to a Whiteboard application. He can choose to launch it on its desktop or his mobile (using the QRCode).

On the whiteboard app, the drawer click Start when he's ready to draw
On the new page, a list of 4 words.
The player choose one of them and try to draw it on the drawing area.

In real time the drawing is refreshed on the building of the Pictionary Circus scene, so that the other player can guess the word the drawer is trying to draw.

### Submit a word

When a player think he has found the word, he can submit it through the UI
If he's right, he wins the round.
He can claim an NFT (non fungible token) that represents the drawned image.

## Architecture
### Smart Contracts

The scene interacts with 2 smart contracts:
- DCLPictionaryNFT is the NFT contract (ERC721 compatible) that manages the NFT given to the winners
- DCLPictionary is the master contract that mints the NFT and give them to the winners.

### Other components

#### Whiteboard App

A web app that allow the drawer to draw
#### Whiteboard Server

The scene interacts with a Websocket/HTTP server that is sharing data across the players of the same realm, and communicate with the whiteboard application.

#### NFT Server

Publish the NFT metadata and images

