const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Groq } = require('groq-sdk');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized successfully.');
} else {
  console.warn('Supabase URL or Key is missing. Database operations will fail.');
}

// Initialize Groq Client
const groqApiKey = process.env.GROQ_API_KEY;
let groq = null;

if (groqApiKey) {
  groq = new Groq({ apiKey: groqApiKey });
  console.log('Groq SDK client initialized successfully.');
} else {
  console.warn('Groq API Key is missing. AI features will fail.');
}

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for local temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique name keeping original extension if possible
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    supabase: !!supabase,
    groq: !!groq,
    timestamp: new Date().toISOString()
  });
});

// Endpoint: Transcribe Audio using Groq Whisper API
// Expects multipart/form-data with file field 'audio'
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  if (!groq) {
    return res.status(500).json({ error: 'Groq client not initialized. Check GROQ_API_KEY.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded.' });
  }

  const filePath = req.file.path;
  console.log(`Received transcription request. Temporary file path: ${filePath}`);

  try {
    // Call Groq Whisper API
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3',
      language: 'en', // Let whisper automatically detect or default to multilingual. We can omit language to let it auto-detect.
    });

    console.log(`Transcription completed: "${transcription.text}"`);
    res.json({ text: transcription.text });
  } catch (error) {
    console.error('Error in /api/transcribe:', error);
    res.status(500).json({ error: 'Failed to transcribe audio.', details: error.message });
  } finally {
    // Always clean up the uploaded temporary file
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Failed to delete temp file ${filePath}:`, err);
    });
  }
});

// Endpoint: Parse text into structured transaction details using Groq LLaMA API
app.post('/api/parse-entry', async (req, res) => {
  if (!groq) {
    return res.status(500).json({ error: 'Groq client not initialized. Check GROQ_API_KEY.' });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'No text provided for parsing.' });
  }

  console.log(`Parsing text: "${text}"`);

  const systemPrompt = `You are a parser for a shopkeeper's voice notes about customer credit (udhaar). Extract customer_name, amount (number only), and action (owe or paid) from the input text, which may be in English, Telugu, Hindi, Tamil, or mixed. Respond only in JSON format: {"customer_name": "", "amount": 0, "action": ""}. If anything is unclear, set that field to null instead of guessing.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: text
        }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.1 // Low temperature for consistent JSON parsing
    });

    const resultText = chatCompletion.choices[0].message.content;
    console.log(`Parsed result: ${resultText}`);
    
    // Parse to ensure it is valid JSON before returning
    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error) {
    console.error('Error in /api/parse-entry:', error);
    res.status(500).json({ error: 'Failed to parse text entry.', details: error.message });
  }
});

// Endpoint: Save a transaction to Supabase
app.post('/api/transactions', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not initialized. Check credentials.' });
  }

  const { customer_name, amount, action } = req.body;
  if (!customer_name || amount === undefined || !action) {
    return res.status(400).json({ error: 'Missing required transaction fields.' });
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          customer_name: customer_name.trim(),
          amount: parseFloat(amount),
          action: action.toLowerCase() // 'owe' or 'paid'
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    console.log('Saved transaction:', data);
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error saving transaction to Supabase:', error);
    res.status(500).json({ error: 'Database saving failed.', details: error.message });
  }
});

// Endpoint: Fetch all transactions from Supabase
app.get('/api/transactions', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not initialized. Check credentials.' });
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching transactions from Supabase:', error);
    res.status(500).json({ error: 'Database fetching failed.', details: error.message });
  }
});

// Endpoint: Analyze shelf photo using Groq Vision API
// Expects multipart/form-data with file field 'image'
app.post('/api/check-stock', upload.single('image'), async (req, res) => {
  if (!groq) {
    return res.status(500).json({ error: 'Groq client not initialized. Check GROQ_API_KEY.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }

  const filePath = req.file.path;
  console.log(`Received stock image request. Temporary path: ${filePath}`);

  try {
    // Read the file and convert to base64
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Prompt for LLaMA 3.2 Vision Model
    const userPrompt = `Analyze this shop shelf photo. Identify distinct product zones and estimate each zone's stock level as low, medium, or high based on visual fullness.

Follow these rules strictly:
- Do NOT guess or invent specific brand names or exact product names.
- Describe each shelf section generically (for example: "Top shelf", "Middle shelf", "Bottom shelf", "Yellow boxes on second shelf", "Blue tubes").
- Estimate the stock level strictly as "low", "medium", or "high".
- If you are uncertain about the product name or zone, set the zone_description to "Unknown" instead of inventing a brand or product name.

Respond in JSON as a single object with a key "zones" containing a list of objects, where each object has the keys "zone_description" and "stock_level".`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        }
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      response_format: { type: 'json_object' }
    });

    const resultText = chatCompletion.choices[0].message.content;
    console.log(`Vision result: ${resultText}`);

    const parsedData = JSON.parse(resultText);
    
    // Ensure the structure has the list of zones
    // Either it is directly a list or wrapped in an object
    let zones = [];
    if (Array.isArray(parsedData)) {
      zones = parsedData;
    } else if (parsedData.zones && Array.isArray(parsedData.zones)) {
      zones = parsedData.zones;
    } else if (typeof parsedData === 'object') {
      // Find any array property
      const keys = Object.keys(parsedData);
      const arrayKey = keys.find(k => Array.isArray(parsedData[k]));
      if (arrayKey) {
        zones = parsedData[arrayKey];
      } else {
        // Fallback convert keys/values to zones
        zones = Object.entries(parsedData).map(([key, val]) => ({
          zone_description: key,
          stock_level: typeof val === 'string' ? val : 'medium'
        }));
      }
    }

    res.json({ zones });
  } catch (error) {
    console.error('Error in /api/check-stock:', error);
    res.status(500).json({ error: 'Failed to analyze stock image.', details: error.message });
  } finally {
    // Always clean up temporary file
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Failed to delete temp file ${filePath}:`, err);
    });
  }
});

app.listen(PORT, () => {
  console.log(`Khata AI Server is running on port ${PORT}`);
});
