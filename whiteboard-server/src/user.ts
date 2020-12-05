import { Realm } from './realm';
import { EventEmitter } from "events";

export enum eUserEvents {
    disconnect = 'disconnect'
}
export interface DisconnectArgs {}

export class User extends EventEmitter {
    constructor(public name: string, public address: string, public realm: Realm) {
        super();
    }
    public disconnect() {
        this.emit(eUserEvents.disconnect, {});
    }
}