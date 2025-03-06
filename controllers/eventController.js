const Event = require("../models/Event");
const User = require("../models/User");
const { sendApprovalEmail } = require("../middleware/emailService");
exports.createEvent = async (req, res) => {
  try {
    const { name, location, date, participants } = req.body;

    const event = await Event.create({
      name,
      location,
      date,
      createdBy: req.user.id,
      participants,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event' });
  }
};


exports.getEvents = async (req, res) => {
  try {
    const pageNumber = parseInt(req.params.pageNumber) || 1; 
    const pageSize = 5; 
    const skip = (pageNumber - 1) * pageSize; 

    const events = await Event.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "creatorInfo"
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          location: 1,
          date: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          participants: 1,
          createdBy: 1,
          ownerName: "$creatorInfo.name" ,
        }
      },
      { $skip: skip },
      { $limit: pageSize }
    ]);

    const totalEvents = await Event.countDocuments();

    res.json({
      events,
      totalPages: Math.ceil(totalEvents / pageSize), 
      currentPage: pageNumber,
      totalEvents,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching events" });
  }
};



exports.getEventById = async (req, res) => {
  try {
    console.log("Fetching event with ID:", req.params.id);
    const event = await Event.findById(req.params.id);
    console.log("Fetched event:", event);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Error fetching event details" });
  }
};

exports.deleteEvent = async (req, res) => {
  console.log("Request User ID:", req.user.id);
  console.log("Request User Role:", req.user.role);
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    console.log("Event Created By:", event.createdBy);

    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized to delete this event" });
    }
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting event" });
  }
};


exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    console.log(req.user.role, 'this is sender role ')

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update this event" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: "Error updating event" });
  }
};
exports.joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.participants.includes(req.user.id)) {
      return res.status(400).json({ message: "You have already joined this event" });
    }

    event.participants.push(req.user.id);
    await event.save();

    res.json({ message: "Successfully joined the event", event });
  } catch (error) {
    res.status(500).json({ message: "Error joining event" });
  }


};
exports.leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (!event.participants.includes(req.user.id)) {
      return res.status(400).json({ message: "You are not a participant of this event" });
    }

    event.participants = event.participants.filter((participantId) => participantId.toString() !== req.user.id
    );

    await event.save();

    res.json({ message: "Successfully left the event", event });
  } catch (error) {
    res.status(500).json({ message: "Error leaving event" });
  }
};


exports.approveEvent = async (req, res) => {
  try {
      const  eventId  = req.params.id;
      console.log(eventId,'this is an event id');
      const event = await Event.findById(eventId);
      if (!event) {
          return res.status(404).json({ message: "Event not found" });
      }
      event.status = "Approved";
      await event.save();

      const creator = await User.findById(event.createdBy);
      if (!creator) {
          return res.status(404).json({ message: "Event creator not found" });
      }

      await sendApprovalEmail(creator.email, event);
      res.status(200).json({ message: "Event approved and email sent" });
  } catch (error) {
      console.error("Error approving event", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

