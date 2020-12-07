
// const texture = new Texture(`https://res.cloudinary.com/twenty20/private_images/t_watermark-criss-cross-10/v1481548416000/photosp/f859978f-243f-4e75-a935-544e3c453607/stock-photo-wall-brick-ceramic-texture-bricks-colored-coloured-f859978f-243f-4e75-a935-544e3c453607.jpg`);

import { WHITEBOARD_HTTP } from "./Constants";
import { getHTTPUrl } from "./Utils";



export class WhiteBoard extends Entity {
    panel: Entity;
    image: Entity;
    constructor() {
        super();
        this.panel = new Entity();
        this.panel.addComponent(new BoxShape())
        this.panel.addComponent(
            new Transform({
                position: Vector3.Zero(),
                scale: new Vector3(1,1,0.1)
            })
        )
        this.addComponent(new Billboard());
        this.panel.setParent(this);
        // const newImage = new Entity();
        // newImage.addComponent(new PlaneShape());
        // newImage.addComponent(new Transform({
        //     position: new Vector3(0,0,0.2),
        //     rotation: Quaternion.Euler(180, 0, 0)
        // }));
        // newImage.setParent(this);
        // this.image = newImage;
        // this.refreshImage();
    }

    refreshImage(imageUrl: string) {
        const material = new Material();
        // const material = this.image.getComponentOrCreate(Material);
        const url = `${WHITEBOARD_HTTP}/${imageUrl}?dummy=${Math.floor(10000000*Math.random())}`;
        material.albedoTexture = new Texture(url);
            // const texture = new Texture('iVBORw0KGgoAAAANSUhEUgAAAxoA…ak6PMJECAAAECBAgQIHASCEBdN1Rsm9OOAAAAAElFTkSuQmCC');
        const newImage = new Entity();
        newImage.addComponent(new PlaneShape());
        newImage.addComponent(new Transform({
            position: new Vector3(0,0,0.2),
            rotation: Quaternion.Euler(180, 0, 0)
        }));
        newImage.addComponentOrReplace(material);
        if (this.image) {
            this.image.setParent(undefined);
            engine.removeEntity(this.image);
        }
        newImage.setParent(this);
        this.image = newImage;

        // this.image.addComponentOrReplace(material);
    }

}