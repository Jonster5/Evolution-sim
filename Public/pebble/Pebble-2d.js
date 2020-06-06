if (typeof(Pebble) === "undefined" || Pebble === null) {
    var Pebble;
    Pebble = class {
        static info() {
            return `visit www.slidemations.com for info on the Pebble API`;
        }
        static randomInt(min = 0, max = 10) {
            return Math.floor(Math.random() * (max - min) + min);
        }
        static randomFloat(min = 0, max = 0, precision) {
            if (typeof(precision) == 'undefined') {
                precision = 2;
            }
            return parseFloat(Math.min(min + (Math.random() * (max - min)), max).toFixed(precision));
        }
    }
}

Pebble.draggable = [];

Pebble.DisplayObject = class {
    constructor() {
        //The sprite's position and size
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;

        //Rotation, alpha, visible and scale properties
        this.rotation = 0;
        this.alpha = 1;
        this.visible = true;
        this.scaleX = 1;
        this.scaleY = 1;

        //`pivotX` and `pivotY` let you set the sprite's axis of rotation
        this.pivotX = 0.5;
        this.pivotY = 0.5;

        //Add `vx` and `vy` (velocity) variables that will help us move the sprite
        this.vx = 0;
        this.vy = 0;

        //A "private" `_layer` property
        this._layer = 0;

        //A `children` array on the sprite that will contain all the
        //child sprites in this container
        this.children = [];

        //The sprite's `parent` property 
        this.parent = undefined;

        //The sprite's `children` array
        // this.children = [];

        //Optional drop shadow properties.
        //Set `shadow` to `true` if you want the sprite to display a
        //shadow
        this.shadow = false;
        this.shadowColor = "rgba(100, 100, 100, 0.5)";
        this.shadowOffsetX = 3;
        this.shadowOffsetY = 3;
        this.shadowBlur = 3;

        //Optional blend mode property
        this.blendMode = undefined;

        //Properties for advanced features: 

        //Image states and animation
        this.frames = [];
        this.loop = true;
        this._currentFrame = 0;
        this.playing = false;

        //Can the sprite be dragged? 
        this._draggable = undefined;

        //Is the sprite circular? If it is, it will be given a `radius`
        //and `diameter`
        this._circular = false;

        //Is the sprite `interactive`? If it is, it can become click-able
        //or touchable
        this._interactive = false;

        //The sprite's previous x and y positions
        this.previousX = 0;
        this.previousY = 0;
    }

    /* Essentials */

    //Global position
    get gx() {
        if (this.parent) {

            //The sprite's global x position is a combination of
            //its local x value and its parent's global x value
            return this.x + this.parent.gx;
        } else {
            return this.x;
        }
    }
    get gy() {
        if (this.parent) {
            return this.y + this.parent.gy;
        } else {
            return this.y;
        }
    }

    //Depth layer
    get layer() {
        return this._layer;
    }
    set layer(value) {
        this._layer = value;
        if (this.parent) {
            //Sort the sprite’s parent’s `children` array so that sprites with a
            //higher `layer` value are moved to the end of the array
            this.parent.children.sort((a, b) => a.layer - b.layer);
        }
    }

    //The `addChild` method lets you add sprites to this container
    addChild(sprite) {
        //Remove the sprite from its current parent, if it has one, and
        //the parent isn't already this object
        if (sprite.parent !== undefined) {
            sprite.parent.removeChild(sprite);
        }
        //Make this object the sprite's parent and
        //add it to this object's `children` array
        sprite.parent = this;
        this.children.push(sprite);
    }

    //The `removeChild` method lets you remove a sprite from its
    //parent container
    removeChild(sprite) {
        if (sprite.parent === this) {
            this.children.splice(this.children.indexOf(sprite), 1);
        } else {
            throw new Error(sprite + "is not a child of " + this);
        }
    }

    //Getters that return useful points on the sprite
    get halfWidth() {
        return this.width / 2;
    }
    get halfHeight() {
        return this.height / 2;
    }
    get centerX() {
        return this.x + this.halfWidth;
    }
    set centerX(value = 0) {
        this.x = value - this.halfWidth;
    }
    get centerY() {
        return this.y + this.halfHeight;
    }
    set centerY(value = 0) {
        this.y = value - this.halfHeight;
    }

    /* Conveniences */

    //A `position` getter. It returns an object with x and y properties
    get position() {
        return { x: this.x, y: this.y };
    }

    //A `setPosition` method to quickly set the sprite's x and y values
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    //The `localBounds` and `globalBounds` methods return an object
    //with `x`, `y`, `width`, and `height` properties that define
    //the dimensions and position of the sprite. This is a convenience
    //to help you set or test boundaries without having to know
    //these numbers or request them specifically in your code.
    get localBounds() {
        return {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        };
    }
    get globalBounds() {
        return {
            x: this.gx,
            y: this.gy,
            width: this.gx + this.width,
            height: this.gy + this.height
        };
    }

    //`empty` is a convenience property that will return `true` or
    //`false` depending on whether or not this sprite's `children`
    //array is empty
    get empty() {
        if (this.children.length === 0) {
            return true;
        } else {
            return false;
        }
    }

    //The "put" methods help you position 
    //another sprite in and around this sprite. You can position
    //sprites relative to this sprite's center, top, eight, bottom or
    //left sides. The `xOffset` and `yOffset`
    //arguments determine by how much the other sprite's position
    //should be offset from the position. 
    //In all these methods, `b` is the second sprite that is being
    //positioned relative to the first sprite (this one), `a`

    //Center `b` inside `a`
    putCenter(b, xOffset = 0, yOffset = 0) {
            let a = this;
            b.x = (a.x + a.halfWidth - b.halfWidth) + xOffset;
            b.y = (a.y + a.halfHeight - b.halfHeight) + yOffset;
        }
        //Position `b` above `a`
    putTop(b, xOffset = 0, yOffset = 0) {
            let a = this;
            b.x = (a.x + a.halfWidth - b.halfWidth) + xOffset;
            b.y = (a.y - b.height) + yOffset;
        }
        //Position `b` to the right of `a`
    putRight(b, xOffset = 0, yOffset = 0) {
            let a = this;
            b.x = (a.x + a.width) + xOffset;
            b.y = (a.y + a.halfHeight - b.halfHeight) + yOffset;
        }
        //Position `b` below `a`
    putBottom(b, xOffset = 0, yOffset = 0) {
            let a = this;
            b.x = (a.x + a.halfWidth - b.halfWidth) + xOffset;
            b.y = (a.y + a.height) + yOffset;
        }
        //Position `b` to the left of `a`
    putLeft(b, xOffset = 0, yOffset = 0) {
        let a = this;
        b.x = (a.x - b.width) + xOffset;
        b.y = (a.y + a.halfHeight - b.halfHeight) + yOffset;
    }

    //Some extra conveniences for working with child sprites

    //Swap the depth layer positions of two child sprites
    swapChildren(child1, child2) {
        let index1 = this.children.indexOf(child1),
            index2 = this.children.indexOf(child2);
        if (index1 !== -1 && index2 !== -1) {
            //Swap the indexes
            child1.childIndex = index2;
            child2.childIndex = index1;
            //Swap the array positions
            this.children[index1] = child2;
            this.children[index2] = child1;
        } else {
            throw new Error(`Both objects must be a child of the caller ${this}`);
        }
    }

    //`add` and `remove` let you add and remove many sprites at the same time
    add(...spritesToAdd) {
        spritesToAdd.forEach(sprite => this.addChild(sprite));
    }
    remove(...spritesToRemove) {
        spritesToRemove.forEach(sprite => this.removeChild(sprite));
    }
    addArray(spritesToAdd = []) {
        spritesToAdd.forEach(sprite => this.addChild(sprite));
    }
    removeArray(spritesToRemove = []) {
        spritesToRemove.forEach(sprite => this.removeChild(sprite));
    }

    /* Advanced features */

    //If the sprite has more than one frame, return the 
    //value of `_currentFrame`
    get currentFrame() {
        return this._currentFrame;
    }

    //The `circular` property lets you define whether a sprite
    //should be interpreted as a circular object. If you set
    //`circular` to `true`, the sprite is given `radius` and `diameter`
    //properties. If you set `circular` to `false`, the `radius`
    //and `diameter` properties are deleted from the sprite
    get circular() {
        return this._circular;
    }
    set circular(value) {

        //Give the sprite `diameter` and `radius` properties
        //if `circular` is `true`
        if (value === true && this._circular === false) {
            Object.defineProperties(this, {
                diameter: {
                    get() {
                        return this.width;
                    },
                    set(value) {
                        this.width = value;
                        this.height = value;
                    },
                    enumerable: true,
                    configurable: true
                },
                radius: {
                    get() {
                        return this.halfWidth;
                    },
                    set(value) {
                        this.width = value * 2;
                        this.height = value * 2;
                    },
                    enumerable: true,
                    configurable: true
                }
            });
            //Set this sprite's `_circular` property to `true`
            this._circular = true;
        }
        //Remove the sprite's `diameter` and `radius` properties
        //if `circular` is `false`
        if (value === false && this._circular === true) {
            delete this.diameter;
            delete this.radius;
            this._circular = false;
        }
    }

    //Is the sprite draggable by the pointer? If `draggable` is set
    //to `true`, the sprite is added to a `draggableSprites`
    //array. All the sprites in `draggableSprites` are updated each
    //frame to check whether they're being dragged
    get draggable() {
        return this._draggable;
    }
    set draggable(value) {
        if (value === true) {

            //Push the sprite into the `draggableSprites` array
            draggableSprites.push(this);
            this._draggable = true;
        }
        //If it's `false`, remove it from the `draggableSprites` array
        if (value === false) {

            //Splice the sprite from the `draggableSprites` array
            draggableSprites.splice(draggableSprites.indexOf(this), 1);
        }
    }

    //Is the sprite interactive? If `interactive` is set to `true`,
    //the sprite is run through the `makeInteractive` function.
    //`makeInteractive` makes the sprite sensitive to pointer
    //actions. It also adds the sprite to the `buttons` array,
    //which is updated each frame
    get interactive() {
        return this._interactive;
    }
    set interactive(value) {
        if (value === true) {

            //Add interactive properties to the sprite
            //so that it can act like a button
            makeInteractive(this);

            //Add the sprite to the global `buttons` array so
            //it can be updated each frame
            Pebble.buttons.push(this);

            //Set this sprite’s private `_interactive` property to `true`
            this._interactive = true;
        }
        if (value === false) {

            //Remove the sprite's reference from the 
            //`buttons` array so that it it's no longer affected
            //by mouse and touch interactivity
            buttons.splice(buttons.indexOf(this), 1);
            this._interactive = false;
        }
    }
}


