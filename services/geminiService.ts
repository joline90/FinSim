import { GoogleGenAI } from "@google/genai";
import { SimulationResult, Account, RecurringItem } from "../types";

// Safety check for API key
const getApiKey = () => {
    // In a real app, you might prompt the user, but per instructions we assume process.env.API_KEY
    return process.env.API_KEY;
};

export const analyzeFinancialPlan = async (
  accounts: Account[],
  items: RecurringItem[],
  simulation: SimulationResult
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return "Error: API Key not found. Please ensure process.env.API_KEY is set.";
  }

  const ai = new GoogleGenAI({ apiKey });

  // Simplify data for the prompt to save tokens
  const accountSummary = accounts.map(a => `${a.name} (Start: $${a.initialBalance})`).join(", ");
  const recurringSummary = items.map(i => 
    `${i.name}: ${i.amount} (${i.type}, ${i.frequency})`
  ).join("; ");
  
  const finalNetWorth = simulation.finalNetWorth;
  const growth = finalNetWorth - (simulation.dailyData[0]?.total || 0);
  
  const prompt = `
    You are a professional personal finance advisor. Please analyze the following financial simulation data and provide advice in English:

    **User Profile:**
    - Accounts: ${accountSummary}
    - Recurring Items: ${recurringSummary}
    
    **Simulation Results (Next 24 Months):**
    - Initial Net Worth: ${simulation.dailyData[0]?.total || 0}
    - Final Net Worth: ${finalNetWorth}
    - Change: ${growth >= 0 ? '+' : ''}${growth}
    - Lowest Net Worth Point: ${simulation.minNetWorth}
    
    **Task:**
    1. Evaluate the health of this financial plan (e.g., cash flow health, savings rate).
    2. Identify potential risks (e.g., low balance at certain times, over-dependence on single income).
    3. Provide 3 specific, actionable suggestions for improvement.

    Please keep the tone professional, encouraging, and concise. Use Markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Unable to generate analysis.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred during analysis. Please try again later.";
  }
};