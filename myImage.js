class MyImage {
    constructor(centerImg = null, width = 1920, height = 1080) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");

        this.drawRandomBackground();
        if (centerImg) {
            this.drawCenterImage(centerImg);
        }

        this.#addEventListeners();
    }

    drawCenterImage(centerImg) {
        const width = this.canvas.width / 3;
        const height = this.canvas.height / 3;
        const x = width;
        const y = height;
        this.ctx.drawImage(centerImg.canvas, x, y, width, height);
    }

    drawRandomBackground() {
        const { width, height } = this.canvas;
        const hue = Math.random() * 360;
        this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        this.ctx.fillRect(0, 0, width, height);
    }

    #addEventListeners() {
        this.canvas.addEventListener("dragover", (e) => e.preventDefault());

        this.canvas.addEventListener("drop", (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) {
                this.loadAndDrawImage(file);
            }
        });
    }
    // saving images to localstorage was with the help of AI specifically Chatgpt and DEEPSEEK
    loadAndDrawImage(file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                setTimeout(saveImagesToLocalStorage, 500); 
            };
        };
    }

    getBase64() {
        return this.canvas.toDataURL("image/jpeg"); 
    }
    loadBase64(dataURL) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = dataURL;
            img.onload = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                resolve();
            };
        });
    }

    draw(ctx, left, top, width, height) {
        ctx.drawImage(this.canvas, left, top, width, height);
    }

    addTo(parent) {
        parent.appendChild(this.canvas);
    }

    addClass(className) {
        this.canvas.classList.add(className);
    }
}
async function loadImagesFromLocalStorage() {
    const savedImages = JSON.parse(localStorage.getItem("savedImages")) || [];
    
    if (savedImages.length === 0) return; 

    const loadPromises = savedImages.map(async (dataURL) => {
        const img = new MyImage();
        await img.loadBase64(dataURL);
        myImages.push(img); 
    });

    await Promise.all(loadPromises);
    renderImageList();
}

function saveImagesToLocalStorage() {
    const imageData = myImages.map(img => img.getBase64());
    localStorage.setItem('savedImages', JSON.stringify(imageData));
}


function loadImages(files) {
    let newImages = [];
    files.forEach((file) => {
        const img = new MyImage();
        img.loadAndDrawImage(file);
        newImages.push(img);
    });

    myImages = [...myImages, ...newImages]; 
    offset = 0; 
    renderImageList();
    setTimeout(saveImagesToLocalStorage, 1000); 
}


function renderImageList() {
    const thumbs = document.querySelectorAll(".image-thumb");
    thumbs.forEach((thumb) => thumb.remove());

    myImages.forEach((img) => {
        img.addTo(document.body);
        img.addClass("image-thumb");
    });
}
function initializeImages(num) {
    const imgs = [];
    for (let i = 0; i < num; i++) {
        imgs.push(new MyImage(null, 1920, 1080));
    }
    return imgs;
}
window.addEventListener("load", loadImagesFromLocalStorage);