Pebble.Canvas = class {
    constructor(
        domElement = document.body,
        width = 400,
        height = 400,
        border = "1px dashed black",
        background = "white",
    ) {
        let canvas = document.createElement('canvas');

        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);

        domElement.appendChild(canvas);

        let dpr = window.devicePixelRatio || 1;
        let rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        canvas.ctx = canvas.getContext('2d');
        canvas.ctx.scale(dpr, dpr);

        canvas.setAttribute("style", `width: ${width}px; height: ${height}px; border: ${border}; background: ${background};`);

        let obj = {
            width: width,
            height: height,
            scale: 0,
            ctx: canvas.ctx,
            domElement: canvas,
            parent: domElement,
            aspect: { x: width, y: height },
            scaleToWindow(bgcolor = "grey", pointer) {
                let scaleX, scaleY, scale;

                scaleX = window.innerWidth / this.width;
                scaleY = window.innerHeight / this.height;


                scale = Math.min(scaleX, scaleY);
                this.domElement.style.transformOrigin = "0 0";
                this.domElement.style.transform = "scale(" + scale + ")";


                if (parseFloat(this.domElement.style.width) > parseFloat(this.domElement.style.height)) {

                    let margin = (window.innerHeight - parseFloat(this.domElement.style.height) * scaleX) / 2;

                    this.domElement.style.marginTop = margin + "px";
                    this.domElement.style.marginBottom = margin + "px";
                } else {

                    let margin = (window.innerWidth - parseFloat(this.domElement.style.width) * scaleY) / 2;

                    this.domElement.style.marginLeft = margin + "px";
                    this.domElement.style.marginRight = margin + "px";
                }

                this.domElement.style.paddingLeft = 0;
                this.domElement.style.paddingRight = 0;
                this.domElement.style.display = "block";

                this.parent.style.backgroundColor = bgcolor;

                pointer.scale = scale;
                this.scale = scale;

            },
            exportAsPNG(fileName = "") {
                try {
                    let canvasElement = this.domElement;

                    let MIME_TYPE = "image/png";

                    let imgURL = canvasElement.toDataURL(MIME_TYPE);

                    let dlLink = document.createElement('a');
                    dlLink.download = fileName;
                    dlLink.href = imgURL;
                    dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');

                    document.body.appendChild(dlLink);
                    dlLink.click();
                    document.body.removeChild(dlLink);
                    return true;
                } catch (err) {
                    return false;
                }
            },
            exportAsJPG(fileName = "") {
                try {
                    let canvasElement = this.domElement;

                    let MIME_TYPE = "image/jpeg";

                    let imgURL = canvasElement.toDataURL(MIME_TYPE);

                    let dlLink = document.createElement('a');
                    dlLink.download = fileName;
                    dlLink.href = imgURL;
                    dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');

                    document.body.appendChild(dlLink);
                    dlLink.click();
                    document.body.removeChild(dlLink);
                    return true
                } catch (err) {
                    return err;
                }
            }
        }

        return obj;
    }
}

