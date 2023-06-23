import { Schema, model } from "mongoose";

const tempvcGeneratorSchema = new Schema({
    category_id: {
        type: String,
        required: true,
    },
    guild_id: {
        type: String,
        required: true,
    },
    generator_id: {
        type: String,
        required: true
    },
    vc_user_limit: Number,
    region: String,
    allow_rename: Boolean,
    custom_vc_name: String
});

export default model('TempVCGenerator', tempvcGeneratorSchema);