import LandRecord from "../models/LandRecord.js";

// POST /api/land-records/search
export const searchLandRecord = async (req, res) => {
  const { district, taluka, village, surveyNumber, recordType } = req.body;

  if (!district || !taluka || !village || !surveyNumber) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  // In a real app, this would query a government API.
  // Here we search our DB or return a mock result if not found.
  let record = await LandRecord.findOne({
    district: { $regex: district, $options: "i" },
    taluka: { $regex: taluka, $options: "i" },
    village: { $regex: village, $options: "i" },
    surveyNumber: { $regex: surveyNumber, $options: "i" },
    recordType: recordType || "712",
  });

  if (!record) {
    // Return a mock record for demo purposes
    return res.status(200).json({
      success: true,
      found: false,
      message: "No record found in our database. Please verify on the official Maharashtra Bhulekh portal.",
      officialPortal: "https://bhulekh.mahabhumi.gov.in/",
    });
  }

  res.status(200).json({ success: true, found: true, record });
};

// GET /api/land-records/my-records
export const getMyLandRecords = async (req, res) => {
  const records = await LandRecord.find({ user: req.user._id });
  res.status(200).json({ success: true, records });
};

// POST /api/land-records/save
export const saveLandRecord = async (req, res) => {
  const record = await LandRecord.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, record });
};

// DELETE /api/land-records/:id
export const deleteLandRecord = async (req, res) => {
  const record = await LandRecord.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!record) return res.status(404).json({ success: false, message: "Record not found." });
  res.status(200).json({ success: true, message: "Record deleted." });
};
