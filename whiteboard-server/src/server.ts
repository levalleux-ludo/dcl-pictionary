import { EventEmitter } from 'events';
import { User, eUserEvents } from './user';
import { Realm, eRealmEvent, WordFoundArgs } from './realm';
import  * as randomWords from 'random-words';
import QRCode from 'qrcode'
import { eMessages, WSMessageArgs, eServerEvents } from './iserver';
import { WHITEBOARD_APP_URL } from './config';


export class Server extends EventEmitter {
    private realms = new Map<string, Realm>();
    private users = new Map<string, User>();

    public constructor() {
        super();
    }

    public connect(realmName: string, userName: string, userAddress: string) {
        let realm = this.realms.get(realmName) as Realm;
        if (!realm) {
            realm = new Realm(realmName);
            this.realms.set(realmName, realm);
        }
        const user = new User(userName, userAddress, realm);
        this.users.set(userAddress, user);
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
        if (!this.users.has(drawerAddress)) {
            throw new Error('Unable to find the user with address ' + drawerAddress);
        }
        (this.realms.get(realmName) as Realm).drawerAddress = drawerAddress;
        const drawer = this.users.get(drawerAddress);
        drawer?.on(eUserEvents.disconnect, () => {this.stopDrawing(realmName, drawerAddress)});
    }

    private stopDrawing(realmName: string, drawerAddress: string) {
        if ((this.realms.get(realmName) as Realm).drawerAddress === drawerAddress) {
            (this.realms.get(realmName) as Realm).drawerAddress = undefined;
        }
    }

    public getWords(realmName: string, drawerAddress: string): string[] {
        if (!this.realms.has(realmName)) {
            throw new Error('UNable to find the realm with name ' + realmName);
        }
        const realm = this.realms.get(realmName) as Realm;
        realm.words = randomWords.default(4) as string[];
        if(drawerAddress !== realm.drawerAddress) {
            console.error(`Unexpected request of word (drawer=${drawerAddress}, realm=${realmName}, realm.drawer=${realm.drawerAddress})`);
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
            this.sendMessage({realm: realmName, message: eMessages.roundFailed, args: {words: realm.words}});
        }, (30000));
        realm.on(eRealmEvent.wordFound, (wordFoundArgs: WordFoundArgs) => {
            console.log('Server: received wordFound', wordFoundArgs)
            clearTimeout(roundTimer);
            const winnerAddress = wordFoundArgs.winner;
            const winner = this.users.get(winnerAddress);
            if (!winner) {
                throw new Error('Unable to find the user with address ' + winnerAddress);
            }
            this.sendMessage({
                realm: realmName,
                message: eMessages.roundCompleted,
                args: {word: wordFoundArgs.word, winnerName: winner?.name as string, winnerAddress: winnerAddress}
            });
        })
        return realm.words;
    }

    private sendMessage(eventArgs: WSMessageArgs) {
        console.log('Server: sendMessage', eventArgs);
        this.emit(eServerEvents.sendMessage, eventArgs);
    }

    public updateImage(realmName: string, image: string) {
        if (!this.realms.has(realmName)) {
            throw new Error('UNable to find the realm with name ' + realmName);
        }
        const realm = this.realms.get(realmName) as Realm;
        realm.image = image;
        this.sendMessage({realm: realmName, message: eMessages.imageUpdated, args: {imageUrl: `/image/${realmName}`}});
    }

    public getImage(realmName: string): string {
        if (!this.realms.has(realmName)) {
            throw new Error('UNable to find the realm with name ' + realmName);
        }
        const realm = this.realms.get(realmName) as Realm;
        return realm.image as string;
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

}