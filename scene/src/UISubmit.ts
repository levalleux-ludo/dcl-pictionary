import * as ui from '../node_modules/@dcl/ui-utils/index'

import { eState, stateManager } from './StateManager';
import { whiteboardClient } from './whiteboard-client';
import { IUI } from "./UIManager";

export class UISubmit implements IUI {
    txt: UIText;
    textInput: UIInputText;
    submitButton: UIImage;
    drawerName = '';
    txtResult: UIText;
    bar: ui.UIBar;

    constructor(private parent: UIShape) {
        const txt = new UIText(parent);
        this.txt = txt;
        txt.value = `Try to guess what ${this.drawerName} is drawing!`
        txt.hTextAlign = 'center';
        txt.positionY = -50;
        txt.width = 300;
        txt.fontAutoSize = true;
        txt.opacity = 1;

        const txtResult = new UIText(parent);
        this.txtResult = txtResult;
        txtResult.value = '';
        txtResult.hTextAlign = 'center';
        txtResult.positionY = -150;
        txtResult.width = 300;
        txtResult.fontAutoSize = true;
        txtResult.opacity = 1;

        const textInput = new UIInputText(parent)
        this.textInput = textInput;
        textInput.width = "200px"
        textInput.height = "40px"
        // textInput.vAlign = "bottom"
        // textInput.hAlign = "center"
        textInput.hTextAlign = 'center';
        textInput.vTextAlign = 'center';
        textInput.fontSize = 15;
        textInput.placeholder = "Write a word here"
        textInput.positionX = "-50px"
        textInput.positionY = "-100px"
        textInput.isPointerBlocker = true
        textInput.onTextSubmit = new OnTextSubmit((x) => {
            this.txtResult.value = '';
            log('onTextSubmit', x)
            whiteboardClient.submitWord(x.text, true).then((result) => {
                if (!result.checkResult) {
                    this.txtResult.value=`'${result.word}' is not the word. Try again!`;
                } else {
                    whiteboardClient.submitWord(x.text);
                }
            })
            // this.textInput.value = x.text;
            // this.submitButton.visible = (this.textInput.value !== '');
        })

        // const submitButton = new UIImage(parent, new Texture("images/submit.png"))
        // this.submitButton = submitButton;
        // submitButton.name = "clickable-image"
        // submitButton.width = "90px"
        // submitButton.height = "45px"
        // submitButton.positionY = "-100px"
        // submitButton.positionX = "100px"
        // submitButton.sourceWidth = 158
        // submitButton.sourceHeight = 78
        // submitButton.isPointerBlocker = true
        // submitButton.onClick = new OnClick(() => {
        //     // DO SOMETHING
        // })

        const bar = new ui.UIBar(100);
        this.bar = bar;

        this.setVisible(false);
    }

    setVisible(visible: boolean) {
        this.txt.visible = visible;
        this.textInput.visible = visible;
        this.txtResult.visible = visible;
        visible ? this.bar.show() : this.bar.hide();
        // this.submitButton.visible = (this.textInput.value !== '');
    }

    setDrawerName(name: string) {
        this.drawerName = name;
        this.txt.value = `Try to guess what ${this.drawerName} is drawing!`
    }

    setTimeout(value: number) {
        this.bar.set(value);
    }

}