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
},
    { timestamps: true }
);


module.exports = model('UserProfile', userProfileSchema);
