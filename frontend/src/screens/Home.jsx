import { supabase } from '../supabaseClient';
import React, { useState, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Check, X, Loader2, Sparkles, Languages } from 'lucide-react';

const promptGuides = {
  en: {
    guide: "Say something like: 'Ramesh owes 500 rupees' or 'Karan paid 200 rupees'",
    title: "Voice Ledger Assistant",
    tapToRecord: "Tap mic to start speaking...",
    recording: "Listening carefully...",
    transcribing: "Transcribing your voice...",
    parsing: "Parsing transaction details...",
    saved: "Transaction saved successfully!"
  },
  te: {
    guide: "ఇలా చెప్పండి: 'రమేష్ 500 రూపాయలు అప్పు' లేదా 'కరణ్ 200 రూపాయలు చెల్లించాడు'",
    title: "వాయిస్ లెడ్జర్ అసిస్టెంట్",
    tapToRecord: "మాట్లాడటానికి మైక్‌ని నొక్కండి...",
    recording: "వినబడుతోంది...",
    transcribing: "మీ వాయిస్‌ని టెక్స్ట్‌గా మారుస్తోంది...",
    parsing: "వివరాలను విశ్లేషిస్తోంది...",
    saved: "లావాదేవీ విజయవంతంగా సేవ్ చేయబడింది!"
  },
  hi: {
    guide: "ऐसे बोलें: 'रमेश ने 500 रुपये उधार लिए' या 'करण ने 200 रुपये दिए'",
    title: "वॉइस बहीखाता सहायक",
    tapToRecord: "बोलने के लिए माइक दबाएं...",
    recording: "सुन रहा हूँ...",
    transcribing: "आवाज़ को टेक्स्ट में बदला जा रहा है...",
    parsing: "लेनदेन का विवरण निकाला जा रहा है...",
    saved: "लेनदेन सफलतापूर्वक सहेज लिया गया!"
  },
  ta: {
    guide: "இப்படி சொல்லுங்கள்: 'ரமேஷ் 500 ரூபாய் கடன்' அல்லது 'கரன் 200 ரூபாய் கொடுத்தார்'",
    title: "குரல் கணக்கு உதவியாளர்",
    tapToRecord: "பேசத் தொடங்க மைக்கைத் தட்டவும்...",
    recording: "கேட்டுக்கொண்டிருக்கிறது...",
    transcribing: "குரலை உரைக்கு மாற்றுகிறது...",
    parsing: "விவரங்களைப் பகுப்பாய்வு செய்கிறது...",
    saved: "பரிவர்த்தனை வெற்றிகரமாக சேமிக்கப்பட்டது!"
  }
};

// Levenshtein distance helper
function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Find a fuzzy matching suggestion (similar but not auto-merged)
function getFuzzyMatchSuggestion(newName, existingNames) {
  if (!newName) return null;
  const normalizedNew = newName.trim().toLowerCase().replace(/\s+/g, '');
  if (normalizedNew.length === 0) return null;
  
  let bestMatch = null;
  let minDistance = Infinity;
  
  for (const existing of existingNames) {
    const normalizedExisting = existing.toLowerCase().replace(/\s+/g, '');
    
    if (normalizedExisting === normalizedNew) {
      continue;
    }
    
    const dist = levenshteinDistance(normalizedExisting, normalizedNew);
    const maxLen = Math.max(normalizedExisting.length, normalizedNew.length);
    
    const isSuggestion = (dist === 1 && maxLen <= 3) || 
                         (dist === 2 && maxLen < 6) || 
                         (dist === 3 && maxLen >= 6);
                         
    if (isSuggestion && dist < minDistance) {
      minDistance = dist;
      bestMatch = existing;
    }
  }
  
  return bestMatch;
}

