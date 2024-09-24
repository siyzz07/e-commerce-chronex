const multer = require('multer');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/product_images'); // Update with the actual path
  },
  filename: (req, file, cb) => {
    
    cb(null,file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
});

// Use multerStorage instead of storage
const upload = multer({ storage: multerStorage });

module.exports = upload;