Pebble.Stage = class extends Pebble.DisplayObject {
    constructor(width = 0, height = 0) {
        super();
        this.width = width;
        this.height = height;
    }
}
Pebble.render = function(canvas, stage, interpolated = false, lagOffset) {
    let ctx = canvas.ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stage.children.forEach(sprite => {
        if (interpolated) displaySpriteI(sprite);
        else {
            displaySprite(sprite);
        }
    });

    function displaySpriteI(sprite) {
        //Only display the sprite if it's visible
        //and within the area of the canvas
        if (
            sprite.visible &&
            sprite.gx < canvas.width + sprite.width &&
            sprite.gx + sprite.width > -sprite.width &&
            sprite.gy < canvas.height + sprite.height &&
            sprite.gy + sprite.height > -sprite.height
        ) {

            //Save the canvas's present state
            ctx.save();

            //Interpolation
            if (sprite.previousX !== undefined) {
                sprite.renderX = (sprite.x - sprite.previousX) * lagOffset + sprite.previousX;
            } else {
                sprite.renderX = sprite.x;
            }
            if (sprite.previousY !== undefined) {
                sprite.renderY = (sprite.y - sprite.previousY) * lagOffset + sprite.previousY;
            } else {
                sprite.renderY = sprite.y;
            }

            //Draw the sprite at its interpolated position
            ctx.translate(
                sprite.renderX + (sprite.width * sprite.pivotX),
                sprite.renderY + (sprite.height * sprite.pivotY)
            );

            //Set the sprite's `rotation`, `alpha` and `scale`
            ctx.rotate(sprite.rotation);
            ctx.globalAlpha = sprite.alpha * sprite.parent.alpha;
            ctx.scale(sprite.scaleX, sprite.scaleY);

            //Display the sprite's optional drop shadow
            if (sprite.shadow) {
                ctx.shadowColor = sprite.shadowColor;
                ctx.shadowOffsetX = sprite.shadowOffsetX;
                ctx.shadowOffsetY = sprite.shadowOffsetY;
                ctx.shadowBlur = sprite.shadowBlur;
            }

            //Display the optional blend mode
            if (sprite.blendMode) ctx.globalCompositeOperation = sprite.blendMode;

            //Use the sprite's own `render` method to draw the sprite
            if (sprite.render) sprite.render(ctx);

            //If the sprite contains child sprites in its
            //`children` array, display them by recursively calling this very same
            //`displaySprite` function again

            if (sprite.children && sprite.children.length > 0) {
                //Reset the context back to the parent sprite's top left corner,
                //relative to the pivot point
                ctx.translate(-sprite.width * sprite.pivotX, -sprite.height * sprite.pivotY);
                //Loop through the parent sprite's children
                sprite.children.forEach(child => {
                    //display the child
                    displaySprite(child);
                });
            }

            //Restore the canvas to its previous state
            ctx.restore();
        }
    }

    function displaySprite(sprite) {
        if (sprite.visible &&
            sprite.gx < canvas.width + sprite.width &&
            sprite.gx + sprite.width >= -sprite.width &&
            sprite.gy < canvas.height + sprite.height &&
            sprite.gy + sprite.height >= -sprite.height
        ) {
            ctx.save();

            ctx.translate(
                sprite.x + (sprite.width * sprite.pivotX),
                sprite.y + (sprite.height * sprite.pivotY)
            );

            ctx.rotate(sprite.rotation);
            ctx.globalAlpha = sprite.alpha * sprite.parent.alpha;
            ctx.scale(sprite.scaleX, sprite.scaleY);

            if (sprite.shadow) {
                cx.shadowColor = sprite.shadowColor;
                ctx.shadowOffsetX = sprite.shadowOffsetX;
                ctx.shadowOffsetY = sprite.shadowOffsetY;
                ctx.shadowBlur = sprite.shadowBlur;
            }

            if (sprite.blendMode) ctx.globalCompositeOperation = sprite.blendMode;

            if (sprite.render) sprite.render(ctx);

            if (sprite.children && sprite.children.length > 0) {
                ctx.translate(-sprite.width * sprite.pivotX, -sprite.height * sprite.pivotY);

                sprite.children.forEach(child => {
                    displaySprite(child);
                });
            }
            ctx.restore();
        }
    }
}
Pebble.interpolationData = {
    _fps: 60,
    previous: 0,
    lag: 0,
    get FPS() {
        return this._fps;
    },
    set FPS(value) {
        this._fps = value;
    }
};
Pebble.frameData = {
    times: [],
    FPS: 0
}

