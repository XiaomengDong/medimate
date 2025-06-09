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

// POST /generate-report - Generate health report in JSON format
router.post("/generate-report", authenticateToken, async (req, res) => {
  try {
    const { healthData, patientInfo } = req.body;

    // Validate required health data
    if (!healthData || !patientInfo) {
      return res.status(400).json({ error: 'Health data and info is required' });
    }

    // Create comprehensive prompt for health report generation
    const prompt = `As a medical AI assistant, analyze the following health data and generate a comprehensive health report in valid JSON format.
    
    Health Data: ${JSON.stringify(healthData)}
    Patient Info: ${JSON.stringify(patientInfo)}
    
    Generate a detailed health report with the following JSON structure:
    {
      "reportId": "unique_report_id",
      "generatedAt": "ISO_timestamp",
      "patientSummary": {
        "age": "if_provided",
        "gender": "if_provided",
        "overallHealthStatus": "excellent/good/fair/poor"
        "overallHealthScore": "0-100",
      },
      "vitalSigns": {
        "heartRate": {
          "value": "bpm",
          "status": "normal/elevated/low",
          "analysis": "brief_analysis"
        },
        "bloodPressure": {
          "systolic": "mmHg",
          "diastolic": "mmHg", 
          "status": "normal/high/low",
          "analysis": "brief_analysis"
        },
        "temperature": {
          "value": "if_provided",
          "status": "normal/fever/hypothermia",
          "analysis": "brief_analysis"
        },
        "oxygenSaturation": {
          "value": "if_provided",
          "status": "normal/low",
          "analysis": "brief_analysis"
        }
      },
      "healthMetrics": {
        "bmi": {
          "value": "if_height_weight_provided",
          "category": "underweight/normal/overweight/obese",
          "analysis": "brief_analysis"
        },
        "sleepPatterns": {
          "hoursPerNight": "if_provided",
          "quality": "poor/fair/good/excellent",
          "analysis": "brief_analysis"
        },
        "activityLevel": {
          "stepsPerDay": "if_provided",
          "exerciseMinutes": "if_provided",
          "analysis": "brief_analysis"
        }
      },
      "riskAssessment": {
        "cardiovascularRisk": "low/moderate/high",
        "diabetesRisk": "low/moderate/high",
        "overallRisk": "low/moderate/high",
        "riskFactors": ["array_of_identified_risks"]
      },
      "recommendations": {
        "immediate": ["array_of_immediate_actions"],
        "lifestyle": ["array_of_lifestyle_recommendations"],
        "monitoring": ["array_of_monitoring_suggestions"],
        "followUp": ["array_of_follow_up_recommendations"]
      },
      "alerts": {
        "critical": ["array_of_critical_alerts"],
        "warnings": ["array_of_warning_alerts"],
        "notifications": ["array_of_general_notifications"]
      },
      "trends": {
        "improving": ["array_of_improving_metrics"],
        "declining": ["array_of_declining_metrics"],
        "stable": ["array_of_stable_metrics"]
      },
      "disclaimer": "This report is for informational purposes only and should not replace professional medical advice. Consult with a healthcare provider for proper medical evaluation and treatment."
    }
    
    Analyze all provided health metrics thoroughly and provide specific, actionable insights. Ensure the JSON is valid and complete. If certain data points are missing, indicate "not_provided" in the value field but still provide relevant analysis based on available data.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a medical AI assistant specializing in health data analysis. Always respond with valid JSON format only. Do not include any text outside of the JSON structure."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent JSON output
      max_tokens: 2000
    });

    let healthReport;
    try {
      // Parse the JSON response
      healthReport = JSON.parse(response.choices[0].message.content);

      // Add metadata
      healthReport.reportId = `HR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      healthReport.generatedAt = new Date().toISOString();

    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return res.status(500).json({
        error: 'Failed to generate valid health report',
        details: 'AI response was not in valid JSON format'
      });
    }

    res.json({
      success: true,
      report: healthReport,
      metadata: {
        dataPointsAnalyzed: Object.keys(healthData).length,
        reportGeneratedAt: new Date().toISOString(),
        model: "gpt-4o-mini"
      }
    });

  } catch (error) {
    console.error('Health report generation error:', error);
    res.status(500).json({
      error: 'Failed to generate health report',
      details: error.message
    });
  }
});


module.exports = router;