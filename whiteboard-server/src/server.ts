import { pCTContract } from './PCTContract';
import { nFTContract } from './NFTContract';
import * as fs from 'fs';
import { RealmWS } from './index';
import { EventEmitter } from 'events';
import { User, eUserEvents } from './user';
import { Realm, eRealmEvent, WordFoundArgs } from './realm';
import  * as randomWords from 'random-words';
import QRCode from 'qrcode'
import { eMessages, WSMessageArgs, eServerEvents } from './iserver';
import { WHITEBOARD_APP_URL, IMAGE_STORE, IMAGE_SERVER_URL, METADATA_SERVER_URL, METADATA_STORE } from './config';


export class Server extends EventEmitter {
    private realms = new Map<string, Realm>();
    private users = new Map<string, User>();

    public constructor() {
        super();
    }

    public connect(realmName: string, userName?: string, userAddress?: string): Realm {
        let realm = this.realms.get(realmName) as Realm;
        if (!realm) {
            realm = new Realm(realmName);
            this.realms.set(realmName, realm);
        }
        if (userAddress && userName) {
            const user = new User(userName, userAddress, realm);
            this.users.set(userAddress, user);
        }
        return realm;
    }

    public disconnect(userAddress: string) {
        if (!this.users.has(userAddress)) {
            throw new Error('Unable to find the user with address ' + userAddress);
        }
        const user = this.users.get(userAddress);
        console.log('delete user with address', userAddress);
        this.users.delete(userAddress);
        user?.disconnect();
    }

    public startDrawing(realmName: string, drawerAddress: string) {
        console.log('startDrawing', realmName, drawerAddress);
        if (!this.realms.has(realmName)) {
            throw new Error('UNable to find the realm with name ' + realmName);
        }
        const realm = this.realms.get(realmName) as Realm;
        if (!this.users.has(drawerAddress)) {
            throw new Error('Unable to find the user with address ' + drawerAddress);
        }
        const drawer = this.users.get(drawerAddress) as User;
        realm.drawer = drawer;
        drawer?.on(eUserEvents.disconnect, () => {this.stopDrawing(realmName, drawerAddress)});
    }

    private stopDrawing(realmName: string, drawerAddress: string) {
        if ((this.realms.get(realmName) as Realm).drawer?.address === drawerAddress) {
            (this.realms.get(realmName) as Realm).drawer = undefined;
        }
    }

    public getWords(realmName: string, drawerAddress: string): string[] {
        if (!this.realms.has(realmName)) {
            throw new Error('UNable to find the realm with name ' + realmName);
        }
        const realm = this.realms.get(realmName) as Realm;
        realm.words = randomWords.default(4) as string[];
        if(drawerAddress !== realm.drawer?.address) {
            console.error(`Unexpected request of word (drawer=${drawerAddress}, realm=${realmName}, realm.drawer=${realm.drawer?.address})`);
            return [];
        }
        if (!drawerAddress) {
            throw new Error('There is no drawer registered for the current realm' + realmName);
        }
        const drawer = this.users.get(drawerAddress);
        if (!drawer) {
            throw new Error('Unable to find the user with address ' + drawerAddress);
        }
        this.sendMessage({realm: realmName, message: eMessages.roundStarted, args: { drawerName: drawer.name, drawerAddress , timeoutSec: 30 }});
        const roundTimer = setTimeout(() => {
            console.log('timeout expired');
            // this.stopDrawing(realmName, drawer.address);
            // this.sendMessage({realm: realmName, message: eMessages.roundFailed, args: {words: realm.words}});
        }, (30000));
        realm.once(eRealmEvent.wordFound, (wordFoundArgs: WordFoundArgs) => {
            console.log('Server: received wordFound', wordFoundArgs)
            clearTimeout(roundTimer);
            const winnerAddress = wordFoundArgs.winner;
            const winner = this.users.get(winnerAddress);
            if (!winner) {
                throw new Error('Unable to find the user with address ' + winnerAddress);
            }
            this.stopDrawing(realmName, drawer.address);
            const tokenId = Math.floor(Math.random()*(2**32)).toString();
            const imagePath = IMAGE_STORE + `/${tokenId}.png`;
            this.storeImage(realmName, imagePath);
            const imageUrl = IMAGE_SERVER_URL + `/${tokenId}.png`;
            const metadataPath = METADATA_STORE + `/${tokenId}.json`;
            this.storeMetadata(tokenId, new Date(), drawer, imageUrl, wordFoundArgs.word, metadataPath);
            const tokenURI = METADATA_SERVER_URL + `/${tokenId}.json`;
            this.prepareNFT(winnerAddress, tokenId, tokenURI).then(() => {
                console.log('NFT has been prepared');
            }).catch(e => {
                console.error(e);
            })
            .finally(() => {
                console.log('tokenId', tokenId);
                this.sendMessage({
                    realm: realmName,
                    message: eMessages.roundCompleted,
                    args: {word: wordFoundArgs.word, winnerName: winner?.name as string, winnerAddress: winnerAddress, tokenId}
                });
            })

        })
        return realm.words;
    }

