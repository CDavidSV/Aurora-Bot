import { model, Schema } from "mongoose";

const userWarningsSchema = new Schema({
    user_id: { type: String, required: true },
    guild_id: { type: String, required: true },
    created_at: { type: Date, default: new Date() },
    reason: { type: String, required: false, default: "" },
    moderator_id: { type: String, required: true }
});

userWarningsSchema.index({ user_id: 1, guild_id: 1 });
userWarningsSchema.index({ created_at: 1 });
export default model("UserWarnings", userWarningsSchema);