import express from "express";
import { searchLandRecord, getMyLandRecords, saveLandRecord, deleteLandRecord } from "../controllers/landRecordController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/search", searchLandRecord);
router.get("/my-records", protect, getMyLandRecords);
router.post("/save", protect, saveLandRecord);
router.delete("/:id", protect, deleteLandRecord);

export default router;
