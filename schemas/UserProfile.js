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
    lastDailyCollected: {
        type: Date,
    },
    lastPresenceCollected: {
        type: Date,
    },
    k_coins: {
        type: Number,
        default: 0,
    },
},
    { timestamps: true }
);


module.exports = model('UserProfile', userProfileSchema);
