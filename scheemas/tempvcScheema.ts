import { Schema, model } from "mongoose";

const tempvcSchema = new Schema({
    guild_id: {
        type: String,
        required: true,
    },
    generator_id: {
        type: String,
        required: true
    },
    vc_id: {
        type: String,
        required: true
    },
    owner_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
});

export default model('TempVC', tempvcSchema);