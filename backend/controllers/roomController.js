const Room = require("../models/Room");
const Tenant = require("../models/Tenant");

const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    const data = rooms.map((room) => ({
      ...room.toObject(),
      status: room.currentOccupancy < room.capacity ? "Available" : "Occupied",
      availableBeds: Math.max(room.capacity - room.currentOccupancy, 0),
    }));
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, capacity, currentOccupancy = 0 } = req.body;
    if (!roomNumber || !capacity) {
      return res.status(400).json({ message: "Room number and capacity are required." });
    }

    if (Number(currentOccupancy) > Number(capacity)) {
      return res.status(400).json({ message: "Current occupancy cannot exceed room capacity." });
    }

    const room = await Room.create({
      roomNumber: String(roomNumber).trim(),
      capacity: Number(capacity),
      currentOccupancy: Number(currentOccupancy),
    });

    return res.status(201).json({
      message: "Room added successfully.",
      data: room,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Room number already exists." });
    }
    return next(error);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roomNumber, capacity, currentOccupancy, tenantId } = req.body;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    const previousRoomNumber = room.roomNumber;

    if (roomNumber) {
      room.roomNumber = String(roomNumber).trim();
    }

    if (typeof capacity !== "undefined") {
      const newCapacity = Number(capacity);
      if (Number.isNaN(newCapacity) || newCapacity < room.currentOccupancy) {
        return res.status(400).json({
          message: "Capacity cannot be less than current occupancy.",
        });
      }
      room.capacity = newCapacity;
    }

    if (typeof currentOccupancy !== "undefined") {
      const assignedTenants = await Tenant.countDocuments({ room: room._id });
      const nextOccupancy = Number(currentOccupancy);
      if (
        Number.isNaN(nextOccupancy) ||
        nextOccupancy < assignedTenants ||
        nextOccupancy > room.capacity
      ) {
        return res.status(400).json({
          message: "Invalid occupancy. Must be between assigned tenants and room capacity.",
        });
      }
      room.currentOccupancy = nextOccupancy;
    }

    if (tenantId) {
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found for assignment." });
      }

      if (String(tenant.room) !== String(room._id)) {
        if (room.currentOccupancy >= room.capacity) {
          return res.status(400).json({ message: "Room is full. Cannot assign tenant." });
        }

        const oldRoom = await Room.findById(tenant.room);
        if (oldRoom && oldRoom.currentOccupancy > 0) {
          oldRoom.currentOccupancy -= 1;
          await oldRoom.save();
        }

        room.currentOccupancy += 1;
        tenant.room = room._id;
        tenant.roomNumber = room.roomNumber;

        await tenant.save();
      }
    }

    await room.save();

    if (room.roomNumber !== previousRoomNumber) {
      await Tenant.updateMany({ room: room._id }, { $set: { roomNumber: room.roomNumber } });
    }

    return res.status(200).json({
      message: "Room updated successfully.",
      data: room,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Room number already exists." });
    }
    return next(error);
  }
};

module.exports = {
  getRooms,
  createRoom,
  updateRoom,
};
