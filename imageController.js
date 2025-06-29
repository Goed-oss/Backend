const multer = require('multer');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

// Configure Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../frontend/assets/uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Process the healing request
exports.healImage = [
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      const { x, y, width, height } = req.body;
      if (!x || !y || !width || !height) {
        return res.status(400).json({ error: 'Missing coordinates or dimensions' });
      }

      const imagePath = req.file.path;
      const outputPath = path.join(__dirname, '../../frontend/assets/processed/', req.file.filename);

      // Read image with Jimp
      const image = await Jimp.read(imagePath);

      // Simple healing: replace the selected area with the surrounding pixels (inpainting)
      // Note: This is a very naive approach. For a real app, use a proper inpainting algorithm or AI.
      // Here we are just blurring the area. A better approach would be to use a clone tool or advanced inpainting.

      // Get the region to heal
      const region = image.clone().crop(parseInt(x), parseInt(y), parseInt(width), parseInt(height));

      // Blur the region (simulate healing)
      region.blur(10);

      // Composite the blurred region back
      image.composite(region, parseInt(x), parseInt(y));

      // Save the processed image
      await image.writeAsync(outputPath);

      // Send the processed image URL back
      res.json({ 
        originalImage: `/assets/uploads/${req.file.filename}`,
        healedImage: `/assets/processed/${req.file.filename}` 
      });

    } catch (error) {
      console.error('Error processing image:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];