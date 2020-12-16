import { stateManager, StateEvent, eState } from './StateManager';
import { getCurrentRealm } from '@decentraland/EnvironmentAPI';
import { WHITEBOARD_APP_URL } from './Constants';
import utils from "../node_modules/decentraland-ecs-utils/index"
import { PhoneBoxCaption } from "./PhoneBoxCaption";
import { getAppUrl, getHTTPUrl, parseURL } from "./Utils";
import { movePlayerTo } from '@decentraland/RestrictedActions';

export enum ePhoneBoxEvents {
    CameraEnter = 'CameraEnter',
    CameraExit = 'CameraExit'
}
@EventConstructor()
export class PhoneBoxEvent {
  constructor(public event: ePhoneBoxEvents, public data: any ) {
  }
}

export class PhoneBox extends Entity {
    public events = new EventManager();
    phoneBoxCaption: PhoneBoxCaption;
    constructor() {
        super();
        this.addComponent(new GLTFShape('models/phonebox.gltf'));
        this.phoneBoxCaption = new PhoneBoxCaption();
        this.phoneBoxCaption.spawn(this, new Transform({position: new Vector3(0,0.8,0)}));

        // create trigger area object, setting size and relative position
        let triggerBox = new utils.TriggerBoxShape(new Vector3(1,2,1), Vector3.Up())

        

        // create the link
        const link = new Entity()
        link.setParent(this)
    
        link.addComponent(new GLTFShape('b88efbbf-2a9a-47b4-86e1-e38ecc2b433b/models/hiper.glb'))
        link.addComponent(new Transform({
            position: new Vector3(0.18,0.3,0),
            scale: new Vector3(0.3,0.1,0.1),
            rotation: Quaternion.Euler(0,90,0)
        }))
        
    
        let url = parseURL(WHITEBOARD_APP_URL)
    
        let locationString = 'Whiteboard App'

        const qrCode = new Entity();
        qrCode.setParent(this);
        qrCode.addComponent(new PlaneShape());
        qrCode.addComponent(new Transform({
            position: new Vector3(0.17,0.38,0),
            scale: new Vector3(0.06,0.05,0.5),
            rotation: Quaternion.Euler(0,90,0)
        }))
    
        stateManager.onChange.addListener(StateEvent, this, (event) => {
            switch (event.newState.value) {
                case eState.NO_DRAWER: {
                    this.phoneBoxCaption.show();
                    break;
                }
                case eState.DRAWER: {
                    this.phoneBoxCaption.hide();
                    break;
                }
                case eState.DRAWING: {
                    this.phoneBoxCaption.hide();
                    break;
                }
                case eState.GUESSING: {
                    this.phoneBoxCaption.hide();
                    break;
                }
                case eState.END_DRAWING: {
                    this.phoneBoxCaption.show();
                    this.movePlayerOut();
                    break;
                }
                case eState.TIMEDOUT:
                case eState.WINNER:
                case eState.OTHER_WINNER: {
                    this.phoneBoxCaption.show();
                    break;
                }
                default: {
                    break;
                }
            }
        })

        //create trigger for entity
        this.addComponent(
            new utils.TriggerComponent(
                triggerBox, //shape
                0, //layer
                0, //triggeredByLayer
                () => { //onTriggerEnter
                    log("triggered onTriggerEnter!")
                },
                () => { //onTriggerExit
                    log("triggered onTriggerExit!")
                },
                () => { //onCameraEnter
                    log("triggered onCameraEnter!")
                    getHTTPUrl('whiteboard', 'qrcode').then((url) => {
                        log('qrcode url', url);
                        const qrCodeMaterial = new Material();
                        qrCodeMaterial.albedoTexture = new Texture(url);
                        qrCode.addComponent(qrCodeMaterial);
                    });
                    getAppUrl().then((url) => {
                        log('WhiteboardApp url', url);
                        link.addComponent(
                            new OnPointerDown(
                              async function () {
                                openExternalURL(url)
                              },
                              {
                                button: ActionButton.PRIMARY,
                                hoverText: locationString,
                              }
                            )
                          )
                    })
            
                    this.events.fireEvent(new PhoneBoxEvent(ePhoneBoxEvents.CameraEnter, {}))
            
                },
                () => { //onCameraExit
                    log("triggered onCameraExit!")
                    this.events.fireEvent(new PhoneBoxEvent(ePhoneBoxEvents.CameraExit, {}))
                },
                // true
            )
        )
    }

    movePlayerOut() {
        const tr = this.getComponent(Transform);
        movePlayerTo(tr.position.add(Vector3.Forward().scale(2)), Vector3.Zero());
    }
}