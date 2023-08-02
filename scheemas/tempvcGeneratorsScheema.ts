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
tempvcGeneratorSchema.index({ guild_id: 1, category_id: 1 });
export default model('TempVCGenerator', tempvcGeneratorSchema);