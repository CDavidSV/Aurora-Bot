import { Schema, model } from "mongoose";

const userSchema = new Schema({
    _id: String,
    birthday: { 
        day: { type: Number, default: null },
        month: { type: Number, default: null },
        year: { type: Number, default: null }
    },
    bot_member_since: { type: Date, default: new Date() },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    credits: { type: Number, default: 0 },
    married_to_id: { type: String, default: null }
});

export default model('User', userSchema);