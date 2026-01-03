
export type Role = 'Optimist' | 'Skeptic' | 'Analyst' | 'Realist' | 'Ethicist';
export type DecisionDepth = 'Quick' | 'Deep';
export type ExplanationLevel = 'Simple' | 'Detailed' | 'Technical';
export type Verdict = 'Proceed' | 'Do Not Proceed' | 'Proceed With Conditions';
export type AssumptionStrength = 'Strong' | 'Weak' | 'Unknown';
export type Language = 'English' | 'Hindi' | 'Marathi' | 'Bengali' | 'Telugu';

export interface DecisionInput {
  id?: string;
  timestamp?: number;
  question: string;
  context: string;
  enabledRoles: Role[];
  depth: DecisionDepth;
  level: ExplanationLevel;
  constraints: string;
  language: Language;
  media?: {
    data: string;
    mimeType: string;
  }[];
}

export interface Assumption {
  text: string;
  strength: AssumptionStrength;
}

export interface RoleInsight {
  role: Role;
  insights: string[];
}

export interface ScenarioOutcomes {
  bestCase: string;
  worstCase: string;
  mostLikely: string;
}

export interface MissingInfo {
  info: string;
  impact: string;
}

export interface DecisionResult {
  decisionSummary: string;
  biasAndAssumptions: {
    detectedBias: string;
    assumptions: Assumption[];
  };
  roleBasedInsights: RoleInsight[];
  riskExposure: {
    level: 'Low' | 'Medium' | 'High';
    justification: string;
  };
  scenarioOutcomes: ScenarioOutcomes;
  finalVerdict: Verdict;
  conditions?: string[];
  confidenceScore: {
    percentage: number;
    explanation: string;
  };
  whatsMissing: MissingInfo[];
  overconfidenceCheck?: string;
  groundingUrls?: { title: string; uri: string }[];
  visualOutcomeUrl?: string;
  videoOutcomeUrl?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface HistoryItem {
  input: DecisionInput;
  result: DecisionResult;
}
