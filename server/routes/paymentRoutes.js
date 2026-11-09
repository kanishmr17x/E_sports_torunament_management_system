const express = require("express");
const router = express.Router();

const {
    initiatePayment,
    processPayment,
    handlePaymentCallback,
    getPaymentById,
    getUserPayments,
    getAllPayments,
    getPaymentStats,
    refundPayment
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");
const { staffOnly } = require("../middleware/adminMiddleware");

router.post("/initiate", protect, initiatePayment);
router.post("/:paymentId/process", protect, processPayment);
router.post("/callback", handlePaymentCallback);
router.get("/my-payments", protect, getUserPayments);
router.get("/", protect, staffOnly, getAllPayments);
router.get("/stats", protect, staffOnly, getPaymentStats);
router.get("/:id", protect, getPaymentById);
router.post("/:id/refund", protect, staffOnly, refundPayment);

module.exports = router;