function Animate(timestamp) {
    animator = window.requestAnimationFrame(Animate);

    if (Pebble.buttons.length > 0) {
        canvas.domElement.style.cursor = "auto";
        Pebble.buttons.forEach(button => {
            if (button.parent.visible && button.visible) {
                button.update(pointer, canvas.domElement);
                if (button.state == "over" || button.state == "down") {
                    if (button.parent !== undefined) {
                        canvas.domElement.style.cursor = "pointer";
                    }
                }
            }
        });
    }

    Pebble.render(canvas.domElement, stage, true, Pebble.getLagOffset(timestamp, world.Scene.update));

}