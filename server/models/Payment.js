const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament",
        required: true
    },
    registrationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registration",
        default: null
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "USD"
    },
    status: {
        type: String,
        enum: ["pending", "processing", "paid", "failed", "cancelled", "refunded"],
        default: "pending"
    },
    paymentMethod: {
        type: String,
        enum: ["stripe", "razorpay", "paypal", "manual", "test"],
        default: "test"
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    gatewayResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    description: {
        type: String,
        default: ""
    },
    paidAt: {
        type: Date,
        default: null
    },
    refundedAt: {
        type: Date,
        default: null
    },
    refundReason: {
        type: String,
        default: ""
    }
}, { timestamps: true });

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ tournamentId: 1, status: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model("Payment", paymentSchema);