Pebble.refreshLoop = function() {
    window.requestAnimationFrame(() => {
        const now = performance.now();
        while (Pebble.frameData.times.length > 0 && Pebble.frameData.times[0] <= now - 1000) {
            Pebble.frameData.times.shift();
        }
        Pebble.frameData.times.push(now);
        Pebble.frameData.FPS = Pebble.frameData.times.length;
        this.refreshLoop();
    });
}

Pebble.getLagOffset = function(timestamp, func) {
    let fps = this.interpolationData._fps;
    let frameDuration = 1000 / fps;

    if (!timestamp) timestamp = 0;
    let elapsed = timestamp - this.interpolationData.previous;

    if (elapsed > 1000) elapsed = frameDuration;

    this.interpolationData.lag += elapsed;

    function capturePreviousPositions(stage) {
        //Loop through all the children of the stage
        stage.children.forEach(sprite => {
            setPreviousPosition(sprite);
        });

        function setPreviousPosition(sprite) {
            //Set the sprite’s `previousX` and `previousY`
            sprite.previousX = sprite.x;
            sprite.previousY = sprite.y;
            //Loop through all the sprite's children
            if (sprite.children && sprite.children.length > 0) {
                sprite.children.forEach(child => {
                    //Recursively call `setPosition` on each sprite
                    setPreviousPosition(child);
                });
            }
        }
    }

    while (this.interpolationData.lag >= frameDuration) {
        capturePreviousPositions(stage);
        func();

        this.interpolationData.lag -= frameDuration;
    }

    this.interpolationData.previous = timestamp;

    return this.interpolationData.lag / frameDuration;
}
Pebble.buttons = [];

