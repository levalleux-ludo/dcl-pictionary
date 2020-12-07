import { IUI } from "./UIManager";

export class UITimedOut implements IUI {
    txt: UIText;
    drawerName = '';

    constructor(private parent: UIShape) {
        const txt = new UIText(parent);
        txt.value = `Time's out!`
        txt.hTextAlign = 'center';
        txt.positionY = 0;
        txt.width = '100%';
        txt.opacity = 0.8;
        txt.fontAutoSize = true;
        this.txt = txt;
        this.setVisible(false);

    }

    setVisible(visible: boolean) {
        this.txt.visible = visible;
    }

}