import Scholarship from "../models/Scholarship.js";
import ScholarshipApplication from "../models/ScholarshipApplication.js";

// GET /api/scholarships
export const getScholarships = async (req, res) => {
  const { category, search } = req.query;
  const query = { isActive: true };
  if (category) query.category = category;
  if (search) query.title = { $regex: search, $options: "i" };
  const scholarships = await Scholarship.find(query).sort("deadlineDate");
  res.status(200).json({ success: true, scholarships });
};

// GET /api/scholarships/:id
export const getScholarship = async (req, res) => {
  const scholarship = await Scholarship.findById(req.params.id);
  if (!scholarship) return res.status(404).json({ success: false, message: "Scholarship not found." });
  res.status(200).json({ success: true, scholarship });
};

// POST /api/scholarships (admin)
export const createScholarship = async (req, res) => {
  const scholarship = await Scholarship.create(req.body);
  res.status(201).json({ success: true, scholarship });
};

// PUT /api/scholarships/:id (admin)
export const updateScholarship = async (req, res) => {
  const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!scholarship) return res.status(404).json({ success: false, message: "Scholarship not found." });
  res.status(200).json({ success: true, scholarship });
};

// POST /api/scholarships/:id/apply
export const applyScholarship = async (req, res) => {
  const existing = await ScholarshipApplication.findOne({
    scholarship: req.params.id,
    user: req.user._id,
  });
  if (existing) {
    return res.status(400).json({ success: false, message: "You have already applied for this scholarship." });
  }
  const application = await ScholarshipApplication.create({
    scholarship: req.params.id,
    user: req.user._id,
  });
  res.status(201).json({ success: true, application });
};

// GET /api/scholarships/my-applications
export const getMyApplications = async (req, res) => {
  const applications = await ScholarshipApplication.find({ user: req.user._id })
    .populate("scholarship", "title provider amount deadline category");
  res.status(200).json({ success: true, applications });
};

// GET /api/scholarships/admin/applications  (admin)
export const getAllApplications = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  const skip  = (Number(page) - 1) * Number(limit);
  const total = await ScholarshipApplication.countDocuments(query);
  const applications = await ScholarshipApplication.find(query)
    .populate("user",        "firstName lastName email farmerId isVerified")
    .populate("scholarship", "title provider amount")
    .sort("-createdAt")
    .skip(skip)
    .limit(Number(limit));
  res.status(200).json({ success: true, total, applications });
};

// PUT /api/scholarships/admin/applications/:id  (admin)
export const updateApplicationStatus = async (req, res) => {
  const { status, notes } = req.body;
  const application = await ScholarshipApplication.findByIdAndUpdate(
    req.params.id,
    { status, notes },
    { new: true }
  ).populate("user scholarship");
  if (!application) return res.status(404).json({ success: false, message: "Application not found." });
  res.status(200).json({ success: true, application });
};
