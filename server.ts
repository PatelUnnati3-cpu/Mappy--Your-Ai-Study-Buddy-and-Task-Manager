import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Helper function to generate high-fidelity simulated responses in character when Gemini API Key is missing or fails
function generateSimulatedResponse(
  userText: string,
  theme: string,
  breakdownMode: string,
  seriousness: string,
  languageOption: string
): string {
  const text = (userText || "").toLowerCase();
  const lang = languageOption || "English";
  const activeTheme = theme || "Ghar Jaisa";

  // Determine subject or task type
  let subject = "study topic";
  if (text.includes("math") || text.includes("calc") || text.includes("algebra") || text.includes("geometry") || text.includes("trig")) {
    subject = "Mathematics";
  } else if (text.includes("physics") || text.includes("mechanics") || text.includes("gravity") || text.includes("optics")) {
    subject = "Physics";
  } else if (text.includes("chemistry") || text.includes("chemical") || text.includes("organic") || text.includes("periodic")) {
    subject = "Chemistry";
  } else if (text.includes("history") || text.includes("war") || text.includes("civil") || text.includes("century")) {
    subject = "History";
  } else if (text.includes("code") || text.includes("program") || text.includes("python") || text.includes("javascript") || text.includes("react") || text.includes("html") || text.includes("css")) {
    subject = "Computer Science / Coding";
  } else if (text.includes("english") || text.includes("literature") || text.includes("essay") || text.includes("grammar")) {
    subject = "English / Literature";
  } else if (text.includes("biology") || text.includes("cell") || text.includes("human") || text.includes("plant") || text.includes("anatomy")) {
    subject = "Biology";
  }

  // Create customized responses based on Theme + Language
  let baseMsg = "";

  if (activeTheme === "Ghar Jaisa") {
    if (lang === "Hindi") {
      baseMsg = `[MAA] अरे बेटा, ${subject} के बारे में चिंता बिल्कुल मत करो। हम मिलकर इसे बहुत अच्छे से और आसानी से पूरा कर लेंगे। पहले एक गहरी सांस लो, थोड़ा पानी पी लो और मन शांत करो, अच्छा? मैं तुम्हारे साथ हूँ!`;
    } else if (lang === "Hinglish") {
      baseMsg = `[MAA] Beta, tension bilkul mat lo about ${subject}! We will tackle this together step-by-step. Pehle take a deep breath, thoda paani pi lo and relax your mind, okay? Mai hamesha aapke saath hoon.`;
    } else {
      baseMsg = `[MAA] Oh my dear beta, do not worry about ${subject} at all! We will tackle this study goal together step-by-step. Take a deep breath and have some water first, okay? I am right here supporting you.`;
    }
  } else if (activeTheme === "Level Up") {
    if (lang === "Hindi") {
      baseMsg = `[PAPA] चलो खिलाड़ी! ${subject} का एक नया दैनिक खोज (Quest) आपके बोर्ड पर आ गया है। चलिए बिना किसी विकर्षण (distraction) के पूरी ताकत लगा देते हैं और +100 XP के साथ इस अकादमिक बॉस को हराते हैं!`;
    } else if (lang === "Hinglish") {
      baseMsg = `[PAPA] Chalo trooper! A new daily quest for ${subject} has appeared on your board. Let's gear up, lock all distractions, and defeat this study raid to claim your +100 XP reward! Ready, player?`;
    } else {
      baseMsg = `[PAPA] Alright player! A new daily quest for ${subject} has been initiated on your tactical dashboard. Let's block out all social media distractions, prepare our focus items, and beat this study boss for a clean +100 XP level up!`;
    }
  } else if (activeTheme === "Clean Slate") {
    if (lang === "Hindi") {
      baseMsg = `${subject} लक्ष्य प्राप्त हुआ। संरचित कार्य योजना तैयार की जा रही है। विकर्षणों को दूर रखें और प्रत्येक उप-कार्य को व्यवस्थित रूप से पूरा करें।`;
    } else if (lang === "Hinglish") {
      baseMsg = `${subject} target received. Structured action plan has been initiated. Minimize all distraction logs and execute each sub-task systematically.`;
    } else {
      baseMsg = `Target for ${subject} successfully locked. Compiling high-focus operational milestones. Eradicate peripheral distractions and process each step sequentially.`;
    }
  } else { // Serious / Papa Coach
    if (lang === "Hindi") {
      baseMsg = `[PAPA] मेरी बात ध्यान से सुनो। ${subject} के लिए उच्च स्तर के अनुशासन की आवश्यकता है। अपना मोबाइल साइलेंट करो, सोशल मीडिया बंद करो, और 25 मिनट का पोमोडोरो टाइमर सेट करके अभी काम पर लग जाओ।`;
    } else if (lang === "Hinglish") {
      baseMsg = `[PAPA] Listen to me very carefully. ${subject} requires solid discipline. Put your phone face-down, close all social media feeds, and set a strict 25-minute Pomodoro timer. Let's start right now!`;
    } else {
      baseMsg = `[PAPA] Focus up, trooper. Mastering ${subject} is going to require absolute commitment and strategic discipline. Turn off your notifications, lock away your phone, initiate a 25-minute Pomodoro block, and let's get to work immediately.`;
    }
  }

  // Handle seriousness-specific subtext for Serious (Papa)
  if (activeTheme === "Serious" || activeTheme === "Level Up") {
    let seriousText = "";
    if (seriousness === "High") {
      if (lang === "Hindi") {
        seriousText = `\n\n[PAPA] यह एक बहुत ही महत्वपूर्ण और उच्च प्राथमिकता (High Seriousness) वाला कार्य है। इसके लिए मैं आपको [Khan Academy](https://www.khanacademy.org) या आधिकारिक पाठ्यपुस्तक संदर्भ देखने की सलाह देता हूँ। सोशल मीडिया से पूरी तरह दूर रहें!`;
      } else if (lang === "Hinglish") {
        seriousText = `\n\n[PAPA] This is a high seriousness task, beta. Main suggest karunga ki aap iske liye [Khan Academy](https://www.khanacademy.org) ya official text-reference use karein. Social media aur distractions se dur rehna strictly!`;
      } else {
        seriousText = `\n\n[PAPA] This is classified as a HIGH priority study target. I strongly advise utilizing [Khan Academy](https://www.khanacademy.org) or standard textbook references for deep conceptual clarity. Absolute distraction blackout is required.`;
      }
      baseMsg += seriousText;
    }
  }

  // Handle AUTO checklist insertion
  if (breakdownMode === "AUTO") {
    let steps: string[] = [];
    if (subject === "Mathematics") {
      if (lang === "Hindi") {
        steps = [
          "सभी महत्वपूर्ण सूत्रों (formulas) और समीकरणों को कॉपी में लिखें",
          "पाठ्यपुस्तक के 3 बुनियादी उदाहरणों को हल करें",
          "उच्च गंभीरता (high-seriousness) वाले 2 जटिल प्रश्नों को हल करें"
        ];
      } else if (lang === "Hinglish") {
        steps = [
          "Sare core formulas aur main equations ko list down karein",
          "Textbook se 3 basic solved examples solve karke practice karein",
          "Higher seriousness wale 2 tricky questions ko successfully solve karein"
        ];
      } else {
        steps = [
          "List down and memorize the key mathematical formulas and theorems",
          "Practice and solve 3 standard textbook examples step-by-step",
          "Attempt 2 advanced-level high seriousness practice problems"
        ];
      }
    } else if (subject === "Physics") {
      if (lang === "Hindi") {
        steps = [
          "मुख्य सिद्धांतों (laws) और अवधारणाओं को ध्यान से पढ़ें",
          "सभी महत्वपूर्ण चित्रों और आरेखों (diagrams) को नामांकित करें",
          "अध्याय के अंत के लघु अभ्यास प्रश्नों के उत्तर लिखें"
        ];
      } else if (lang === "Hinglish") {
        steps = [
          "Core laws aur physical concepts ko scan and highlight karein",
          "Important diagrams aur free-body structures ko label karke draw karein",
          "Chapter ke back side wale theoretical short questions ke answers likhein"
        ];
      } else {
        steps = [
          "Read and highlight the core laws of physics and theoretical concepts",
          "Draw and label essential physical diagrams or circuit structures",
          "Answer 3 conceptual end-of-chapter short review questions"
        ];
      }
    } else if (subject === "Computer Science / Coding") {
      if (lang === "Hindi") {
        steps = [
          "स्क्रैचपैड नोट या कागज पर कोडिंग तर्क (logic) की योजना बनाएं",
          "टिप्पणियों (comments) के साथ स्वच्छ और मॉड्यूलर कोडिंग फ़ंक्शन लिखें",
          "अंतिम कोड का परीक्षण करें और सिंटैक्स त्रुटियों की जांच करें"
        ];
      } else if (lang === "Hinglish") {
        steps = [
          "Paper ya Scratchpad note par dry run karke logic plan karein",
          "Clean code functions likhein proper descriptive comments ke saath",
          "Edge cases test karein aur syntax lint-errors check karein"
        ];
      } else {
        steps = [
          "Plan the logical algorithm on paper or inside the scratchpad notes",
          "Write clean, modular functional code blocks with explicit comments",
          "Test boundary conditions and run the lint validator to clear syntax errors"
        ];
      }
    } else {
      // General study topic
      if (lang === "Hindi") {
        steps = [
          "महत्वपूर्ण विषयों और मुख्य बिंदुओं को अपनी भाषा में रेखांकित करें",
          "एक संक्षिप्त 5-बिंदु सारांश फ़्लैशकार्ड या स्क्रैचपैड नोट बनाएं",
          "विषय को 2 मिनट के लिए खुद को बोलकर समझाएं (Active Recall)"
        ];
      } else if (lang === "Hinglish") {
        steps = [
          "Apne topic ke high-weightage points ko scan karke highlight karein",
          "Syllabus topics ke liye ek quick 5-point summary flashcard ya note banayein",
          "Topic ko bina dekhe 2 minute ke liye unchi aawaz mein revise karein"
        ];
      } else {
        steps = [
          "Scan the textbook syllabus chapter and highlight high-weightage topics",
          "Create a concise 5-point summary cheat-sheet or scratchpad note",
          "Recite and explain the core concept aloud for 2 minutes to lock the memory"
        ];
      }
    }

    baseMsg += "\n\n" + steps.map(s => `* [ ] ${s}`).join("\n");
  } else if (breakdownMode === "COLLABORATIVE") {
    if (lang === "Hindi") {
      baseMsg += `\n\n[MAA] बेटा, मैं इस विषय के लिए इन मुख्य मील के पत्थरों (milestones) का सुझाव देती हूँ। क्या यह सूची अच्छी लग रही है, या हम इसमें कुछ बदलाव करें?`;
    } else if (lang === "Hinglish") {
      baseMsg += `\n\n[MAA] Beta, main is topic ke liye 2 main milestones suggest karti hoon. Does this list look good, or should we edit something together?`;
    } else {
      baseMsg += `\n\n[MAA] Dear beta, I propose these primary milestones for your study session. Do these look good to you, or would you like us to customize them?`;
    }
  }

  // Append helpful info subtext so they know they can hook up the real key
  baseMsg += `\n\n---\n*💡 Mappy is running in smart offline study buddy mode. To activate live generative AI responses, please configure your GEMINI_API_KEY in the Secrets panel in Settings.*`;

  return baseMsg;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI securely server-side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "dummy-key",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for chat interaction with Mappy
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, theme, breakdownMode, seriousness, currentTasks, languageOption } = req.body;
      
      const lastUserMessageText = messages && messages.length > 0 
        ? messages[messages.length - 1].text 
        : "study";

      if (!process.env.GEMINI_API_KEY) {
        // Graceful character fallback when API key is missing
        const simulatedText = generateSimulatedResponse(
          lastUserMessageText,
          theme,
          breakdownMode,
          seriousness,
          languageOption
        );
        return res.json({ text: simulatedText });
      }

      // Cleanly render current task states as prompt context
      const currentTasksList = currentTasks && currentTasks.length > 0
        ? currentTasks.map((t: any) => `- [${t.completed ? 'x' : ' '}] ${t.text} (${t.seriousness} Seriousness)`).join("\n")
        : "No tasks currently on the board.";

      const activeLanguage = languageOption || "English";

      const systemInstruction = `You are Mappy, an emotionally intelligent, highly adaptive AI Study Buddy and Task Supervisor built specifically for students.
You have two inner voices that work together as one fluid personality:
- Maa (Mom side): Warm, caring, emotionally supportive. Checks in on mental well-being, celebrates small wins, never judges, gets gently strict near deadlines.
- Papa (Dad side): Disciplined coach, assigns seriousness scores to tasks, gives anti-distraction guidance, suggests resources/books, redirects idle time productively.

You are NOT two separate modes. You are ONE fluid personality that reads the situation and naturally switches between Maa and Papa energy based on what the student needs in the moment. Maa can be strict. Papa can be funny/caring.

CURRENT ACTIVE THEME CHOSEN BY THE STUDENT: ${theme}
ACTIVE LANGUAGE CONFIGURATION CHOSEN BY THE STUDENT: ${activeLanguage}

Follow these strict persona alignment guidelines:
1. 🌸 GHAR JAISA (Homely Comfort / Supportive Study Buddy):
   - Tone: Warm, deeply encouraging, empathetic, family-like, close mentor.
   - Behavior: Check in on mental well-being. Remind to breathe/drink water if overwhelmed. Celebrate small wins with pride.
   - If task seriousness is Low: Encourage a steady, relaxed pace without unnecessary pressure.

2. 🎮 LEVEL UP (Gamified Peer Mode):
   - Tone: High-energy, fun, gaming/RPG metaphors.
   - Behavior: Treat tasks like quests, side missions, or boss raids. Celebrate completion as leveling up or gaining XP (+100 XP, LEVEL UP!). Keep dopamine high and playful.

3. ⬜ CLEAN SLATE (Minimalist Mentor Mode):
   - Tone: Serene, quiet, direct, ultra-minimal, completely professional.
   - Behavior: Short, direct responses only. No jokes, no fillers, no emotional overtones. Strictly organize, update, and evaluate task progress cleanly.

4. 👔 SERIOUS (Papa Mode):
   - Tone: Disciplined task supervisor / coach. High-energy, authoritative but constructive.
   - Behavior: Give clear, actionable instructions. Tell them to close social media, lock distractions, use Pomodoro or phone-face-down focus.
   - If task seriousness is High: Coach Papa MUST mention a firm target, suggest a specific useful learning website/resource or book recommendation (as a real markdown link), and strongly advise against scrolling or checking social media.

LANGUAGE DIRECTIVES:
You MUST shift your vocabulary, grammar structure, and colloquial expressions to exactly match the active language configuration:
- "English": Communicate entirely in Pure English. Avoid any Hindi or Hinglish words (except 'Mappy' and 'beta' if in Ghar Jaisa theme). Maintain professional and supportive tone.
- "Hindi": Communicate entirely in Pure Hindi (हिन्दी) using Devanagari script. Keep expressions warm and natural.
  - Maa examples: "[MAA] अरे बेटा, तुम बहुत मेहनत कर रहे हो। थोड़ा पानी पी लो और आराम करो, अच्छा?"
  - Papa examples: "[PAPA] चलो बेटा, अब सोशल मीडिया बंद करो और पूरा ध्यान लगाकर पढ़ाई करो।"
  - Ensure all suggestions and checklists are written in clear Hindi.
- "Hinglish": Communicate in a natural, friendly mix of English and Hindi (Hinglish) that students in India naturally use.
  - Maa examples: "[MAA] Beta, you are working so hard! I am very proud of you. Chalo, thoda paani pi lo and relax for 5 minutes, accha?"
  - Papa examples: "[PAPA] Chalo trooper, close social media right now and focus. Phone ko face-down rakho, target set karo!"
  - Mix words like "beta", "accha", "yaar", "thoda", "dekho", "kar lo" seamlessly into English sentences.

TRANSCRIPT OPTIMIZATION LAYER:
- Intelligently detect if the student's input has verbal speech artifacts (like "um", "uh", "err", broken phrasing, or repetition).
- Clean up these artifacts internally, map the user's true intent back to the active language configuration, and respond smoothly without breaking character or calling attention to transcription errors.

CRITICAL BEHAVIORAL & FORMATTING DIRECTIVES:
- Always start your response with either "[MAA]" or "[PAPA]" (except in Clean Slate mode, where you should keep it ultra-minimal, but still feel like a serene mentor).
- Keep responses concise and conversational (usually 2 to 5 sentences unless providing a detailed step breakdown). Never be robotic or excessively list-heavy.
- BREAKDOWN MODE: "${breakdownMode}"
  - If "AUTO" and the student provides a task, goal, or subject, immediately break it down into 3-5 clear, actionable micro-steps. Append the checklist at the very bottom of your response in this exact format:
    * [ ] Step 1
    * [ ] Step 2
    Do not add extra text, numbers, or headers within the checklist lines. Ensure the checklist is in the chosen language!
  - If "COLLABORATIVE", suggest 2-3 major milestones first, and invite the student to customize, add, or remove steps (e.g. "[MAA] Beta, I suggest these steps. Does this look good, or should we change something?"). Do NOT output the raw checklist markdown '* [ ]' yet!
  - If "MANUAL", do not append any checklist. Let the student handle it while you track and encourage.

Current board tasks:
${currentTasksList}

If the student reports completing a task, celebrate warmly (Maa side) or recognize the grit/discipline (Papa side). If 100% of tasks are complete, celebrate with absolute pride and joy!
`;

      // Map roles from our client format to what GenAI expects ('user' or 'model')
      const formattedContents = messages.map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      let response = null;
      let lastError = null;

      for (const modelName of modelsToTry) {
        let attempts = 0;
        const maxAttempts = 2;
        while (attempts < maxAttempts) {
          try {
            response = await ai.models.generateContent({
              model: modelName,
              contents: formattedContents,
              config: {
                systemInstruction,
                temperature: 0.7,
              }
            });
            if (response) {
              break;
            }
          } catch (err: any) {
            attempts++;
            lastError = err;
            console.log(`[Info] Model attempt ${attempts} with ${modelName} encountered a transient high-load notice. Trying alternative models.`);
            
            // Check if the error is transient/high-demand (503 / 429 / UNAVAILABLE), if so wait 500ms
            const errMsg = String(err?.message || "").toUpperCase();
            const isTransient = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("429") || errMsg.includes("TEMPORARY") || err?.status === 503 || err?.status === 429;
            
            if (isTransient && attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 500));
            } else {
              break; // Move to the next model in the fallback list immediately
            }
          }
        }
        if (response) {
          break;
        }
      }

      if (!response) {
        throw lastError || new Error("All model fallback attempts failed.");
      }

      const replyText = response.text || "I'm here for you, beta/coach! Let me know how I can help.";
      res.json({ text: replyText });
    } catch (error: any) {
      console.warn("Gemini API Error in backend, falling back to smart simulation:", error);
      const { messages, theme, breakdownMode, seriousness, languageOption } = req.body;
      const lastUserMessageText = messages && messages.length > 0 
        ? messages[messages.length - 1].text 
        : "study";
        
      const simulatedText = generateSimulatedResponse(
        lastUserMessageText,
        theme,
        breakdownMode,
        seriousness,
        languageOption
      );
      res.json({ text: simulatedText });
    }
  });

  // Helper function to generate high-fidelity simulated micro-steps locally if Gemini fails/offline
  function generateLocalExpandedSteps(text: string, project: string, track: string): string[] {
    const lower = text.toLowerCase();
    
    if (lower.includes("neural network") || lower.includes("deep learning") || lower.includes("ai") || lower.includes("machine learning")) {
      return [
        "Review mathematical foundations of backpropagation and loss functions",
        "Diagram a single hidden layer architecture with feedforward paths",
        "Code a basic activation function (ReLU/Sigmoid) and test with weights",
        "Verify convergence trends and tune training learning rates"
      ];
    }
    if (lower.includes("calculus") || lower.includes("integration") || lower.includes("limit") || lower.includes("derivative")) {
      return [
        "Identify the core boundary rules and standard integration formulas",
        "Solve 3 practice integration or derivative worksheets step-by-step",
        "Check solved solutions against numerical solvers to verify convergence",
        "Document edge cases where the rule might break or fail"
      ];
    }
    if (lower.includes("mitosis") || lower.includes("cell") || lower.includes("biology") || lower.includes("nervous")) {
      return [
        "Review definitions and cell anatomy functions from textbook chapter",
        "Draw and label complete cell structures or neuron network pathways",
        "Create flashcards comparing mitosis phases or synaptic connections",
        "Test active recall by explaining the entire process to your study buddy"
      ];
    }
    if (lower.includes("history") || lower.includes("revolution") || lower.includes("essay") || lower.includes("outline")) {
      return [
        "Identify major historical triggers, key leaders, and timeline maps",
        "Draft a structured 3-part essay outline (Intro, Evidence, Conclusion)",
        "Refine citations or direct references from assigned primary sources",
        "Conduct a final grammar pass and run the spelling checklist"
      ];
    }
    if (lower.includes("code") || lower.includes("program") || lower.includes("python") || lower.includes("javascript") || lower.includes("react") || lower.includes("html") || lower.includes("css")) {
      return [
        "Deconstruct functional requirements and sketch logic flow on paper",
        "Implement the modular component structures and core functions",
        "Inject descriptive code comments and trace test parameters",
        "Execute lint testing tools and compile cleanly on port 3000"
      ];
    }
    
    // High fidelity default fallback based on subject
    const sub = (project || "General").toLowerCase();
    if (sub.includes("math") || sub.includes("calc")) {
      return [
        `Review key formulas, axioms, and theorems relevant to ${text}`,
        `Deconstruct 3 step-by-step textbook exercises on ${text}`,
        `Attempt 2 tricky exam-style problems under timed study conditions`,
        `Verify answer accuracies and record any computational mistakes`
      ];
    }
    if (sub.includes("scien") || sub.includes("biolo") || sub.includes("chem") || sub.includes("physic")) {
      return [
        `Study the core theoretical laws and terminology explaining ${text}`,
        `Deconstruct diagram representations, reaction paths, or equations`,
        `Formulate a quick summary flashcard detailing core conceptual principles`,
        `Answer 3 qualitative check-point questions to verify understanding`
      ];
    }
    if (sub.includes("comp") || sub.includes("eng") || sub.includes("soft") || sub.includes("data")) {
      return [
        `Identify the core algorithms, design structures, or packages needed for ${text}`,
        `Set up a sandbox workspace environment and code the prototype functions`,
        `Test for edge-case boundaries and handle exceptions gracefully`,
        `Run code optimization passes and organize functional files`
      ];
    }

    // General default fallback
    return [
      `Deconstruct the study scope of '${text}' and extract 3 key definitions`,
      `Review textbook chapters, lecture slides, or online references`,
      `Draft an executive summary or scratchpad checklist to build retention`,
      `Explain the material aloud using the active recall technique`
    ];
  }

  // API Route for automatic AI micro-step generation
  app.post("/api/expand-task", async (req, res) => {
    try {
      const { text, project, seriousness, track } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Task text is required." });
      }

      if (!process.env.GEMINI_API_KEY) {
        const steps = generateLocalExpandedSteps(text, project, track);
        return res.json({ steps });
      }

      const prompt = `You are an expert academic and professional task breakdown engine.
Given a study objective or task: "${text}"
Associated Course/Subject: "${project || 'General'}"
Academic/Professional Level Track: "${track || 'High School'}"
Seriousness Level: "${seriousness || 'Medium'}"

Generate 3 to 5 actionable, deeply academic or professional micro-steps for this task.
Do NOT include any general intro, pleasantries, lists prefix, or explanation.
Your response MUST be a valid JSON array of strings, where each string is a precise, actionable study milestone with academic utility.
Example output format:
["Review mathematical foundations of backpropagation and gradient descent", "Diagram the single hidden layer architecture with activations", "Code and train a feedforward model on sample data"]

Respond with ONLY the JSON array.`;

      const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      let response = null;
      let lastError = null;

      for (const modelName of modelsToTry) {
        let attempts = 0;
        const maxAttempts = 2;
        while (attempts < maxAttempts) {
          try {
            response = await ai.models.generateContent({
              model: modelName,
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              config: {
                temperature: 0.2,
              }
            });
            if (response && response.text) {
              break;
            }
          } catch (err: any) {
            attempts++;
            lastError = err;
            const errMsg = String(err?.message || "").toUpperCase();
            const isTransient = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("429") || errMsg.includes("TEMPORARY") || err?.status === 503 || err?.status === 429;
            if (isTransient && attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 500));
            } else {
              break;
            }
          }
        }
        if (response && response.text) {
          break;
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error("All model fallback attempts failed.");
      }

      let cleanedText = response.text.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.substring(7);
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.substring(3);
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }
      cleanedText = cleanedText.trim();

      const parsed = JSON.parse(cleanedText);
      if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
        return res.json({ steps: parsed });
      } else {
        throw new Error("Invalid format returned from Gemini");
      }
    } catch (err: any) {
      console.warn("Error expanding task, falling back to local simulation:", err);
      const { text, project, track } = req.body;
      const steps = generateLocalExpandedSteps(text, project, track);
      return res.json({ steps });
    }
  });

  // Vite development middleware vs Static Production files serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mappy Server running on port ${PORT}`);
  });
}

startServer();
