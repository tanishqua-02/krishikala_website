import express from "express";
import {
  getScholarships, getScholarship, createScholarship, updateScholarship,
  applyScholarship, getMyApplications, getAllApplications, updateApplicationStatus,
} from "../controllers/scholarshipController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/",                          getScholarships);
router.get("/my-applications",           protect, getMyApplications);
router.get("/:id",                       getScholarship);
router.post("/",                         protect, adminOnly, createScholarship);
router.put("/:id",                       protect, adminOnly, updateScholarship);
router.post("/:id/apply",               protect, applyScholarship);
router.get("/admin/applications",        protect, adminOnly, getAllApplications);
router.put("/admin/applications/:id",    protect, adminOnly, updateApplicationStatus);

export default router;
