const express = require("express");
const { createEvent,
    getEvents,
    getEventById,
    deleteEvent,
    updateEvent,
    joinEvent,
    approveEvent,
    leaveEvent } = require("../controllers/eventController");
const {protect ,isAdmin} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, createEvent);
router.get("/:pageNumber", getEvents);
router.get("/getEvent/:id", getEventById);
router.delete("/delete/:id", protect, deleteEvent);
router.put("/update/:id", protect, updateEvent);
router.post("/:id/join", protect, joinEvent);
router.post("/:id/leave", protect, leaveEvent);
router.patch("/approve/:id", protect, isAdmin, approveEvent);




module.exports = router;
