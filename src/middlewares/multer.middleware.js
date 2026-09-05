import multer from "multer";

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, '/public/temp');
    },

    filename(req, file, cb) {
        const ext = file.mimetype.split("/")[1];
        cb(null, file.originalname + '-' + Date.now() + ext);
    },
});

export const upload = multer({ storage });
