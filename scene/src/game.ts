import utils from "../node_modules/decentraland-ecs-utils/index"
import { blockchainManager } from './BlockchainManager';
import { eState, stateManager } from './StateManager';
import { UIManager } from './UIManager';
import { UIConnectWhiteboard } from './UIConnectWhiteboard';
import { ePhoneBoxEvents, PhoneBox, PhoneBoxEvent } from './PhoneBox';
import { PhoneBoxCaption } from './PhoneBoxCaption';
import { WhiteBoard } from './WhiteBoard';
import { whiteboardClient, WhiteBoardEvent } from './whiteboard-client';
import { Sign } from "./Sign";

const gameCanvas = new UICanvas();

let whiteBoard = new WhiteBoard()
// box.addComponent(new BoxShape())
whiteBoard.addComponent(
  new Transform({
    position: new Vector3(8, 6.5, 10),
    scale: new Vector3(10,5,1)
  })
)
// box.addComponent(new Billboard())
engine.addEntity(whiteBoard)


// const harvey_Nichols = new Entity();
// harvey_Nichols.addComponent(new GLTFShape('models/Harvey_Nichols.gltf'));
// harvey_Nichols.addComponent(new Transform({
//   position: new Vector3(28,0,28),
//   scale: new Vector3(0.5,0.5,0.5),
//   rotation: Quaternion.Euler(0, 180, 0)
// }))
// engine.addEntity(harvey_Nichols);

// const sg_bus = new Entity();
// sg_bus.addComponent(new GLTFShape('models/sg-bus.gltf'));
// sg_bus.addComponent(new Transform({
//   position: new Vector3(20,0,20),
//   scale: new Vector3(1,1,1),
//   rotation: Quaternion.Euler(0, 180, 0)
// }))
// engine.addEntity(sg_bus);

// const old_house = new Entity();
// old_house.addComponent(new GLTFShape('models/old_house.gltf'));
// old_house.addComponent(new Transform({
//   position: new Vector3(10,0,10),
//   scale: new Vector3(0.01,0.01,0.01),
//   rotation: Quaternion.Euler(0, 0, 0)
// }))
// engine.addEntity(old_house);

// const pris = new Entity();
// pris.addComponent(new GLTFShape('models/pris.gltf'));
// pris.addComponent(new Transform({
//   position: new Vector3(7,0,32),
//   scale: new Vector3(10,10,10),
//   rotation: Quaternion.Euler(-90, 0, 0)
// }))
// engine.addEntity(pris);

// const troca = new Entity();
// troca.addComponent(new GLTFShape('models/trocadero.gltf'));
// troca.addComponent(new Transform({
//   position: new Vector3(20,0,15),
//   scale: new Vector3(0.1,0.1,0.1),
//   rotation: Quaternion.Euler(0, 180, 0)
// }))
// engine.addEntity(troca);

// const oldvic = new Entity();
// oldvic.addComponent(new GLTFShape('models/oldvic.gltf'));
// oldvic.addComponent(new Transform({
//   position: new Vector3(20,0.15,7),
//   scale: new Vector3(0.6,0.6,0.6),
//   rotation: Quaternion.Euler(-0.7, 12, 0)
// }))
// engine.addEntity(oldvic);

const nelson = new Entity();
nelson.addComponent(new GLTFShape('models/nelson.gltf'));
nelson.addComponent(new Transform({
  position: new Vector3(5,0,17.5),
  scale: new Vector3(20,20,20),
  rotation: Quaternion.Euler(-90, 0, 0)
}))
engine.addEntity(nelson);

const uIConnectWhiteboard = new UIConnectWhiteboard(gameCanvas);

