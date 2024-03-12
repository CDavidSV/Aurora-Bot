import { Schema, model } from "mongoose";

const userSchema = new Schema({
    _id: String,
    birthday: { type: Date, default: null },
    about: { type: String, default: null },
    bot_member_since: { type: Date, default: new Date() },
    occupation: { type: String, default: null },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    credits: { type: Number, default: 0 },
    married_to_id: { type: String, default: null }
});

export default model('User', userSchema);