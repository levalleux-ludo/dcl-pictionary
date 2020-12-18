import { IUI } from "./UIManager";

export class UITimedOut implements IUI {
    txt: UIText;
    drawerName = '';
    closeButton: UIImage;

    constructor(private parent: UIShape) {
        const txt = new UIText(parent);
        txt.value = `Time's out!`
        txt.hTextAlign = 'center';
        txt.positionY = 0;
        txt.width = '100%';
        txt.opacity = 0.8;
        txt.fontAutoSize = true;
        this.txt = txt;

        const closeButton = new UIImage(parent, new Texture("images/close.png"))
        this.closeButton = closeButton;
        closeButton.name = 'closeButton';
        closeButton.width = "128px"
        closeButton.height = "75px"
        closeButton.positionX = "0px";
        closeButton.positionY = "-100px"
        closeButton.sourceWidth = 130
        closeButton.sourceHeight = 78
        closeButton.isPointerBlocker = true
        closeButton.onClick = new OnClick(() => {
            this.setVisible(false);
        });

        this.setVisible(false);

    }

    setVisible(visible: boolean) {
        this.txt.visible = visible;
        this.closeButton.visible = visible;
    }

}