export class UIConnectWhiteboard {
    txt: UIText;
    constructor(private parent: UIShape) {
        const txt = new UIText(parent);
        txt.value = 'Please open the whiteboard at the following url:'
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