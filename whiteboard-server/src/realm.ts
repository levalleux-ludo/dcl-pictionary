import { User } from './user';
import { EventEmitter } from 'events';
import { RealmStatus } from './iserver';

export enum eRealmEvent {
    wordFound = 'wordFound'
}
export interface WordFoundArgs {
    word: string,
    winner: string;
}


export class Realm extends EventEmitter{
    public drawer: User|undefined;
    public words: string[] = [];
    public image: string|undefined;
    public timer: NodeJS.Timeout|undefined;
    constructor(private _name: string) {
        super();
    }
    public get name() {
        return this._name;
    }

    public checkWord(word: string): boolean {
        let result = false;
        for (const aWord of this.words) {
            console.log(`compare '${word}' with '${aWord}'`);
            if (this.compareString(word, aWord)) {
                result = true;
                break;
            }
        }
        console.log('check word', word, result, this.words);
        return result;
    }

    private compareString(str1: string, str2: string): boolean {
        str1 = str1.substr(0, str2.length).toLowerCase();
        str2 = str2.toLowerCase();
        // for (var c=0; c<str1.length; c++) {
        //     if (str1.charCodeAt(c) != str2.charCodeAt(c)) {
        //         console.warn('c:'+c+' '+str1.charCodeAt(c)+'!='+str2.charCodeAt(c));
        //         return false;
        //     }
        // }
        return str1 === str2;
    }

    public submitWord(word: string, playerAddress: string) {
        if (this.checkWord(word)) {
            this.words = [];
            this.wordFound({word, winner: playerAddress});
            return true;
        }
        return false;
    }

    public getImageUrl() {
        return `image/${this.name}`;
    }

    // public set drawerAddress(value: string|undefined) {
    //     this._drawerAddress = value;
    // }

    // public get drawerAddress(): string|undefined {
    //     return this._drawerAddress;
    // }

    // public set words(value: string[])

    private wordFound(eventArgs: WordFoundArgs) {
        console.log('Realm:wordFound', eventArgs);
        this.emit(eRealmEvent.wordFound, eventArgs);
    }

    public getStatus(): RealmStatus {
        return {
            drawer: this.drawer ? {name: this.drawer?.name, address: this.drawer?.address} : undefined,
            imageUrl: this.getImageUrl()
        };
    }
}