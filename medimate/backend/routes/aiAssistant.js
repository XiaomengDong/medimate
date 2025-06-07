const express = require('express');
const multer  = require('multer');
const router  = express.Router();
const upload  = multer({ dest: 'uploads/' });

// POST /chat
router.post("/chat", async (req, res, next) => {
    console.log("[/chat] body =", req.body);
  try {
    const assistant = req.app.get("aiAssistant");
    const { message, chatHistory = [] } = req.body || {};

    const reply = await assistant.chat(message, chatHistory);
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

// POST /upload
router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    const assistant = req.app.get("aiAssistant");

    const analysis = await assistant.analyzeFile(req.file);

    res.json({ fileName: req.file.originalname, analysis });
  } catch (err) {
    next(err);
  }
});

module.exports = router;