Pebble.Rectangle = function(width = 32, height = 32, fillStyle = "gray", strokeStyle = "none", lineWidth = 0, x = 0, y = 0) {
    let sprite = new RectangleCanvasObject(width, height, fillStyle, strokeStyle, lineWidth, x, y);
    if (stage) stage.addChild(sprite);
    return sprite;
}
Pebble.Circle = function(diameter = 32, fillStyle = "gray", strokeStyle = "none", lineWidth = 0, x = 0, y = 0) {
    let sprite = new CircleCanvasObject(diameter, fillStyle, strokeStyle, lineWidth, x, y);
    if (stage) stage.addChild(sprite);
    return sprite;
}
Pebble.Line = function(ax = 0, ay = 0, bx = 0, by = 0, strokeStyle = "none", lineWidth = 1, ) {
    let sprite = new LineCanvasObject(strokeStyle, lineWidth, ax, ay, bx, by);
    if (stage) stage.addChild(sprite);
    return sprite;
}
Pebble.Text = function(content = "", font = "12px sans-serif", fillStyle = "black", x = 0, y = 0) {
    let sprite = new TextCanvasObject(content, font, fillStyle, x, y);
    if (stage) stage.addChild(sprite);
    return sprite;
}
Pebble.Group = function(...spritesToGroup) {
    let sprite = new ObjectGrouper(spritesToGroup);
    if (stage) stage.addChild(sprite);
    return sprite;
}
Pebble.Sprite = function(source, x = 0, y = 0) {
    let sprite = new SpriteCanvasObject(source, x, y);
    if (sprite.frames.length > 0) Pebble.addStatePlayer(sprite);
    if (stage) stage.addChild(sprite);
    return sprite;
}
Pebble.Button = function(source, x, y) {
    let sprite = new ButtonObject(source, x, y);
    if (stage) stage.addChild(sprite);
    return sprite;
}
Pebble.Marker = function(x = 0, y = 0) {
    let sprite = new MarkerCanvasObject(x, y);
    if (stage) stage.addChild(sprite);
    return sprite;
}




class RectangleCanvasObject extends Pebble.DisplayObject {
    constructor(
        width = 32,
        height = 32,
        fillStyle = "gray",
        strokeStyle = "none",
        lineWidth = 0,
        x = 0,
        y = 0
    ) {
        super();

        Object.assign(this, {
            width,
            height,
            fillStyle,
            strokeStyle,
            lineWidth,
            x,
            y
        });
        this.mask = false;
    }

    render(ctx) {
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.fillStyle = this.fillStyle;
        ctx.beginPath();
        ctx.rect(-this.width * this.pivotX, -this.height * this.pivotY, this.width, this.height);
        if (this.strokeStyle !== "none") ctx.stroke();
        if (this.fillStyle !== "none") ctx.fill();
        if (this.mask && this.mask === true) ctx.clip();
    }
}

class MarkerCanvasObject extends Pebble.DisplayObject {
    constructor(
        x = 0,
        y = 0,
    ) {
        super();

        Object.assign(this, { x, y });
    }
}

class CircleCanvasObject extends Pebble.DisplayObject {
    constructor(
        diameter = 32,
        fillStyle = "gray",
        strokeStyle = "none",
        lineWidth = 0,
        x = 0,
        y = 0
    ) {
        super();

        this.circular = true;

        Object.assign(this, { diameter, fillStyle, strokeStyle, lineWidth, x, y });

        this.mask = false;
    }
    render(ctx) {
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.fillStyle = this.fillStyle;
        ctx.beginPath();
        ctx.arc(
            this.radius + (-this.diameter * this.pivotX),
            this.radius + -(this.diameter * this.pivotY),
            this.radius,
            0, 2 * Math.PI,
            false
        );
        if (this.strokeStyle !== "none") ctx.stroke();
        if (this.fillStyle !== "none") ctx.fill();
        if (this.mask && this.mask === true) ctx.clip();
    }
}

class LineCanvasObject extends Pebble.DisplayObject {
    constructor(
        strokeStyle = "none",
        lineWidth = 0,
        ax = 0, ay = 0, bx = 0, by = 0
    ) {
        super();
        Object.assign(this, { strokeStyle, lineWidth, ax, ay, bx, by });

        this.lineJoin = "rounded";
    }
    render(ctx) {
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.lineJoin = this.lineJoin;
        ctx.beginPath();
        ctx.moveTo(this.ax, this.ay);
        ctx.lineTo(this.bx, this.by);
        if (this.strokeStyle !== "none") ctx.stroke();
    }
}

class TextCanvasObject extends Pebble.DisplayObject {
    constructor(
        content = "",
        font = "12px sans-serif",
        fillStyle = "black",
        x, y
    ) {
        super();

        Object.assign(this, { content, font, fillStyle, x, y });

        this.textBaseline = "top";

        this.strokeText = "none";

        if (this.width === 0) {
            let c = new Pebble.Canvas();
            c.domElement.style.display = "none";
            c.domElement.style.position = "absolute";
            let ctx = c.ctx

            ctx.font = this.font;
            ctx.strokeStyle = this.strokeStyle;
            ctx.lineWidth = this.lineWidth;
            ctx.fillStyle = this.fillStyle;

            this.width = ctx.measureText(this.content).width;

            document.body.removeChild(c.domElement);
        }

        if (this.height === 0) {
            let c = new Pebble.Canvas();
            c.domElement.style.display = "none";
            c.domElement.style.position = "absolute";
            let ctx = c.ctx

            ctx.font = this.font;
            ctx.strokeStyle = this.strokeStyle;
            ctx.lineWidth = this.lineWidth;
            ctx.fillStyle = this.fillStyle;

            this.height = ctx.measureText("M").width;

            document.body.removeChild(c.domElement);
        }


    }
    render(ctx) {
        ctx.font = this.font;
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.fillStyle = this.fillStyle;

        this.width = ctx.measureText(this.content).width;
        this.height = ctx.measureText("M").width;

        ctx.translate(-this.width * this.pivotX, -this.height * this.pivotY);
        ctx.textBaseline = this.textBaseline;
        ctx.fillText(
            this.content,
            0,
            0
        );
        if (this.strokeText !== "none") ctx.strokeText();
    }
}

