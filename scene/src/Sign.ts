export class Sign extends Entity {
    constructor() {
        super();
        const material1 = new Material();
        material1.albedoTexture = new Texture('images/pictionary_circus.png');
        const material2 = new Material();
        material2.albedoColor = Color4.Black();
        const plane1 = new Entity();
        plane1.setParent(this);
        plane1.addComponent(new Transform({
            position: new Vector3(0,2.2,0)
        }))
        plane1.addComponent(material1);
        const plane2 = new Entity();
        plane1.setParent(this);
        plane1.addComponent(new Transform({
            position: new Vector3(0,2.2,0)
        }))
        plane1.addComponent(material2);
    }

}