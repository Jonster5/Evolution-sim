Pebble.Storage = class {
    constructor() {
        this.databases = [];
        this.openDatabases = [];

        if (window.localStorage.length > 0) {
            for (let i = 0; i < window.localStorage.length; i++) {
                let key = window.localStorage.key(i);
                let foo = window.localStorage.getItem(key);
                if (foo.slice(0, 4) == "{id:") {
                    foo = JSON.parse(foo);
                    if (typeof(foo.id) === "string") this.databases.push(foo);
                }
            }
        }
    }
    createDB(name = "") {
        let good = true;
        if (this.databases.length > 0) {
            this.databases.forEach(db => {
                if (db.id === name) {
                    good = false;
                }
            });
        }
        if (good === true) {
            let db = {
                id: name,
                db: {
                    storage: []
                }
            };
            this.databases.push(db);
            window.localStorage.setItem(name, JSON.stringify(db));
            return true;
        } else {
            return false;
        }
    }
    removeDB(name = "") {
        let db = this.databases.find(x => x.id === name);
        if (db.id) {
            let index = this.databases.indexOf(db);
            window.localStorage.removeItem(db.id);
            this.databases.splice(index, 1);
            return true;
        } else {
            return false;
        }
    }
    open(database = "", callback = undefined) {
        try {
            let db = JSON.parse(window.localStorage.getItem(database));
            this.openDatabases.push(db);
            let index = this.openDatabases.indexOf(db);
            Object.assign(this.openDatabases[index].db, {
                createNode(name = "", val) {

                    if (this.storage.length > 0) {
                        this.storage.forEach(node => {
                            if (name === node.name) throw new Error("This name has already been taken");
                        });
                    }
                    let node = {
                        name: name,
                        value: val,
                        type: typeof(val)
                    };

                    this.storage.push(node);
                    return true;
                },
                removeNode(name) {
                    let node = this.storage.find(x => x.name === name);
                    let index = this.storage.indexOf(node);
                    this.storage.splice(index, 1);
                    return true;
                },
                updateNode(name = "", val) {
                    if (this.storage.length > 0) {
                        try {
                            this.storage.forEach(node => {
                                if (node.name === name && node.type === typeof(val)) {
                                    node.value = val;
                                } else if (node.name === undefined) {
                                    throw new Error();
                                }
                            });
                        } catch (error) {
                            throw new Error(`Node ${name} either doesn't exist, or the value you tried to update is not of the same type`);
                        }
                    }
                },
                getNode(name = "") {
                    console.log(this.storage);
                    for (let node of this.storage) {
                        if (node.name === name) return node.value;
                    }
                    return false;
                },
                removeAll() {

                },
                getAll() {}
            });
            if (callback) {
                callback(this.openDatabases[index].db);
            }
            return true;
        } catch (err) {
            this.openDatabases.pop();
            return false;
        }
    }
    checkDB(name = "") {
        if (this.open(name)) {
            this.close(name);
            return true;
        } else {
            return false;
        }

    }
    close(database = "") {
        let db = this.openDatabases.find(x => x.id === database);
        window.localStorage.setItem(db.id, JSON.stringify(db));
        let index = this.openDatabases.indexOf(db);
        this.openDatabases.splice(index, 1);

        this.databases = [];
        if (window.localStorage.length > 0) {
            for (let i = 0; i < window.localStorage.length; i++) {
                let key = window.localStorage.key(i);
                let foo = window.localStorage.getItem(key);
                foo = JSON.parse(foo);
                if (typeof(foo.id) === "string") this.databases.push(foo);
            }
        }
        return true;
    }
    removeAll() {
        this.databases.forEach(db => this.removeDB(db.id));
        return true;
    }
    closeAll() {
        this.openDatabases.forEach(db => this.close(db.id));
        return true;
    }
}