class ObjectGrouper extends Pebble.DisplayObject {
    constructor(...spritesToGroup) {

            //Call the DisplayObject's constructor
            super();

            //Group all the sprites listed in the constructor arguments
            spritesToGroup.forEach(sprite => this.addChild(sprite));
        }
        //Groups have custom `addChild` and `removeChild` methods that call
        //a `calculateSize` method when any sprites are added or removed
        //from the group
        //
    addChild(sprite) {
        if (sprite.parent) {
            sprite.parent.removeChild(sprite);
        }
        sprite.parent = this;
        this.children.push(sprite);

        //Figure out the new size of the group
        this.calculateSize();
    }

    removeChild(sprite) {
        if (sprite.parent === this) {
            this.children.splice(this.children.indexOf(sprite), 1);

            //Figure out the new size of the group
            this.calculateSize();
        } else {
            throw new Error(`${sprite} is not a child of ${this}`);
        }
    }
    add(...sta) {
        sta.forEach(sprite => {
            this.addChild(sprite);
        });
    }
    remove(...sta) {
        sta.forEach(sprite => {
            this.removeChild(sprite);
        });
    }
    addArray(sta) {
        sta.forEach(sprite => {
            this.addChild(sprite);
        });
    }
    removeArray(...sta) {
        sta.forEach(sprite => {
            this.removeChild(sprite);
        });
    }

    calculateSize() {

        //Calculate the width based on the size of the largest child
        //that this sprite contains
        if (this.children.length > 0) {

            //Some temporary private variables to help track the new
            //calculated width and height
            this._newWidth = 0;
            this._newHeight = 0;

            //Find the width and height of the child sprites furthest
            //from the top left corner of the group
            this.children.forEach(child => {

                //Find child sprites that combined x value and width
                //that's greater than the current value of `_newWidth`
                if (child.x + child.width > this._newWidth) {

                    //The new width is a combination of the child's
                    //x position and its width
                    this._newWidth = child.x + child.width;
                }
                if (child.y + child.height > this._newHeight) {
                    this._newHeight = child.y + child.height;
                }
            });

            //Apply the `_newWidth` and `_newHeight` to this sprite's width
            //and height
            this.width = this._newWidth;
            this.height = this._newHeight;
        }
    }
}

class SpriteCanvasObject extends Pebble.DisplayObject {
    constructor(
        source,
        x = 0,
        y = 0
    ) {
        //Call the DisplayObject's constructor
        super();

        //Assign the argument values to this sprite 
        Object.assign(this, { x, y });

        //We need to figure out what the source is, and then use
        //use that source data to display the sprite image correctly
        //Is the source a JavaScript Image object?
        if (source instanceof Image) {
            this.createFromImage(source);
        }
        //Is the source a tileset from a texture atlas?
        //(It is if it has a `frame` property)
        else if (source.frame) {
            this.createFromAtlas(source);
        }
        //If the source contains an `image` sub-property, this must
        //be a `frame` object that's defining the rectangular area of an inner sub-image
        //Use that sub-image to make the sprite. If it doesn't contain a
        //`data` property, then it must be a single frame.
        else if (source.image && !source.data) {
            this.createFromTileset(source);
        }
        //If the source contains an `image` sub-property
        //and a `data` property, then it contains multiple frames
        else if (source.image && source.data) {
            this.createFromTilesetFrames(source);
        }
        //Is the source an array? If so, what kind of array?
        else if (source instanceof Array) {
            if (source[0] && source[0].source) {
                //The source is an array of frames on a texture atlas tileset
                this.createFromAtlasFrames(source);
            }
            //It must be an array of image objects
            else if (source[0] instanceof Image) {
                this.createFromImages(source);
            }
            //throw an error if the sources in the array aren't recognized
            else {
                throw new Error(`The image sources in ${source} are not recognized`);
            }
        }
        //Throw an error if the source is something we can't interpret
        else {
            throw new Error(`The image source ${source} is not recognized`);
        }
    }
    createFromImage(source) {
        //Throw an error if the source is not an Image object
        if (!(source instanceof Image)) {
            throw new Error(`${source} is not an image object`);
        } else {
            this.source = source;
            this.sourceX = 0;
            this.sourceY = 0;
            this.width = source.width;
            this.height = source.height;
            this.sourceWidth = source.width;
            this.sourceHeight = source.height;
        }
    }
    createFromAtlas(source) {
        this.tilesetFrame = source;
        this.source = this.tilesetFrame.source;
        this.sourceX = this.tilesetFrame.frame.x;
        this.sourceY = this.tilesetFrame.frame.y;
        this.width = this.tilesetFrame.frame.w;
        this.height = this.tilesetFrame.frame.h;
        this.sourceWidth = this.tilesetFrame.frame.w;
        this.sourceHeight = this.tilesetFrame.frame.h;
    }
    createFromTileset(source) {
        //Throw an error if the source is not an image object
        if (!(source.image instanceof Image)) {
            throw new Error(`${source.image} is not an image object`);
        } else {
            this.source = source.image;
            this.sourceX = source.x;
            this.sourceY = source.y;
            this.width = source.width;
            this.height = source.height;
            this.sourceWidth = source.width;
            this.sourceHeight = source.height;
        }
    }
    createFromTilesetFrames(source) {
        //Throw an error if the source is not an Image object
        if (!(source.image instanceof Image)) {
            throw new Error(`${source.image} is not an image object`);
        } else {
            this.source = source.image;
            this.frames = source.data;
            //Set the sprite to the first frame
            this.sourceX = this.frames[0][0];
            this.sourceY = this.frames[0][1];
            this.width = source.width;
            this.height = source.height;
            this.sourceWidth = source.width;
            this.sourceHeight = source.height;
        }
    }
    createFromAtlasFrames(source) {
        this.frames = source;
        this.source = source[0].source;
        this.sourceX = source[0].frame.x;
        this.sourceY = source[0].frame.y;
        this.width = source[0].frame.w;
        this.height = source[0].frame.h;
        this.sourceWidth = source[0].frame.w;
        this.sourceHeight = source[0].frame.h;
    }
    createFromImages(source) {
        this.frames = source;
        this.source = source[0];
        this.sourceX = 0;
        this.sourceY = 0;
        this.width = source[0].width;
        this.height = source[0].width;
        this.sourceWidth = source[0].width;
        this.sourceHeight = source[0].height;
    }

