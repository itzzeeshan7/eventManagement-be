const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    name: String,
    location: String,
    date: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["Pending", "Approved"], default: "Pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
