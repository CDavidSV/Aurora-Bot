import { Schema, model } from "mongoose";

const rpImagesScheema = new Schema({
    rp_type: {
        require: true,
        type: String,
        index: true
    },
    content_reference: {
        require: false,
        default: null,
        type: String
    },
    message: {
        require: false,
        default: null,
        type: String
    },
    img_url: {
        require: true,
        type: String
    }
});

export default model('RPImages', rpImagesScheema);