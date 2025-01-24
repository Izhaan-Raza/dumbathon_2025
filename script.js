class DrawingApp {
  constructor() {
    this.canvas = document.getElementById('drawingCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.undoStack = [];
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;

    this.initializeCanvas();
    this.setupEventListeners();
  }

  initializeCanvas() {
    this.canvas.width = 500;
    this.canvas.height = 400;
    
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.saveState();
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    this.canvas.addEventListener('mousemove', this.draw.bind(this));
    this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startDrawing(e.touches[0]);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.draw(e.touches[0]);
    });
    this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));

    document.getElementById('penColor').addEventListener('change', (e) => {
      this.ctx.strokeStyle = e.target.value;
    });

    document.getElementById('undoBtn').addEventListener('click', this.undo.bind(this));
    document.getElementById('clearBtn').addEventListener('click', this.clear.bind(this));
    document.getElementById('generateBtn').addEventListener('click', this.generate.bind(this));
    document.getElementById('downloadBtn').addEventListener('click', this.downloadImage.bind(this));
  }

  startDrawing(e) {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    [this.lastX, this.lastY] = [
      e.clientX - rect.left,
      e.clientY - rect.top
    ];
  }

  draw(e) {
    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    [this.lastX, this.lastY] = [x, y];
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.saveState();
    }
  }

  saveState() {
    this.undoStack.push(this.canvas.toDataURL());
  }

  undo() {
    if (this.undoStack.length > 1) {
      this.undoStack.pop();
      const previousState = this.undoStack[this.undoStack.length - 1];
      const img = new Image();
      img.src = previousState;
      img.onload = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(img, 0, 0);
      };
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.undoStack = [];
    this.saveState();
  }

  generateDescription(imageData) {
    // This is a simple function to generate random descriptions
    // In a real application, you might want to use an AI model to generate these
    const subjects = ['A whimsical interpretation', 'An artistic rendering', 'A creative transformation', 'A magical version'];
    const styles = ['in a vibrant watercolor style', 'with a modern digital art twist', 'in a dreamy, ethereal style', 'with bold, expressive strokes'];
    const emotions = ['bringing joy and wonder', 'evoking a sense of mystery', 'creating a playful atmosphere', 'inspiring imagination'];

    return {
      line1: `${subjects[Math.floor(Math.random() * subjects.length)]} of your sketch ${styles[Math.floor(Math.random() * styles.length)]}.`,
      line2: `This unique piece ${emotions[Math.floor(Math.random() * emotions.length)]}.`
    };
  }

  async generate() {
    const generateBtn = document.getElementById('generateBtn');
    const placeholder = document.getElementById('placeholder');
    const loader = document.getElementById('loader');
    const resultImage = document.getElementById('resultImage');
    const downloadBtn = document.getElementById('downloadBtn');
    const imageDescription = document.getElementById('imageDescription');
    const descriptionLine1 = imageDescription.querySelector('.description-line1');
    const descriptionLine2 = imageDescription.querySelector('.description-line2');

    generateBtn.disabled = true;
    placeholder.classList.add('hidden');
    resultImage.classList.add('hidden');
    downloadBtn.classList.add('hidden');
    imageDescription.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
      const imageData = this.canvas.toDataURL('image/png').split(',')[1];
      
      const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: imageData,
          parameters: {
            negative_prompt: "blurry, bad quality, distorted",
            num_inference_steps: 30,
            guidance_scale: 7.5
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const blob = await response.blob();
      const generatedImageUrl = URL.createObjectURL(blob);
      
      resultImage.src = generatedImageUrl;
      resultImage.classList.remove('hidden');
      downloadBtn.classList.remove('hidden');

      // Generate and display description
      const description = this.generateDescription(imageData);
      descriptionLine1.textContent = description.line1;
      descriptionLine2.textContent = description.line2;
      imageDescription.classList.remove('hidden');
    } catch (error) {
      console.error('Failed to generate image:', error);
      placeholder.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        <p>Failed to generate image. Please try again.</p>
      `;
      placeholder.classList.remove('hidden');
    } finally {
      generateBtn.disabled = false;
      loader.classList.add('hidden');
    }
  }

  downloadImage() {
    const resultImage = document.getElementById('resultImage');
    const link = document.createElement('a');
    link.download = 'ai-generated-image.png';
    link.href = resultImage.src;
    link.click();
  }
}

window.addEventListener('load', () => {
  new DrawingApp();
});