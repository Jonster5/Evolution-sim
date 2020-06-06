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
Pebble.Webcam = function(domElement = document.body, width = 100, height = 100, style = "margin: 0px auto;border: 1px dashed black;width: 200px;height: 200px;background: # 666;") {
    let video = document.createElement("video");
    video.setAttribute("style", style);
    video.autoplay = true;
    video.width = width;
    video.height = height;

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => video.srcObject = stream)
            .catch(error => console.log(error));
    }

    let obj = {
        domElement: video,
    };
    obj.stop = function() {
        let stream = this.domElement.srcObject;
        let tracks = stream.getTracks();

        for (var i = 0; i < tracks.length; i++) {
            var track = tracks[i];
            track.stop();
        }
        this.domElement.srcObject = null;
    };
    obj.start = function() {
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => this.domElement.srcObject = stream)
                .catch(error => console.log(error));
        }
    };
    obj.captureFrame = function(download = "", mime_type = "image/png") {
        if (Pebble.DisplayObject === undefined || typeof(Pebble.DisplayObject) === "undefined") {
            throw new Error('Pebble2d is required for this action');
        } else {
            let canvas = new Pebble.Canvas(document.body, this.domElement.width, this.domElement.height, "none", "rgba(0,0,0,0)");
            canvas.domElement.style.display = "none";
            canvas.domElement.style.position = "absolute";
            canvas.ctx.drawImage(this.domElement, 0, 0, this.domElement.width, this.domElement.height);


            if (download) {
                if (mime_type === "image/png") canvas.exportAsPNG(download);
                if (mime_type === "image/jpeg") canvas.exportAsJPG(download);
                else canvas.exportAsPNG(download);
                document.body.removeChild(canvas.domElement);
                return;
            } else {
                let data = canvas.domElement.toDataURL(mime_type);
                document.body.removeChild(canvas.domElement);
                return data;
            }

        }
    }

    domElement.appendChild(obj.domElement);
    return obj;
}