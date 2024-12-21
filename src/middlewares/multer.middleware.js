import multer from "multer";

// this code is available in the multer github repo and alo in npm of multer make some changes according to you
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ 
    storage,
});

