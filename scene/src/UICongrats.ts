import { blockchainManager } from './BlockchainManager';
import { IUI } from "./UIManager";

export class UICongrats implements IUI {
    txt: UIText;
    drawerName = '';
    claimButton: UIImage;
    closeButton: UIImage;
    tokenId: string

    constructor(private parent: UIShape) {
        const txt = new UIText(parent);
        txt.value = `Congratulations! You have found the correct word`
        txt.hTextAlign = 'center';
        txt.positionY = 0;
        txt.width = '100%';
        txt.opacity = 0.8;
        txt.fontAutoSize = true;
        this.txt = txt;

        const claimButton = new UIImage(parent, new Texture("images/claimNFT.png"))
        this.claimButton = claimButton;
        claimButton.name = "clickable-image"
        claimButton.width = "200px"
        claimButton.height = "75px"
        claimButton.positionX = "-100px";
        claimButton.positionY = "-100px"
        claimButton.sourceWidth = 203
        claimButton.sourceHeight = 77
        claimButton.isPointerBlocker = true
        claimButton.onClick = new OnClick(() => {
            // DO SOMETHING
            blockchainManager.claimNFT(this.tokenId).then(() => {
                this.setVisible(false);
            });
        })

        const closeButton = new UIImage(parent, new Texture("images/close.png"))
        this.closeButton = closeButton;
        closeButton.name = 'closeButton';
        closeButton.width = "128px"
        closeButton.height = "75px"
        closeButton.positionX = "70px";
        closeButton.positionY = "-100px"
        closeButton.sourceWidth = 130
        closeButton.sourceHeight = 78
        closeButton.isPointerBlocker = true
        closeButton.onClick = new OnClick(() => {
            this.setVisible(false);
        })

        this.setVisible(false);
    }

    setVisible(visible: boolean) {
        this.txt.visible = visible;
        this.claimButton.visible = visible;
        this.closeButton.visible = visible;
    }

    setTokenId(tokenId: string) {
        this.tokenId = tokenId;
    }

}