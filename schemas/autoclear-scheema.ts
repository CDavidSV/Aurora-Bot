import mongoose from "mongoose";

const autoclearSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    channels: {
        type: Array,
        required: true,
    }
});

module.exports = mongoose.model('autoclear-model', autoclearSchema);