const Complaint = require("../models/Complaint");
const Tenant = require("../models/Tenant");

const getComplaints = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const complaints = await Complaint.find(query)
      .populate("tenant", "name roomNumber")
      .sort({ raisedAt: -1 });

    return res.status(200).json(complaints);
  } catch (error) {
    return next(error);
  }
};

const createComplaint = async (req, res, next) => {
  try {
    const { tenantId, tenantName, description } = req.body;
    if (!description) {
      return res.status(400).json({ message: "Complaint description is required." });
    }

    let resolvedTenantName = tenantName;
    let tenant = null;

    if (tenantId) {
      tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found." });
      }
      resolvedTenantName = tenant.name;
    }

    if (!resolvedTenantName) {
      return res.status(400).json({ message: "Tenant name or tenantId is required." });
    }

    const complaint = await Complaint.create({
      tenant: tenant ? tenant._id : null,
      tenantName: resolvedTenantName,
      description,
    });

    return res.status(201).json({
      message: "Complaint raised successfully.",
      data: complaint,
    });
  } catch (error) {
    return next(error);
  }
};

const updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    if (!status || !["Open", "Resolved"].includes(status)) {
      return res.status(400).json({ message: "Status must be Open or Resolved." });
    }

    complaint.status = status;
    complaint.resolvedAt = status === "Resolved" ? Date.now() : null;
    await complaint.save();

    return res.status(200).json({
      message: "Complaint updated successfully.",
      data: complaint,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getComplaints,
  createComplaint,
  updateComplaint,
};
