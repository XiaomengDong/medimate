const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const HealthProfile = require("../models/HealthProfile");

router.use(auth);               // 全部接口需登录

// GET /api/health-profile
router.get("/", async (req, res, next) => {
  try {
    const profile = await HealthProfile.get(req.user.id);
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// PUT /api/health-profile
router.put("/", async (req, res, next) => {
  try {
    const saved = await HealthProfile.upsert(req.user.id, req.body);
    res.json(saved);            // 200 on insert & update
  } catch (err) {
    next(err);
  }
});

module.exports = router;
