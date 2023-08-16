const { Schema, model } = require('mongoose');

const userProfileSchema = new Schema({
    userid: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    xp: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 1,
    },
    lastDailyCollected: {
        type: Date,
    },
    lastPresenceCollected: {
        type: Date,
    },
},
    { timestamps: true }
);


module.exports = model('UserProfile', userProfileSchema);
