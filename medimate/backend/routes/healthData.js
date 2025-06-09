const express = require("express");
const router = express.Router();
const HealthData = require("../models/HealthData");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware); // protect all endpoints below

// POST /api/health-data
router.post("/", async (req, res, next) => {
  try {
    const { date, type, value, note } = req.body;
    if (!date || !type || value == null) {
      return res.status(400).json({ error: "date, type & value are required" });
    }
    const entry = await HealthData.create({
      ownerId: req.user.id,
      date,
      type,
      value,
      note,
    });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

// GET /api/health-data
router.get("/", async (req, res, next) => {
  try {
    const entries = await HealthData.list(req.user.id, req.query);
    res.json(entries);
  } catch (err) {
    next(err);
  }
});

// GET /api/health-data/:id
router.get("/:id", async (req, res, next) => {
  try {
    const entry = await HealthData.getById(req.params.id, req.user.id);
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

// PUT /api/health-data/:id
router.put("/:id", async (req, res, next) => {
  try {
    const fields = (({ date, type, value, note }) => ({ date, type, value, note }))(req.body);
    Object.keys(fields).forEach(k => fields[k] == null && delete fields[k]);
    if (Object.keys(fields).length === 0) return res.status(400).json({ error: "No fields to update" });

    const updated = await HealthData.update(req.params.id, req.user.id, fields);
    if (!updated) return res.status(404).json({ error: "Entry not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
    try {
      const updated = await HealthData.update(
        req.params.id,
        req.user.id,
        req.body  // 允许部分字段
      );
      if (!updated) return res.status(404).json({ error: "Entry not found" });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

// DELETE /api/health-data/:id
router.delete("/:id", async (req, res, next) => {
  try {
    await HealthData.remove(req.params.id, req.user.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;