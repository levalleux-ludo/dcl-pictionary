export class PhoneBoxCaption {
    entity = new Entity();
    host: Entity;

    public spawn(host: Entity, transform: Transform) {
        this.host = host;
        this.entity.addComponent(transform);
        const arrow = new Entity(host.name + '-button')
        arrow.addComponent(new Billboard())
        arrow.setParent(this.entity)
        const caption = new Entity();
        const text = new TextShape('Enter To Start Drawing');
        text.billboard = true;
        text.fontSize = 2;
        text.color = Color3.Gray();
        text.outlineColor = Color3.Green();
        text.outlineWidth = 0.4;
        caption.addComponent(text);

        caption.setParent(this.entity);

        const animator = new Animator()
        const clip = new AnimationState('ArmatureAction', { looping: true })
        animator.addClip(clip)

        arrow.addComponent(animator)

        arrow.addComponent(new GLTFShape('a491051c-8092-4245-ae85-d274e90d8443/models/Arrow.glb'))
        clip.play();

        this.show();
    }

    hide() {
        this.entity.setParent(undefined);
    }

    show() {
        this.entity.setParent(this.host);
    }
}