    private sendMessage(eventArgs: WSMessageArgs) {
        console.log('Server: sendMessage', eventArgs);
        this.emit(eServerEvents.sendMessage, eventArgs);
    }

    public sendStatus(ws: RealmWS) {
        const realm = this.realms.get(ws.realm) as Realm;
        if (!realm) {
            throw new Error('UNable to find the realm with name ' + ws.realm);
        }
        this.sendMessage({realm: ws.realm, message: eMessages.realmStatus, args: realm.getStatus()})
    }

    public updateImage(realmName: string, image: string) {
        if (!this.realms.has(realmName)) {
            throw new Error('UNable to find the realm with name ' + realmName);
        }
        const realm = this.realms.get(realmName) as Realm;
        realm.image = image;
        this.sendMessage({realm: realmName, message: eMessages.imageUpdated, args: {imageUrl: realm.getImageUrl()}});
    }

    public getImage(realmName: string): string {
        if (!this.realms.has(realmName)) {
            throw new Error('UNable to find the realm with name ' + realmName);
        }
        const realm = this.realms.get(realmName) as Realm;
        return realm.image as string;
    }

    public storeImage(realmName: string, path: string) {
        console.log('store image into', path);
        const dataURI = this.getImage(realmName);
        const regExMatches = dataURI.match('data:(image/.*);base64,(.*)');
        if (regExMatches) {
            try {
                fs.writeFileSync(path, Buffer.from(regExMatches[2] as string, 'base64') );
            } catch (e) {
                console.error(e);
            }
        }
    }

    public storeMetadata(tokenId: string, date: Date, drawer: User, imageUrl: string, word: string, path: string) {
        const metadata = {
            name: `DCL-Pictionary-${tokenId}-${word}`,
            image: imageUrl,
            description: `Drawn by ${drawer.name} on ${date.toUTCString()}. Word to be guessed: ${word}`
        }
        fs.writeFileSync(path, JSON.stringify(metadata));
    }

    public async getQrCode(realmName: string, userId: string): Promise<string> {
        if (!this.realms.has(realmName)) {
            throw new Error('UNable to find the realm with name ' + realmName);
        }
        if (!this.users.has(userId)) {
            throw new Error('Unable to find the user with id' + userId);
        }
        const realm = this.realms.get(realmName) as Realm;
        const user = this.users.get(userId) as User;
        // example http://192.168.1.11:4200?realm=localhost-stub&userId=0xe73f406ee21babf3752ce02106080ea03bd043f7&userName=Hayden-e73f40
        const url = `${WHITEBOARD_APP_URL}?realm=${realmName}&userId=${user.address}&userName=${user.name}`;
        return QRCode.toDataURL(url);
    }

    public checkWord(realmName: string, word: string): boolean {
        if (!this.realms.has(realmName)) {
            throw new Error('UNable to find the realm with name ' + realmName);
        }
        const realm = this.realms.get(realmName) as Realm;
        return realm.checkWord(word);
    }

    public submitWord(realmName: string, playerAddress: string, word: string): boolean {
        if (!this.realms.has(realmName)) {
            throw new Error('UNable to find the realm with name ' + realmName);
        }
        const realm = this.realms.get(realmName) as Realm;
        return realm.submitWord(word, playerAddress);
    }

    public async claimNFT(tokenId: string, signerAddress: string, signature: any) {
        console.log('call metaClaimNFT with params', tokenId, signerAddress, JSON.stringify(signature));
        await pCTContract.metaClaimNFT(tokenId, signerAddress, signature.functionSignature, signature.r, signature.s, signature.v);
    }

    public async prepareNFT(winnerAddress: string, tokenId: string, tokenURI: string) {
        const balanceBefore = await nFTContract.balanceOf(winnerAddress);
        console.log(`NFT balance ${winnerAddress}: ${balanceBefore.toString()}`);
        await pCTContract.prepareNFT(winnerAddress, tokenId, tokenURI);
        const balanceAfter = await nFTContract.balanceOf(winnerAddress);
        console.log(`NFT balance ${winnerAddress}: ${balanceAfter.toString()}`);
    }

}