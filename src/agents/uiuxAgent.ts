// ─────────────────────────────────────────────────────────────────────────────
// UI/UX DESIGNER AGENT
// Creates the complete design system for the project.
// Outputs: Wireframe structure, design system (colors, fonts, spacing),
//          component list, UX copy guidelines, user flow.
// ─────────────────────────────────────────────────────────────────────────────
import { runPromptAsJson, buildSystemContext } from './aiBase';
import { updateProjectState } from '../services/orchestrator';
import { supabase } from '../db/supabaseClient';
import { NormalizedRequest } from '../types/agent.types';

export interface DesignSystem {
  industryMapping: string; // Used by stylingEngine to match THEME_MAP keys
  detectedTone: string;
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSizes: Record<string, string>;
    lineHeights: Record<string, string>;
  };
  spacing: Record<string, string>;
  borderRadius: string;
  shadows: Record<string, string>;
  designStyle: string;
}

export interface WireframeSection {
  sectionName: string;
  purpose: string;
  components: string[];
  layout: string;
  uxNotes: string;
}

export interface UIUXOutput {
  designPhilosophy: string;
  designStyle: string;
  designSystem: DesignSystem;
  wireframe: {
    pages: Array<{
      pageName: string;
      sections: WireframeSection[];
    }>;
  };
  userFlow: string[];
  accessibilityConsiderations: string[];
  mobileFirstNotes: string;
  uxCopyGuidelines: {
    tone: string;
    voiceCharacteristics: string[];
    callToActionExamples: string[];
  };
}

export async function runUiuxAgent(projectId: string): Promise<UIUXOutput> {
  console.log(`[UIUXAgent] Starting for project: ${projectId}`);

  const { data: stateRow } = await supabase
    .from('project_state')
    .select('state_data')
    .eq('project_id', projectId)
    .single();

  const state = stateRow?.state_data as Record<string, unknown>;
  const req = state?.normalizedRequest as NormalizedRequest;
  const businessAnalysis = state?.businessAnalysis as Record<string, unknown> | undefined;

  const context = buildSystemContext(
    'UI/UX Designer Agent — Senior Product Designer with expertise in modern web and mobile interfaces',
    {
      projectName: req.projectName,
      projectType: req.projectType,
      requirements: req.requirements,
      featuresRequested: req.featuresRequested,
      targetAudience: businessAnalysis?.targetAudience || 'General users',
      featurePrioritization: businessAnalysis?.featurePrioritization || {},
    }
  );

  const prompt = `
${context}

TASK: Create a complete UI/UX design specification for this ${req.projectType} project.

Return a JSON object matching this EXACT schema:
{
  "designPhilosophy": "The core design principle guiding this project (1-2 sentences)",
  "designStyle": "e.g. Modern Minimalist, Glassmorphism, Material Design, Neumorphism, etc.",
  "designSystem": {
    "industryMapping": "Best matching industry from: Healthcare/Dentistry, Food/Bakery, Tech/Startup, Law/Legal",
    "detectedTone": "e.g. Warm, Professional, Clean",
    "typography": {
      "headingFont": "Font Name from Google Fonts",
      "bodyFont": "Font Name from Google Fonts",
      "fontSizes": { "xs": "12px", "sm": "14px", "base": "16px", "lg": "18px", "xl": "24px", "2xl": "32px", "3xl": "48px" },
      "lineHeights": { "tight": "1.2", "normal": "1.5", "relaxed": "1.75" }
    },
    "spacing": { "xs": "4px", "sm": "8px", "md": "16px", "lg": "24px", "xl": "48px", "2xl": "96px" },
    "borderRadius": "8px",
    "shadows": { "sm": "0 1px 3px rgba(0,0,0,0.12)", "md": "0 4px 12px rgba(0,0,0,0.15)", "lg": "0 16px 40px rgba(0,0,0,0.2)" },
    "designStyle": "same as above"
  },
  "wireframe": {
    "pages": [
      {
        "pageName": "Page name",
        "sections": [
          {
            "sectionName": "Section name",
            "purpose": "What this section achieves",
            "components": ["component 1", "component 2"],
            "layout": "Layout description (e.g. 2-column grid, full-width hero)",
            "uxNotes": "Important UX considerations"
          }
        ]
      }
    ]
  },
  "userFlow": ["Step 1: User lands on home", "Step 2: ...", "Step 3: ..."],
  "accessibilityConsiderations": ["WCAG AA contrast ratios", "Keyboard navigation", "Screen reader labels"],
  "mobileFirstNotes": "How the design adapts for mobile screens",
  "uxCopyGuidelines": {
    "tone": "e.g. Professional yet approachable",
    "voiceCharacteristics": ["Clear", "Concise", "Action-oriented"],
    "callToActionExamples": ["Get Started", "Book a Demo", "Try for Free"]
  }
}

Make the color palette vibrant, modern, and appropriate for: ${req.projectType}.
Return ONLY the JSON object, no other text.
  `.trim();

  const output = await runPromptAsJson<UIUXOutput>(projectId, prompt);

  await updateProjectState(projectId, { uiuxDesign: output });

  await supabase.from('ai_logs').insert({
    project_id: projectId,
    agent_type: 'UIUX',
    action: 'design_system_complete',
    payload: output as unknown as Record<string, unknown>,
    status: 'Success',
  });

  console.log(`[UIUXAgent] Design system complete for project: ${projectId}`);
  return output;
}
