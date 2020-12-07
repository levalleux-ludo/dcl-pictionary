export enum eState {
    NO_DRAWER, // There is nobody drawer yet in my realm
    DRAWER, // I am the drawer and not yet drawing
    DRAWING, // I am the drawer and drawing
    GUESSING, // I am not the drawer and try to guess the word
    TIMEDOUT, // End of the drawing period, nobody found the word
    WINNER, // End of the drawing period, I have found the word
    OTHER_WINNER, // End of the drawing period, someone else has found the word
}

@EventConstructor()
export class StateEvent {
  constructor(public newState: {value: eState, args?: any}) {
  }
}

class StateManager  {
    private _state: {value: eState, args?: any};
    public onChange = new EventManager();

    constructor() {
        this._state = {value: eState.NO_DRAWER};
    }

    public setState(value: eState, args?: any) {
        if (this._state.value !== value) {
            log('switch to state', value);
            this._state = {value, args};
            this.onChange.fireEvent(new StateEvent(this._state));
        }
    }
    public get state(): {value: eState, args?: any} {
        return this._state;
    }
    public raiseEvent() {
        this.onChange.fireEvent(new StateEvent(this._state));
    }
}

export const stateManager = new StateManager();