    //Add a `gotoAndStop` method to go to a specific frame.
    gotoAndStop(frameNumber) {
        if (this.frames.length > 0 && frameNumber < this.frames.length) {

            //a. Frames made from tileset sub-images. 
            //If each frame is an array, then the frames were made from an
            //ordinary Image object using the `frames` method
            if (this.frames[0] instanceof Array) {
                this.sourceX = this.frames[frameNumber][0];
                this.sourceY = this.frames[frameNumber][1];
            }

            //b. Frames made from texture atlas frames.
            //If each frame isn't an array, and it has a sub-object called `frame`,
            //then the frame must be a texture atlas id name.
            //In that case, get the source position from the atlas's `frame` object.
            else if (this.frames[frameNumber].frame) {
                this.sourceX = this.frames[frameNumber].frame.x;
                this.sourceY = this.frames[frameNumber].frame.y;
                this.sourceWidth = this.frames[frameNumber].frame.w;
                this.sourceHeight = this.frames[frameNumber].frame.h;
                this.width = this.frames[frameNumber].frame.w;
                this.height = this.frames[frameNumber].frame.h;
            }

            //c. Frames made from individual image objects.
            //If neither of the above are true, then each frame must be
            //an individual Image object
            else {
                this.source = this.frames[frameNumber];
                this.sourceX = 0;
                this.sourceY = 0;
                this.width = this.source.width;
                this.height = this.source.height;
                this.sourceWidth = this.source.width;
                this.sourceHeight = this.source.height;
            }
            //Set the `_currentFrame` value to the chosen frame
            this._currentFrame = frameNumber;
        }
        //Throw an error if this sprite doesn't contain any frames
        else {
            throw new Error(`Frame number ${frameNumber} does not exist`);
        }
    }

    //The `render` method explains how to draw the sprite
    render(ctx) {
        ctx.drawImage(
            this.source,
            this.sourceX, this.sourceY,
            this.sourceWidth, this.sourceHeight, -this.width * this.pivotX, -this.height * this.pivotY,
            this.width, this.height
        );
    }
}

class ButtonObject extends SpriteCanvasObject {
    constructor(source, x = 0, y = 0) {
        super(source, x, y);
        this.interactive = true;
    }
}





