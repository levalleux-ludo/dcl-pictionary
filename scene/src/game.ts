import { WhiteBoard } from './WhiteBoard';
import { WhiteBoardClient, WhiteBoardEvent } from './whiteboard-client';
/// --- Set up a system ---

class RotatorSystem {
  // this group will contain every entity that has a Transform component
  group = engine.getComponentGroup(Transform)

  update(dt: number) {
    // iterate over the entities of the group
    for (let entity of this.group.entities) {
      // get the Transform component of the entity
      const transform = entity.getComponent(Transform)

      // mutate the rotation
      transform.rotate(Vector3.Up(), dt * 10)
    }
  }
}

// Add a new instance of the system to the engine
// engine.addSystem(new RotatorSystem())

/// --- Spawner function ---

function spawnCube(x: number, y: number, z: number) {
  // create the entity
  const cube = new Entity()

  // add a transform to the entity
  cube.addComponent(new Transform({ position: new Vector3(x, y, z) }))

  // add a shape to the entity
  cube.addComponent(new BoxShape())

  // add the entity to the engine
  engine.addEntity(cube)

  return cube
}

/// --- Spawn a cube ---

const cube = spawnCube(8, 1, 8)

cube.addComponent(
  new OnClick(() => {
    cube.getComponent(Transform).scale.z *= 1.1
    cube.getComponent(Transform).scale.x *= 0.9

    spawnCube(Math.random() * 8 + 1, Math.random() * 8, Math.random() * 8 + 1)
  })
)

const whiteboardClient = new WhiteBoardClient();
whiteboardClient.onReady.addListener(WhiteBoardEvent, this, () => {
  log('whiteboardClient ready');
})


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
whiteboardClient.onRefreshImage.addListener(WhiteBoardEvent, this, (imageUrl) => {
  log('whiteboardClient: onRefreshImage');
  whiteBoard.refreshImage();
})

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
  position: new Vector3(1,0,18),
  scale: new Vector3(10,10,10),
  rotation: Quaternion.Euler(-90, 0, 0)
}))
engine.addEntity(nelson);

const phonebox = new Entity();
phonebox.addComponent(new GLTFShape('models/phonebox.gltf'));
phonebox.addComponent(new Transform({
  position: new Vector3(1,0,16),
  scale: new Vector3(4.5,4.5,4.5),
  rotation: Quaternion.Euler(0, 0, 0)
}))
engine.addEntity(phonebox);

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

const streetlamp = new Entity();
streetlamp.addComponent(new GLTFShape('models/streetlamp.gltf'));
streetlamp.addComponent(new Transform({
  position: new Vector3(10,0,10),
  scale: new Vector3(0.25,0.25,0.25),
  rotation: Quaternion.Euler(0, 0, 0)
}))
engine.addEntity(streetlamp);

const pavement = new Entity();
pavement.addComponent(new GLTFShape('models/pavement.gltf'));
pavement.addComponent(new Transform({
  position: new Vector3(16,0,16),
  scale: new Vector3(0.498,0.498,0.498),
  rotation: Quaternion.Euler(0, 0, 0)
}))
engine.addEntity(pavement);