export default function Home({ language = 'en', backendUrl = 'http://localhost:5000', onChangeLanguage }) {
  const [isRecording, setIsRecording] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    amount: 0,
    action: 'owe'
  });
  
  const [successToast, setSuccessToast] = useState(false);
  const [errorText, setErrorText] = useState('');
  
  const [existingNames, setExistingNames] = useState([]);
  const [suggestionName, setSuggestionName] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  React.useEffect(() => {
    const fetchExistingNames = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/transactions`);
        if (res.ok) {
          const data = await res.json();
          const names = Array.from(new Set(data.map(tx => tx.customer_name.trim())));
          setExistingNames(names);
        }
      } catch (err) {
        console.error('Failed to pre-fetch customer names:', err);
      }
    };
    fetchExistingNames();
  }, [backendUrl]);

  const handleNameChange = (val) => {
    setFormData(prev => ({ ...prev, customer_name: val }));
    const sugg = getFuzzyMatchSuggestion(val, existingNames);
    setSuggestionName(sugg);
  };

  const textResources = promptGuides[language] || promptGuides.en;

 
  const startRecording = async () => {
    audioChunksRef.current = [];
    setErrorText('');
    setTranscription('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/ogg';
        if (!MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = '';
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        await handleAudioUpload(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatusText(textResources.recording);
    } catch (err) {
      console.error('Error starting audio recording:', err);
      setErrorText('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioUpload = async (audioBlob) => {
    setIsLoading(true);
    setStatusText(textResources.transcribing);

    const formDataObj = new FormData();
    formDataObj.append('audio', audioBlob, 'record.webm');

    try {
      const transcribeResponse = await fetch(`${backendUrl}/api/transcribe`, {
        method: 'POST',
        body: formDataObj,
      });

      if (!transcribeResponse.ok) {
        const errJson = await transcribeResponse.json();
        throw new Error(errJson.error || 'Failed to transcribe audio.');
      }

      const transcribeData = await transcribeResponse.json();
      const text = transcribeData.text;
      setTranscription(text);

      if (!text || text.trim().length === 0) {
        throw new Error('No speech detected. Please speak louder or closer to the mic.');
      }

      setStatusText(textResources.parsing);
      const parseResponse = await fetch(`${backendUrl}/api/parse-entry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!parseResponse.ok) {
        throw new Error('Failed to parse text transaction details.');
      }

      const parsedJson = await parseResponse.json();
      console.log('Parsed transaction:', parsedJson);

      const parsedName = parsedJson.customer_name || '';

      setFormData({
        customer_name: parsedName,
        amount: parsedJson.amount || 0,
        action: parsedJson.action === 'paid' ? 'paid' : 'owe'
      });
      
      const sugg = getFuzzyMatchSuggestion(parsedName, existingNames);
      setSuggestionName(sugg);
      
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setErrorText(err.message || 'Error occurred while processing.');
    } finally {
      setIsLoading(false);
      setStatusText('');
    }
  };

  const handleConfirmSave = async () => {
    setIsLoading(true);
    setErrorText('');

    try {
      const response = await fetch(`${backendUrl}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to save transaction to ledger.');
      }

      const savedName = formData.customer_name.trim();
      if (!existingNames.includes(savedName)) {
        setExistingNames(prev => [...prev, savedName]);
      }
      setShowModal(false);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3000);
    } catch (err) {
      console.error(err);
      setErrorText(err.message || 'Database save failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-20px bg-background text-on-background pb-32">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-sans flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          <span>Khata AI</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onChangeLanguage}
            className="flex items-center gap-2 bg-surface-container hover:bg-primary/10 px-4 py-2 rounded-full text-xs font-semibold font-sans text-on-surface-variant transition-colors border border-surface-container"
          >
            <Languages className="w-4 h-4 text-primary" />
            <span>{language === 'en' ? 'English' : language === 'te' ? 'తెలుగు' : language === 'hi' ? 'हिन्दी' : 'தமிழ்'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center my-6">
   
    
        <div className="bg-surface-container-lowest shadow-premium-sm border border-surface-container p-8 rounded-3xl w-full max-w-md flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          <span className="text-xs uppercase tracking-wider text-primary font-bold mb-2">
            {textResources.title}
          </span>
          
          <p className="text-on-surface-variant font-sans text-sm max-w-[280px] mb-8">
            {textResources.guide}
          </p>

          <div className="relative flex items-center justify-center mb-6">
            {isRecording && (
              <>
                <span className="animate-ping absolute inline-flex h-32 w-32 rounded-full bg-primary/20 opacity-75"></span>
                <span className="animate-pulse absolute inline-flex h-24 w-24 rounded-full bg-primary/30"></span>
              </>
            )}
            
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-premium-lg ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 text-white scale-110' 
                  : 'bg-primary hover:bg-primary-dark text-white active:scale-95'
              } disabled:opacity-50 disabled:pointer-events-none`}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          <div className="h-14 flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-1">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <span className="text-xs text-on-surface-variant font-sans font-medium">{statusText}</span>
              </div>
            ) : (
              <span className={`text-sm font-sans font-medium ${isRecording ? 'text-red-500 animate-pulse' : 'text-on-surface-variant'}`}>
                {isRecording ? textResources.recording : textResources.tapToRecord}
              </span>
            )}
          </div>

          {transcription && (
            <div className="w-full mt-4 p-4 bg-surface-container-low rounded-2xl border border-surface-container text-left">
              <span className="text-xs text-primary font-bold block mb-1">What we heard:</span>
              <p className="text-sm font-sans italic text-on-background">"{transcription}"</p>
            </div>
          )}

          {errorText && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-left w-full">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-red-700 font-sans">{errorText}</span>
            </div>
          )}
        </div>
      </div>

      {successToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 glassmorphism shadow-premium-sm border-tertiary border px-6 py-3 rounded-full flex items-center gap-2 text-tertiary">
          <Check className="w-5 h-5 bg-tertiary text-white rounded-full p-0.5" />
          <span className="text-sm font-bold font-sans">{textResources.saved}</span>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-6 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-surface-container animate-in fade-in-50 zoom-in-95 duration-250">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold font-sans text-on-background">Verify Entry</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="E.g., Ramesh"
                  className="w-full px-4 py-2 border-2 border-surface-container rounded-2xl bg-surface-container-low text-on-background font-sans focus:outline-none focus:border-primary text-base"
                />
                
                {suggestionName && (
                  <div className="mt-2 bg-secondary/15 border border-secondary/40 rounded-2xl p-3 flex flex-col gap-1.5 animate-in slide-in-from-top-1 duration-200">
                    <p className="text-xs text-on-surface-variant font-sans leading-relaxed">
                      Did you mean <strong className="text-primary font-bold">{suggestionName}</strong> instead of <strong className="font-bold">{formData.customer_name}</strong>?
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, customer_name: suggestionName }));
                        setSuggestionName(null);
                      }}
                      className="self-end px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-primary-dark transition active:scale-95 min-h-[30px]"
                    >
                      Yes, Use {suggestionName}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border-2 border-surface-container rounded-2xl bg-surface-container-low text-on-background font-sans focus:outline-none focus:border-primary text-base"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, action: 'owe' })}
                    className={`py-3 rounded-2xl font-bold font-sans transition-all duration-200 border-2 ${
                      formData.action === 'owe'
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-surface-container-low border-surface-container text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    Owes Me (Udhaar)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, action: 'paid' })}
                    className={`py-3 rounded-2xl font-bold font-sans transition-all duration-200 border-2 ${
                      formData.action === 'paid'
                        ? 'bg-tertiary/10 border-tertiary text-tertiary'
                        : 'bg-surface-container-low border-surface-container text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    Paid (Jama)
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-3xl font-bold font-sans bg-surface-container hover:bg-surface-container-low text-on-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={isLoading || !formData.customer_name || formData.amount <= 0}
                className="flex-1 py-3 rounded-3xl font-bold font-sans bg-primary hover:bg-primary-dark text-white shadow-premium-sm disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}