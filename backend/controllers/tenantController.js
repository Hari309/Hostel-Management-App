const Payment = require("../models/Payment");
const Room = require("../models/Room");
const Tenant = require("../models/Tenant");

const parsePagination = (query) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const findRoomFromBody = async (body) => {
  if (body.roomId) {
    return Room.findById(body.roomId);
  }
  if (body.roomNumber) {
    return Room.findOne({ roomNumber: body.roomNumber.trim() });
  }
  return null;
};

const getTenants = async (req, res, next) => {
  try {
    const { search = "", unpaidMonth } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const searchRegex = new RegExp(search, "i");

    const baseQuery = search
      ? {
          $or: [{ name: searchRegex }, { phone: searchRegex }, { idProof: searchRegex }, { roomNumber: searchRegex }],
        }
      : {};

    if (unpaidMonth) {
      const paidTenantIds = await Payment.find({ month: unpaidMonth, status: "Paid" }).distinct("tenant");
      baseQuery._id = { $nin: paidTenantIds };
    }

    const [tenants, total] = await Promise.all([
      Tenant.find(baseQuery)
        .populate("room", "roomNumber capacity currentOccupancy")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Tenant.countDocuments(baseQuery),
    ]);

    return res.status(200).json({
      data: tenants,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const createTenant = async (req, res, next) => {
  try {
    const { name, phone, idProof, joiningDate } = req.body;
    if (!name || !phone || !idProof) {
      return res.status(400).json({ message: "Name, phone and ID proof are required." });
    }

    const room = await findRoomFromBody(req.body);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    if (room.currentOccupancy >= room.capacity) {
      return res.status(400).json({ message: "Room is already full." });
    }

    const tenant = await Tenant.create({
      name,
      phone,
      idProof,
      room: room._id,
      roomNumber: room.roomNumber,
      joiningDate: joiningDate || Date.now(),
    });

    room.currentOccupancy += 1;
    await room.save();

    const populatedTenant = await Tenant.findById(tenant._id).populate(
      "room",
      "roomNumber capacity currentOccupancy"
    );

    return res.status(201).json({
      message: "Tenant added successfully.",
      data: populatedTenant,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate tenant data detected." });
    }
    return next(error);
  }
};

const updateTenant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, idProof, joiningDate } = req.body;

    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found." });
    }

    let room = null;
    if (req.body.roomId || req.body.roomNumber) {
      room = await findRoomFromBody(req.body);
      if (!room) {
        return res.status(404).json({ message: "Room not found." });
      }
    }

    if (room && String(room._id) !== String(tenant.room)) {
      if (room.currentOccupancy >= room.capacity) {
        return res.status(400).json({ message: "Selected room is full." });
      }

      const oldRoom = await Room.findById(tenant.room);
      if (oldRoom && oldRoom.currentOccupancy > 0) {
        oldRoom.currentOccupancy -= 1;
        await oldRoom.save();
      }

      room.currentOccupancy += 1;
      await room.save();

      tenant.room = room._id;
      tenant.roomNumber = room.roomNumber;
    }

    tenant.name = name ?? tenant.name;
    tenant.phone = phone ?? tenant.phone;
    tenant.idProof = idProof ?? tenant.idProof;
    tenant.joiningDate = joiningDate ?? tenant.joiningDate;

    await tenant.save();

    const populatedTenant = await Tenant.findById(tenant._id).populate(
      "room",
      "roomNumber capacity currentOccupancy"
    );

    return res.status(200).json({
      message: "Tenant updated successfully.",
      data: populatedTenant,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteTenant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found." });
    }

    const room = await Room.findById(tenant.room);
    if (room && room.currentOccupancy > 0) {
      room.currentOccupancy -= 1;
      await room.save();
    }

    await tenant.deleteOne();
    await Payment.deleteMany({ tenant: id });

    return res.status(200).json({ message: "Tenant deleted successfully." });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTenants,
  createTenant,
  updateTenant,
  deleteTenant,
};
