const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { OpenAI } = require('openai');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI(process.env.OPENAI_API_KEY);

// AI Chat endpoint
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, healthContext } = req.body;
    
    const prompt = `As a medical AI assistant, respond to this health question.
    Patient context: ${JSON.stringify(healthContext || {})}
    Question: ${message}
    Provide a helpful, professional response:`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful medical AI assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    res.json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

// Document analysis endpoint
router.post('/analyze', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    // In a real implementation, you would:
    // 1. Process the uploaded file
    // 2. Extract text (using OCR if needed)
    // 3. Send to AI for analysis
    
    // Mock implementation
    const mockResponse = {
      summary: "Based on the document analysis, your results appear normal. Key findings:\n- Cholesterol: 180 mg/dL (normal range)\n- Blood pressure: 120/80\nRecommend annual checkup.",
      highlights: ["Normal cholesterol", "Healthy blood pressure"]
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Document analysis failed' });
  }
});

module.exports = router;