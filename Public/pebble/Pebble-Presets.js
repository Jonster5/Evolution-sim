if (typeof Pebble.DisplayObject === 'undefined' || Pebble.DisplayObject === null) {
    throw new Error('You must execute Pebble-2d.js before you can use this');
}

Pebble.World = class {
    constructor(stage) {
        this.scenes = [];
        this.currentScene = 0;
        this.stage = stage;

        class CustomGrouper extends Pebble.DisplayObject {
            constructor(width, height) {
                super();
                this.width = width;
                this.height = height;
            }

            addChild(sprite) {
                if (sprite.parent) {
                    sprite.parent.removeChild(sprite);
                }
                sprite.parent = this;
                this.children.push(sprite);
            }

            removeChild(sprite) {
                if (sprite.parent === this) {
                    this.children.splice(this.children.indexOf(sprite), 1);

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
        }

        this.cGroup = CustomGrouper;
    }

    addNewScene(setup = function(world, scene, group) {}, onUpdate = function(world, scene, group) {}) {
        let obj = {
            group: new this.cGroup(this.stage.width, this.stage.height),

            prepare: () => setup(this, obj.objects, obj.group),
            update: () => onUpdate(this, obj.objects, obj.group),

            objects: {},
        };
        if (!obj.group.parent) this.stage.add(obj.group);

        this.scenes.push(obj);
        obj.group.visible = this.scenes.indexOf(obj) === 0 ? true : false;
        if (obj.group.visible) {
            obj.prepare();
        }
    }
    nextScene() {
        if (this.currentScene < this.scenes.length - 1) {
            this.scenes[this.currentScene].group.visible = false;

            this.currentScene++;

            let scene = this.scenes[this.currentScene].group.visible = true;
            this.scenes[this.currentScene].prepare();
        } else {
            this.scenes[this.currentScene].group.visible = false;

            this.currentScene = 0;

            this.scenes[this.currentScene].prepare();
            this.scenes[this.currentScene].group.visible = true;
        }
    }
    gotoScene(index) {
        if (Number.isInteger(index) && index >= 0 && index < this.scenes.length) {
            this.Scene.group.visible = false;
            this.currentScene = index;
            this.scenes[this.currentScene].prepare();
            this.scenes[this.currentScene].group.visible = true;
        }
    }
    get Scene() {
        return this.scenes[this.currentScene];
    }
}

Pebble.shoot = function shoot(
    shooter, angle, offsetFromCenter,
    bulletSpeed, bulletArray, bulletSprite
) {

    let bullet = bulletSprite();

    bullet.x = shooter.centerX - bullet.halfWidth +
        (offsetFromCenter * Math.cos(angle));
    bullet.y = shooter.centerY - bullet.halfHeight +
        (offsetFromCenter * Math.sin(angle));

    bullet.vx = Math.cos(angle) * bulletSpeed;
    bullet.vy = Math.sin(angle) * bulletSpeed;

    bulletArray.push(bullet);
}