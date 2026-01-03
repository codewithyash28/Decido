DECIDO is an AI-powered decision-making assistant that evaluates complex problems through multi-agent structured reasoning.
It doesn’t give advice, motivation, or opinions — it analyzes, debates, and outputs a precise verdict.

🔹 Features

Multi-Agent Reasoning

Optimist, Skeptic, Analyst, Realist, Ethicist (optional)

Each agent analyzes independently and contributes to the decision

Structured Verdict

Final decision: Proceed / Do Not Proceed / Proceed With Conditions

Includes confidence score, risk exposure, and scenario simulations

Decision Record

Save and load past decision analyses

Revisit or review prior decisions anytime

Input Validation

Robust checks with clear error messages

Prevents invalid or incomplete submissions

Optional Visual Summary

AI-generated symbolic image representing the core decision

Gives visual clarity for each outcome

Dynamic UI Elements

Tooltips explaining roles and depth options

Loading animation cycling through agents in active reasoning

🔹 How It Works

User submits a decision question, context, constraints, and selects enabled agents.

DECIDO performs structured multi-agent reasoning:

Bias detection

Assumption extraction

Role-based analysis

Risk exposure calculation

Scenario simulation

The Arbiter consolidates insights into a final verdict.

Users can view results, download images, or save the analysis for future reference.

🔹 Demo Example

Decision Question:
Should I pivot my SaaS product from B2C to B2B?

Enabled Agents:
Optimist, Skeptic, Analyst, Realist

Output:

Optimist: Growth potential is huge

Skeptic: High risk of losing current users

Analyst: Pivot feasible in 3 months with moderate cost

Realist: Needs resource allocation adjustments

Verdict: Proceed With Conditions

Confidence: 78%

Risk: Medium

Scenario Outcomes: Best / Worst / Most Likely

🔹 Tech Stack

Frontend: React.js, Tailwind CSS

Backend: Node.js / Express.js

AI Engine: Gemini 3 API (OpenAI compatible)

Storage: Local Storage (for saved decisions)

Image Generation: AI Image API for symbolic outcome visualization

🔹 Installation & Setup

Clone the repository:

git clone https://github.com/codewithyash28/DECIDO.git


Install dependencies:

cd DECIDO
npm install


Setup Gemini 3 API key:

AIzaSyApICkYqDXIj6tGXAabF0knMmgnJ-W2l-U


Run the app:

npm start

🔹 How to Use

Enter your decision question and context.

Set constraints (time, money, risk).

Select reasoning agents.

Choose reasoning depth and output detail.

Click “Execute Evaluation”.

Review the structured verdict, risk, scenarios, and optional visual summary.

Save or load past analyses anytime.
