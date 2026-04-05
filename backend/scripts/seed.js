const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Complaint = require("../models/Complaint");
const Expense = require("../models/Expense");
const Payment = require("../models/Payment");
const Room = require("../models/Room");
const Tenant = require("../models/Tenant");
const User = require("../models/User");

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Room.deleteMany({}),
      Tenant.deleteMany({}),
      Payment.deleteMany({}),
      Complaint.deleteMany({}),
      Expense.deleteMany({}),
    ]);

    const admin = await User.create({
      name: "Hostel Admin",
      email: "admin@hostel.com",
      password: "admin123",
    });

    const rooms = await Room.insertMany([
      { roomNumber: "101", capacity: 2, currentOccupancy: 0 },
      { roomNumber: "102", capacity: 3, currentOccupancy: 0 },
      { roomNumber: "103", capacity: 1, currentOccupancy: 0 },
      { roomNumber: "201", capacity: 2, currentOccupancy: 0 },
    ]);

    const tenants = await Tenant.insertMany([
      {
        name: "Aarav Sharma",
        phone: "9876543210",
        idProof: "AADHAAR-1001",
        room: rooms[0]._id,
        roomNumber: rooms[0].roomNumber,
        joiningDate: new Date("2026-01-10"),
      },
      {
        name: "Priya Iyer",
        phone: "9876543211",
        idProof: "AADHAAR-1002",
        room: rooms[0]._id,
        roomNumber: rooms[0].roomNumber,
        joiningDate: new Date("2026-02-01"),
      },
      {
        name: "Kabir Mehta",
        phone: "9876543212",
        idProof: "AADHAAR-1003",
        room: rooms[1]._id,
        roomNumber: rooms[1].roomNumber,
        joiningDate: new Date("2026-03-08"),
      },
    ]);

    rooms[0].currentOccupancy = 2;
    rooms[1].currentOccupancy = 1;
    await Promise.all(rooms.map((room) => room.save()));

    const currentMonth = new Date().toISOString().slice(0, 7);

    await Payment.insertMany([
      {
        tenant: tenants[0]._id,
        month: currentMonth,
        amount: 7000,
        status: "Paid",
        paymentDate: new Date(),
      },
      {
        tenant: tenants[1]._id,
        month: currentMonth,
        amount: 7000,
        status: "Pending",
      },
      {
        tenant: tenants[2]._id,
        month: currentMonth,
        amount: 6500,
        status: "Pending",
      },
    ]);

    await Complaint.insertMany([
      {
        tenant: tenants[0]._id,
        tenantName: tenants[0].name,
        description: "Wi-Fi is not working in room 101.",
        status: "Open",
      },
      {
        tenant: tenants[2]._id,
        tenantName: tenants[2].name,
        description: "Need repair for bathroom tap.",
        status: "Resolved",
        resolvedAt: new Date("2026-03-28"),
      },
    ]);

    await Expense.insertMany([
      {
        title: "Groceries and kitchen supplies",
        category: "Food",
        amount: 3200,
        date: new Date(),
        notes: "Vegetables, rice, oil and pantry restock",
        paymentMode: "UPI",
      },
      {
        title: "Electricity bill payment",
        category: "Utilities",
        amount: 5400,
        date: new Date(new Date().setDate(new Date().getDate() - 2)),
        notes: "Monthly electricity bill",
        paymentMode: "Net Banking",
      },
      {
        title: "Plumbing repair",
        category: "Maintenance",
        amount: 1800,
        date: new Date(new Date().setDate(new Date().getDate() - 8)),
        notes: "Bathroom tap replacement",
        paymentMode: "Cash",
      },
      {
        title: "Cleaning supplies",
        category: "Housekeeping",
        amount: 1250,
        date: new Date(new Date().setDate(new Date().getDate() - 14)),
        notes: "Floor cleaner and disinfectants",
        paymentMode: "UPI",
      },
    ]);

    console.log("Seeding completed successfully.");
    console.log("Admin credentials: admin@hostel.com / admin123");
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

seed();
