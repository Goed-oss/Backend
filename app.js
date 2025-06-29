const imageUpload = document.getElementById('imageUpload');
const healBtn = document.getElementById('healBtn');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const healedImage = document.getElementById('healedImage');

let originalImage = null;
let isDrawing = false;
let startX, startY, endX, endY;

// Handle image upload
imageUpload.addEventListener('change', function(e) {
  if (e.target.files && e.target.files[0]) {
    const reader = new FileReader();
    reader.onload = function(event) {
      originalImage = new Image();
      originalImage.onload = function() {
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);
        healBtn.disabled = false;
      };
      originalImage.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
  }
});

// Drawing on canvas to select area
canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  startX = e.offsetX;
  startY = e.offsetY;
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  endX = e.offsetX;
  endY = e.offsetY;
  redrawCanvas();
  drawSelection();
});

canvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(originalImage, 0, 0);
}

function drawSelection() {
  if (isDrawing) {
    ctx.beginPath();
    ctx.rect(startX, startY, endX - startX, endY - startY);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// Handle healing
healBtn.addEventListener('click', async () => {
  if (!originalImage || !isValidSelection()) {
    alert('Please select an area to heal.');
    return;
  }

  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);
  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);

  // Create FormData to send the image and selection data
  const formData = new FormData();
  formData.append('image', imageUpload.files[0]);
  formData.append('x', x);
  formData.append('y', y);
  formData.append('width', width);
  formData.append('height', height);

  try {
    const response = await fetch('http://localhost:5000/api/heal', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to heal image');
    }

    const data = await response.json();
    healedImage.src = data.healedImage;

  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while processing the image.');
  }
});

function isValidSelection() {
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);
  return width > 5 && height > 5; // Minimum size to prevent very small selections
}