Pebble.addStatePlayer = function(sprite) {
    let frameCounter = 0,
        numberOfFrames = 0,
        startFrame = 0,
        endFrame = 0,
        timerInterval = undefined;
    //playing = false;

    //The `show` function (to display static states.)
    function show(frameNumber) {
        //Reset any possible previous animations
        reset();

        //Find the new state on the sprite.
        sprite.gotoAndStop(frameNumber);
    }

    //The `play` function plays all the sprites frames
    function play() {
        if (!sprite.playing) {
            playSequence([0, sprite.frames.length - 1]);
        }
    }

    //The `stop` function stops the animation at the current frame
    function stop() {
        if (sprite.playing) {
            reset();
            sprite.gotoAndStop(sprite.currentFrame);
        }
    }

    //The `playSequence` function, to play a sequence of frames.
    function playSequence(sequenceArray) {
        //Reset any possible previous animations
        reset();

        //Figure out how many frames there are in the range
        startFrame = sequenceArray[0];
        endFrame = sequenceArray[1];
        numberOfFrames = endFrame - startFrame;

        //Compensate for two edge cases:
        //1. If the `startFrame` happens to be `0`
        if (startFrame === 0) {
            numberOfFrames += 1;
            frameCounter += 1;
        }

        //2. If only a two-frame sequence was provided
        if (numberOfFrames === 1) {
            numberOfFrames = 2;
            frameCounter += 1;
        };

        //Calculate the frame rate. Set the default fps to 12
        if (!sprite.fps) sprite.fps = 12;
        let frameRate = 1000 / sprite.fps;

        //Set the sprite to the starting frame
        sprite.gotoAndStop(startFrame);

        //If the state isn't already playing, start it
        if (!sprite.playing) {
            timerInterval = setInterval(advanceFrame.bind(this), frameRate);
            sprite.playing = true;
        }
    }

    //`advanceFrame` is called by `setInterval` to display the next frame
    //in the sequence based on the `frameRate`. When frame sequence
    //reaches the end, it will either stop it or loop it
    function advanceFrame() {

        //Advance the frame if `frameCounter` is less than
        //the state's total frames
        if (frameCounter < numberOfFrames) {

            //Advance the frame
            sprite.gotoAndStop(sprite.currentFrame + 1);

            //Update the frame counter
            frameCounter += 1;

            //If we've reached the last frame and `loop`
            //is `true`, then start from the first frame again
        } else {
            if (sprite.loop) {
                sprite.gotoAndStop(startFrame);
                frameCounter = 1;
            }
        }
    }

    function reset() {

        //Reset `playing` to `false`, set the `frameCounter` to 0,
        //and clear the `timerInterval`
        if (timerInterval !== undefined && sprite.playing === true) {
            sprite.playing = false;
            frameCounter = 0;
            startFrame = 0;
            endFrame = 0;
            numberOfFrames = 0;
            clearInterval(timerInterval);
        }
    }

    //Add the `show`, `play`, `stop` and `playSequence` methods to the sprite.
    sprite.show = show;
    sprite.play = play;
    sprite.stop = stop;

    //sprite.playing = playing;
    sprite.playSequence = playSequence;
}

function makeInteractive(o) {

    //The `press`,`release`, `over`, `out` and `tap` methods. They're `undefined`
    //for now, but they can be defined in the game program
    o.press = o.press || undefined;
    o.release = o.release || undefined;
    o.over = o.over || undefined;
    o.out = o.out || undefined;
    o.tap = o.tap || undefined;

    //The `state` property tells you the button's
    //current state. Set its initial state to "up"
    o.state = "up";

    //The `action` property tells you whether its being pressed or
    //released
    o.action = "";

    //The `pressed` and `hoverOver` Booleans are mainly for internal
    //use in this code to help figure out the correct state.
    //`pressed` is a Boolean that helps track whether or not
    //the sprite has been pressed down
    o.pressed = false;

    //`hoverOver` is a Boolean which checks whether the pointer
    //has hovered over the sprite
    o.hoverOver = false;

    //The `update` method will be called each frame 
    //inside the game loop
    o.update = (pointer, canvas) => {

        //Figure out if the pointer is touching the sprite
        let hit = pointer.hitTestSprite(o);

        //1. Figure out the current state
        if (pointer.isUp) {

            //Up state
            o.state = "up";

            //Show the first image state frame, if this is a `Button` sprite
            if (o instanceof ButtonObject) o.gotoAndStop(0);
        }

        //If the pointer is touching the sprite, figure out
        //if the over or down state should be displayed
        if (hit) {

            //Over state
            o.state = "over";

            //Show the second image state frame if this sprite has
            //3 frames and it's a `Button` sprite
            if (o.frames && o.frames.length === 3 && o instanceof ButtonObject) {
                o.gotoAndStop(1);
            }

            //Down state
            if (pointer.isDown) {
                o.state = "down";

                //Show the third frame if this sprite is a `Button` sprite and it
                //has only three frames, or show the second frame if it
                //only has two frames
                if (o instanceof ButtonObject) {
                    if (o.frames.length === 3) {
                        o.gotoAndStop(2);
                    } else {
                        o.gotoAndStop(1);
                    }
                }
            }
        }

        //Perform the correct interactive action

        //a. Run the `press` method if the sprite state is "down" and
        //the sprite hasn't already been pressed
        if (o.state === "down") {
            if (!o.pressed) {
                if (o.press) o.press();
                o.pressed = true;
                o.action = "pressed";
            }
        }

        //b. Run the `release` method if the sprite state is "over" and
        //the sprite has been pressed
        if (o.state === "over") {
            if (o.pressed) {
                if (o.release) o.release();
                o.pressed = false;
                o.action = "released";
                //If the pointer was tapped and the user assigned a `tap`
                //method, call the `tap` method
                if (pointer.tapped && o.tap) o.tap();
            }

            //Run the `over` method if it has been assigned
            if (!o.hoverOver) {
                if (o.over) o.over();
                o.hoverOver = true;
            }
        }

        //c. Check whether the pointer has been released outside
        //the sprite's area. If the button state is "up" and it's
        //already been pressed, then run the `release` method.
        if (o.state === "up") {
            if (o.pressed) {
                if (o.release) o.release();
                o.pressed = false;
                o.action = "released";
            }

            //Run the `out` method if it has been assigned
            if (o.hoverOver) {
                if (o.out) o.out();
                o.hoverOver = false;
            }
        }
    };
}

Pebble.VoxelGrid = class {
    constructor() {

    }
}