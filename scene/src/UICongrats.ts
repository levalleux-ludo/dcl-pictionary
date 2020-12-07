import { IUI } from "./UIManager";

export class UICongrats implements IUI {
    txt: UIText;
    drawerName = '';
    claimButton: UIImage;

    constructor(private parent: UIShape) {
        const txt = new UIText(parent);
        txt.value = `Congratulations! You have found the correct word`
        txt.hTextAlign = 'center';
        txt.positionY = 0;
        txt.width = '100%';
        txt.opacity = 0.8;
        txt.fontAutoSize = true;
        this.txt = txt;
        this.setVisible(false);

        const claimButton = new UIImage(parent, new Texture("images/claimNFT.png"))
        this.claimButton = claimButton;
        claimButton.name = "clickable-image"
        claimButton.width = "200px"
        claimButton.height = "75px"
        claimButton.hAlign = 'center'
        claimButton.positionY = "-100px"
        claimButton.sourceWidth = 203
        claimButton.sourceHeight = 77
        claimButton.isPointerBlocker = true
        claimButton.onClick = new OnClick(() => {
            // DO SOMETHING
        })
    }

    setVisible(visible: boolean) {
        this.txt.visible = visible;
    }

}