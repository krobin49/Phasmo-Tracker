export type EvidenceState = "unknown" | "confirmed" | "ruled_out";

export type Evidence = {
  id: number;
  name: string;
};

export type Ghost = {
  id: number;
  name: string;
};

export type GhostEvidenceRule = {
  ghost_id: number;
  evidence_id: number;
  rule_type: "normal" | "extra";
  forced: boolean;
  is_primary: boolean;
  forced_visible_min_evidence_count?: number;
};

export type GameMode = {
  mode_id: number;
  mode_name: string;
  evidence_given: number;
};

export type Behavior = {
  id: number;
  name: string;
  description?: string;
};

export type GhostBehaviorRule = {
  ghost_id: number;
  behavior_id: number;
  effect: "rules_out" | "suggests" | "supports";
  confidence: "high" | "medium" | "low";
  notes?: string;
};

export type SpeedType = {
  id: number;
  name: string;
  description?: string;
};

export type GhostSpeedRule = {
  ghost_id: number;
  speed_id: number;
  effect: "rules_out" | "suggests" | "supports";
  confidence: "high" | "medium" | "low";
  notes?: string;
};

export type HuntType = {
  id: number;
  name: string;
  description?: string;
};

export type GhostHuntRule = {
  ghost_id: number;
  hunt_id: number;
  effect: "rules_out" | "suggests" | "supports";
  confidence: "high" | "medium" | "low";
  notes?: string;
};