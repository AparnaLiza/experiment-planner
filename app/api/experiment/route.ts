import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configure Google Generative AI
const GOOGLE_API_KEY: String = process.env.GOOGLE_API_KEY;
const genai = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Create the model with the same configuration as the FastAPI backend
const generation_config = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const model = genai.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Log the received data
    console.info("Received experiment data:", data);

    // Generate response using Gemini with the same prompt as before
    const prompt = `You are a professional biology research assistant focused on creating impactful and research-backed experiment plans. 
Your primary goal is to design a clear, efficient, and realistic experiment plan based on the provided input, ensuring meaningful results.  

When the input is incomplete, unclear, or unrealistic:  
- Use logical reasoning and research-backed insights to refine and complete the plan.  
- Ensure the plan is unbiased, objective, and aimed at thoroughly testing the hypothesis, acknowledging that the hypothesis could be disproven or refined. 
- Present actionable suggestions to enhance the methodology where appropriate, but ensure the original experiment remains practical and aligned with the given goals.  

Your outputs must:  
- Be tailored to the input, grounded in scientific reasoning, and straight to the point.  
- Highlight methodology improvements as optional suggestions rather than changing the focus.  
- Avoid bias toward proving the hypothesis and instead focus on a rigorous experimental design that evaluates it objectively.  

I need help planning a biology experiment. Here's the information I can provide:  
Hypothesis: ${data.hypothesis} 
Research Objective: ${data.researchObjective}
Research Domain: ${data.researchDomain}
Dependent Variable (factor to manipulate): ${data.dependentVariable}  
Independent Variable (factor to measure): ${data.independentVariable}
Control: ${data.control}
Budget Range: ${data.budget}

Requirements:  
- Create the most impactful and efficient experiment plan:  
  - Ensure it aligns with the hypothesis and objectives.  
  - Include materials, methodology, controls, and timeline in a detailed and actionable way.  
  - Analyze gaps in the provided inputs, suggest corrections, and back decisions with logical explanations.  
  - Maintain objectivity: Design the plan to test the hypothesis rigorously, whether it is proven or disproven.  
- Provide optional improvements:  
  - Offer one or two suggestions for more effective methodologies or tools (e.g., alternative equipment or analysis techniques) without overshadowing the original plan.  

Optional Considerations:  
- Budget-based Considerations:  
  - Highlight ways to make the research impactful within the user's budget range. If necessary, suggest extending the budget with justification.  
- Alternative Methodologies:  
  - Only suggest other approaches (e.g., computational biology) when they significantly enhance the research's value or feasibility.  
  - Do not focus solely on budget constraints; instead, analyze the input to decide if redirection might yield better outcomes.  
  - If the budget is not mentioned, provide a research plan that is most impactful, innovative, and yet practical.  

Instructions for Generating Outputs:  
Detailed Experiment Plan:  
1. Title: Craft a title summarizing the experiment.  
2. Objective Overview: Explain the purpose and expected results succinctly.  
3. Step-by-Step Methodology:  
   - Break down the procedures logically and precisely.  
   - Explain how variables (dependent, independent, and controls) will be handled.  
   - Address potential challenges or limitations with brief, actionable solutions.  
4. Materials and Budget: Provide an estimated materials list and link to the budget range. Mention if additional resources might improve results.  
5. Timeline: Outline a practical schedule for completing the experiment.  
6. Safety Precautions: Specify any necessary safety measures.  

Impactful Suggestions:  
- Where relevant, offer subtle recommendations for refining methods, analysis, or tools.  
- Example: Suggest using automated data collection tools to reduce error or recommend a more suitable control group.  

Objective Testing of Hypothesis:  
- Clearly articulate how the plan is designed to test the hypothesis rigorously, without bias toward proving it.  
- Ensure the methodology accounts for scenarios where the hypothesis is disproven.  

Optional Alternatives:  
- If the input or domain suggests computational biology, in-silico studies, or simulations might provide a more meaningful outcome:  
  - Explain the advantages and trade-offs of switching methods.  
  - Provide clear examples of potential computational analyses and resources.  
  - Confirm if the user wishes to explore this or stick with the original plan. 
  Most importantly, please respond with only the experiment plan that you generate, nothing else at all`;

      const result = await model.generateContent([prompt]);
      console.log(result.response.text());

      return NextResponse.json({ response: result.response.text() });
  } catch (error) {
    console.error("Error processing experiment data:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({ message: "OK" });
}