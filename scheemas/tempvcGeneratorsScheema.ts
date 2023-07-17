import { string } from "mathjs";
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
    vc_user_limit: {
        type: Number
    },
    region: {
        type: String
    },
    allow_rename: {
        type: Boolean
    },
    custom_vc_name: {
        type: String
    }
});

export default model('TempVCGenerator', tempvcGeneratorSchema);