const phonebox = new PhoneBox();
phonebox.addComponent(new Transform({
  position: new Vector3(17.5,0.08,17),
  scale: new Vector3(4.5,5.5,4.5),
  rotation: Quaternion.Euler(0, 0, 0)
}))
engine.addEntity(phonebox);
phonebox.events.addListener(PhoneBoxEvent, this, (e) => {
  log('PhoneBoxEvent', e);
  if (e.event === ePhoneBoxEvents.CameraEnter) {
    // uIConnectWhiteboard.setVisible(true);
    if (stateManager.state.value === eState.NO_DRAWER) {
      stateManager.setState(eState.DRAWER);
    }
  } else if (e.event === ePhoneBoxEvents.CameraExit) {
    // uIConnectWhiteboard.setVisible(false);
    if (stateManager.state.value === eState.DRAWER) {
      stateManager.setState(eState.NO_DRAWER);
    }
  }
})


// const drama = new Entity();
// drama.addComponent(new GLTFShape('models/drama.gltf'));
// drama.addComponent(new Transform({
//   position: new Vector3(16,-0.4,16),
//   scale: new Vector3(0.4,0.4,0.4),
//   rotation: Quaternion.Euler(0, 180, 0)
// }))
// engine.addEntity(drama);

// const brownstone = new Entity();
// brownstone.addComponent(new GLTFShape('models/brownstone.gltf'));
// brownstone.addComponent(new Transform({
//   position: new Vector3(20,0,20),
//   scale: new Vector3(0.01,0.01,0.01),
//   rotation: Quaternion.Euler(-90, 0, 0)
// }))
// engine.addEntity(brownstone);

// const street = new Entity();
// street.addComponent(new GLTFShape('models/street.gltf'));
// street.addComponent(new Transform({
//   position: new Vector3(10,0,10),
//   scale: new Vector3(0.02,0.02,0.02),
//   rotation: Quaternion.Euler(0, 0, 0)
// }))
// engine.addEntity(street);

const lamp_positions = [
  new Vector3(8, 0.15, 10),
  new Vector3(11,0.15,12),
  new Vector3(14, 0.15, 11),
  new Vector3(17, 0.15, 9),
  new Vector3(20, 0.15, 7),
  new Vector3(4, 0.15, 14),
  new Vector3(8, 0.15, 17),
  new Vector3(6, 0.15, 20.5),
  new Vector3(3, 0.15, 21.5),
  new Vector3(3, 0.15, 28),
  new Vector3(7, 0.15, 26),
  new Vector3(11, 0.15, 23.5),
  new Vector3(15, 0.15, 24.5),
  new Vector3(20, 0.15, 27.5),
  new Vector3(20, 0.15, 30),
  // new Vector3(),
  // new Vector3(),
  // new Vector3(),
  // new Vector3(),
]
for (const lamp_position of lamp_positions) {
  const streetlamp = new Entity();
  streetlamp.addComponent(new GLTFShape('models/lamppost.gltf'));
  streetlamp.addComponent(new Transform({
    position: lamp_position,
    scale: new Vector3(1,1,1),
    rotation: Quaternion.Euler(0, 0, 0)
  }))
  engine.addEntity(streetlamp);
}

const pavement = new Entity();
pavement.addComponent(new GLTFShape('models/pavement.gltf'));
pavement.addComponent(new Transform({
  position: new Vector3(16,0,16),
  scale: new Vector3(0.498,0.498,0.498),
  rotation: Quaternion.Euler(0, 0, 0)
}))
engine.addEntity(pavement);

const uiManager = new UIManager(gameCanvas);

stateManager.raiseEvent();

blockchainManager.getNFTBalance();

// const triggerBox = new utils.TriggerBoxShape(new Vector3(32,2,32), Vector3.Up())
// const triggerEntity = new Entity();
// triggerEntity.addComponent(
//   new utils.TriggerComponent(
//       triggerBox, //shape
//       0, //layer
//       0, //triggeredByLayer
//       undefined, //onTriggerEnter
//       undefined, //onTriggerExit
//       () => { //onCameraEnter
//           log("triggerEntity onCameraEnter!")
         
//       },
//       undefined, //onCameraExit
//       true
//   )
// )

whiteboardClient.onReady.addListener(WhiteBoardEvent, this, () => {
  log('whiteboardClient ready');
  whiteboardClient.onRefreshImage.addListener(WhiteBoardEvent, this, (event) => {
    log('whiteboardClient: onRefreshImage');
    whiteBoard.refreshImage(event.payload);
  })
})
