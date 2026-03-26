"use client";

import { useEffect, useMemo, useState } from "react";
import { evidence } from "../data/evidence";
import { ghosts } from "../data/ghosts";
import { ghostEvidenceRules } from "../data/ghostEvidenceRules";
import { gameModes } from "../data/gameModes";
import { behaviors } from "../data/behaviors";
import { ghostBehaviorRules } from "../data/ghostBehaviorRules";
import { speedTypes } from "../data/speedTypes";
import { ghostSpeedRules } from "../data/ghostSpeedRules";
import { huntTypes } from "../data/huntTypes";
import { ghostHuntRules } from "../data/ghostHuntRules";
import { evaluateGhosts } from "../lib/evaluateGhosts";
import { scoreGhostBehaviors } from "../lib/behaviorScoring";
import { scoreGhostSpeed } from "../lib/speedScoring";
import { scoreGhostHunt } from "../lib/huntScoring";
import { supabase } from "../lib/supabase";
import type { EvidenceState } from "../types";

type TabKey = "evidence" | "behaviors" | "speed" | "hunt";

const ROOM_ID = "test-room";

function getEvidenceButtonStyle(state: EvidenceState): React.CSSProperties {
  if (state === "confirmed") {
    return {
      background: "#dcfce7",
      border: "1px solid #16a34a",
      color: "#166534",
    };
  }

  if (state === "ruled_out") {
    return {
      background: "#fee2e2",
      border: "1px solid #dc2626",
      color: "#991b1b",
    };
  }

  return {
    background: "#f8fafc",
    border: "1px solid #cbd5e1",
    color: "#0f172a",
  };
}

function getTabButtonStyle(isActive: boolean): React.CSSProperties {
  if (isActive) {
    return {
      background: "#0f172a",
      color: "white",
      border: "1px solid #0f172a",
    };
  }

  return {
    background: "white",
    color: "#334155",
    border: "1px solid #cbd5e1",
  };
}

function getPillStyle(active: boolean): React.CSSProperties {
  return {
    padding: "8px 12px",
    borderRadius: 999,
    border: active ? "1px solid #0f172a" : "1px solid #cbd5e1",
    background: active ? "#0f172a" : "white",
    color: active ? "white" : "#334155",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  };
}

export default function HomePage() {
  const [selectedModeId, setSelectedModeId] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>("evidence");
  const [showMostLikely, setShowMostLikely] = useState(true);
  const [isRoomLoaded, setIsRoomLoaded] = useState(false);

  const [evidenceStates, setEvidenceStates] = useState<Record<number, EvidenceState>>(
    Object.fromEntries(evidence.map((e) => [e.id, "unknown"])) as Record<number, EvidenceState>
  );

  const [selectedBehaviors, setSelectedBehaviors] = useState<number[]>([]);
  const [selectedSpeedId, setSelectedSpeedId] = useState<number | null>(null);
  const [selectedHuntId, setSelectedHuntId] = useState<number | null>(null);

  const selectedMode = gameModes.find((m) => m.mode_id === selectedModeId)!;

  async function saveRoomState(next: {
    mode_id?: number;
    evidence_states?: Record<number, EvidenceState>;
    selected_behaviors?: number[];
    selected_speed_id?: number | null;
    selected_hunt_id?: number | null;
  }) {
    const { error } = await supabase
      .from("room_state")
      .update({
        ...next,
        updated_at: new Date().toISOString(),
      })
      .eq("room_id", ROOM_ID);

    if (error) {
      console.error("Failed to save room state:", error);
    }
  }

  useEffect(() => {
    async function loadRoom() {
      const { data, error } = await supabase
        .from("room_state")
        .select("*")
        .eq("room_id", ROOM_ID)
        .maybeSingle();

      if (error) {
        console.error("Failed to load room:", error);
        setIsRoomLoaded(true);
        return;
      }

      if (!data) {
        const initialEvidence = Object.fromEntries(
          evidence.map((e) => [e.id, "unknown"])
        ) as Record<number, EvidenceState>;

        const { error: insertError } = await supabase.from("room_state").insert({
          room_id: ROOM_ID,
          mode_id: 1,
          evidence_states: initialEvidence,
          selected_behaviors: [],
          selected_speed_id: null,
          selected_hunt_id: null,
        });

        if (insertError) {
          console.error("Failed to create room:", insertError);
        }

        setIsRoomLoaded(true);
        return;
      }

      setSelectedModeId(data.mode_id ?? 1);
      setEvidenceStates(data.evidence_states ?? {});
      setSelectedBehaviors(data.selected_behaviors ?? []);
      setSelectedSpeedId(data.selected_speed_id ?? null);
      setSelectedHuntId(data.selected_hunt_id ?? null);
      setIsRoomLoaded(true);
    }

    loadRoom();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("room-state-live")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "room_state",
          filter: `room_id=eq.${ROOM_ID}`,
        },
        (payload) => {
          const row = payload.new as {
            mode_id: number;
            evidence_states: Record<number, EvidenceState>;
            selected_behaviors: number[];
            selected_speed_id: number | null;
            selected_hunt_id: number | null;
          };

          setSelectedModeId(row.mode_id ?? 1);
          setEvidenceStates(row.evidence_states ?? {});
          setSelectedBehaviors(row.selected_behaviors ?? []);
          setSelectedSpeedId(row.selected_speed_id ?? null);
          setSelectedHuntId(row.selected_hunt_id ?? null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function cycleEvidenceState(id: number) {
    setEvidenceStates((prev) => {
      const next =
        prev[id] === "unknown"
          ? "confirmed"
          : prev[id] === "confirmed"
            ? "ruled_out"
            : "unknown";

      const updated = { ...prev, [id]: next };
      void saveRoomState({ evidence_states: updated });
      return updated;
    });
  }

  function toggleBehavior(behaviorId: number) {
    setSelectedBehaviors((prev) => {
      const updated = prev.includes(behaviorId)
        ? prev.filter((item) => item !== behaviorId)
        : [...prev, behaviorId];

      void saveRoomState({ selected_behaviors: updated });
      return updated;
    });
  }

  function toggleSpeed(speedId: number) {
    const next = speedId === selectedSpeedId ? null : speedId;
    setSelectedSpeedId(next);
    void saveRoomState({ selected_speed_id: next });
  }

  function toggleHunt(huntId: number) {
    const next = huntId === selectedHuntId ? null : huntId;
    setSelectedHuntId(next);
    void saveRoomState({ selected_hunt_id: next });
  }

  function resetRound() {
    const resetEvidence = Object.fromEntries(
      evidence.map((e) => [e.id, "unknown"])
    ) as Record<number, EvidenceState>;

    setEvidenceStates(resetEvidence);
    setSelectedBehaviors([]);
    setSelectedSpeedId(null);
    setSelectedHuntId(null);
    setActiveTab("evidence");

    void saveRoomState({
      evidence_states: resetEvidence,
      selected_behaviors: [],
      selected_speed_id: null,
      selected_hunt_id: null,
    });
  }

  const evidenceResults = useMemo(() => {
    return evaluateGhosts({
      ghosts,
      rules: ghostEvidenceRules,
      evidence,
      evidenceStates,
      evidenceGiven: selectedMode.evidence_given,
    });
  }, [evidenceStates, selectedMode]);

  const behaviorScores = useMemo(() => {
    return scoreGhostBehaviors({
      ghosts,
      behaviors,
      rules: ghostBehaviorRules,
      selectedBehaviorIds: selectedBehaviors,
    });
  }, [selectedBehaviors]);

  const speedScores = useMemo(() => {
    return scoreGhostSpeed({
      ghosts,
      speedTypes,
      rules: ghostSpeedRules,
      selectedSpeedId,
    });
  }, [selectedSpeedId]);

  const huntScores = useMemo(() => {
    return scoreGhostHunt({
      ghosts,
      huntTypes,
      rules: ghostHuntRules,
      selectedHuntId,
    });
  }, [selectedHuntId]);

  const enrichedResults = useMemo(() => {
    return evidenceResults.map((result) => {
      const behaviorScore = behaviorScores.find((b) => b.ghost_id === result.ghost.id);
      const speedScore = speedScores.find((s) => s.ghost_id === result.ghost.id);
      const huntScore = huntScores.find((h) => h.ghost_id === result.ghost.id);

      return {
        ...result,
        behaviorScore: behaviorScore?.score ?? 0,
        behaviorMatches: behaviorScore?.matches ?? [],
        behaviorRuleOutReasons: behaviorScore?.ruleOutReasons ?? [],
        speedScore: speedScore?.score ?? 0,
        speedMatches: speedScore?.matches ?? [],
        speedRuleOutReasons: speedScore?.ruleOutReasons ?? [],
        huntScore: huntScore?.score ?? 0,
        huntMatches: huntScore?.matches ?? [],
        huntRuleOutReasons: huntScore?.ruleOutReasons ?? [],
        totalScore:
          (behaviorScore?.score ?? 0) +
          (speedScore?.score ?? 0) +
          (huntScore?.score ?? 0),
      };
    });
  }, [evidenceResults, behaviorScores, speedScores, huntScores]);

  const possibleGhosts = enrichedResults
    .filter(
      (r) =>
        r.possible &&
        r.behaviorRuleOutReasons.length === 0 &&
        r.speedRuleOutReasons.length === 0 &&
        r.huntRuleOutReasons.length === 0
    )
    .sort((a, b) => b.totalScore - a.totalScore);

  const ruledOutGhosts = enrichedResults.filter(
    (r) =>
      !r.possible ||
      r.behaviorRuleOutReasons.length > 0 ||
      r.speedRuleOutReasons.length > 0 ||
      r.huntRuleOutReasons.length > 0
  );

  const topGhosts = possibleGhosts.slice(0, 3);

  if (!isRoomLoaded) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f1f5f9",
          padding: "24px",
          display: "grid",
          placeItems: "center",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 18,
            padding: 24,
            color: "#0f172a",
          }}
        >
          Loading room...
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "24px",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gap: 24,
        }}
      >
        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 34,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                Phasmo Tracker
              </h1>
              <p
                style={{
                  marginTop: 8,
                  marginBottom: 0,
                  color: "#475569",
                  fontSize: 15,
                }}
              >
                Live room: <strong>{ROOM_ID}</strong>
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => setShowMostLikely((prev) => !prev)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "white",
                  color: "#0f172a",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                {showMostLikely ? "Hide Most Likely" : "Show Most Likely"}
              </button>

              <button
                onClick={resetRound}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "white",
                  color: "#0f172a",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Reset Round
              </button>
            </div>
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(320px, 420px) 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <section
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: 18,
              padding: 20,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
              display: "grid",
              gap: 18,
            }}
          >
            <div>
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 16,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Round Setup
              </h2>

              <label
                htmlFor="mode-select"
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                Game Mode
              </label>

              <select
                id="mode-select"
                value={selectedModeId}
                onChange={async (e) => {
                  const newModeId = Number(e.target.value);
                  setSelectedModeId(newModeId);
                  await saveRoomState({ mode_id: newModeId });
                }}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "white",
                  color: "#0f172a",
                  fontSize: 14,
                }}
              >
                {gameModes.map((mode) => (
                  <option key={mode.mode_id} value={mode.mode_id}>
                    {mode.mode_name} ({mode.evidence_given} evidence)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 8,
                }}
              >
                <button
                  onClick={() => setActiveTab("evidence")}
                  style={{
                    ...getTabButtonStyle(activeTab === "evidence"),
                    padding: "10px 12px",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Evidence
                </button>
                <button
                  onClick={() => setActiveTab("behaviors")}
                  style={{
                    ...getTabButtonStyle(activeTab === "behaviors"),
                    padding: "10px 12px",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Behaviors
                </button>
                <button
                  onClick={() => setActiveTab("speed")}
                  style={{
                    ...getTabButtonStyle(activeTab === "speed"),
                    padding: "10px 12px",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Speed
                </button>
                <button
                  onClick={() => setActiveTab("hunt")}
                  style={{
                    ...getTabButtonStyle(activeTab === "hunt"),
                    padding: "10px 12px",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Hunt
                </button>
              </div>
            </div>

            {activeTab === "evidence" && (
              <div>
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: 12,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Evidence
                </h3>

                <p
                  style={{
                    marginTop: 0,
                    marginBottom: 16,
                    fontSize: 13,
                    color: "#64748b",
                  }}
                >
                  Click to cycle: unknown → confirmed → ruled out
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 10,
                  }}
                >
                  {evidence.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => cycleEvidenceState(item.id)}
                      style={{
                        ...getEvidenceButtonStyle(evidenceStates[item.id]),
                        padding: "12px 14px",
                        borderRadius: 12,
                        cursor: "pointer",
                        textAlign: "left",
                        minHeight: 78,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          marginBottom: 4,
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          textTransform: "capitalize",
                          opacity: 0.9,
                        }}
                      >
                        {evidenceStates[item.id]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "behaviors" && (
              <div>
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: 12,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Behaviors
                </h3>

                <p
                  style={{
                    marginTop: 0,
                    marginBottom: 16,
                    fontSize: 13,
                    color: "#64748b",
                  }}
                >
                  Select behaviors you observed. These mostly rank ghosts unless a
                  specific behavior rules one out.
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {behaviors.map((behavior) => {
                    const active = selectedBehaviors.includes(behavior.id);

                    return (
                      <button
                        key={behavior.id}
                        onClick={() => toggleBehavior(behavior.id)}
                        style={getPillStyle(active)}
                        title={behavior.description ?? behavior.name}
                      >
                        {behavior.name}
                      </button>
                    );
                  })}
                </div>

                {selectedBehaviors.length > 0 && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: 12,
                      borderRadius: 12,
                      background: "#f8fafc",
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#0f172a",
                        marginBottom: 8,
                      }}
                    >
                      Selected
                    </div>

                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: 18,
                        color: "#334155",
                        fontSize: 14,
                      }}
                    >
                      {selectedBehaviors.map((behaviorId) => {
                        const behavior = behaviors.find((b) => b.id === behaviorId);
                        return <li key={behaviorId}>{behavior?.name ?? `Behavior ${behaviorId}`}</li>;
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "speed" && (
              <div>
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: 12,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Ghost Speed
                </h3>

                <p
                  style={{
                    marginTop: 0,
                    marginBottom: 16,
                    fontSize: 13,
                    color: "#64748b",
                  }}
                >
                  Track what the ghost felt like during movement or chase.
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {speedTypes.map((speed) => {
                    const active = selectedSpeedId === speed.id;

                    return (
                      <button
                        key={speed.id}
                        onClick={() => toggleSpeed(speed.id)}
                        style={getPillStyle(active)}
                        title={speed.description ?? speed.name}
                      >
                        {speed.name}
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    borderRadius: 12,
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    color: "#334155",
                    fontSize: 14,
                  }}
                >
                  Current speed note:{" "}
                  <strong>
                    {selectedSpeedId
                      ? speedTypes.find((s) => s.id === selectedSpeedId)?.name ?? "Unknown"
                      : "None selected"}
                  </strong>
                </div>
              </div>
            )}

            {activeTab === "hunt" && (
              <div>
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: 12,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Hunt / Sanity
                </h3>

                <p
                  style={{
                    marginTop: 0,
                    marginBottom: 16,
                    fontSize: 13,
                    color: "#64748b",
                  }}
                >
                  Track when the ghost seemed able to hunt.
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {huntTypes.map((hunt) => {
                    const active = selectedHuntId === hunt.id;

                    return (
                      <button
                        key={hunt.id}
                        onClick={() => toggleHunt(hunt.id)}
                        style={getPillStyle(active)}
                        title={hunt.description ?? hunt.name}
                      >
                        {hunt.name}
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    borderRadius: 12,
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    color: "#334155",
                    fontSize: 14,
                  }}
                >
                  Current hunt clue:{" "}
                  <strong>
                    {selectedHuntId
                      ? huntTypes.find((h) => h.id === selectedHuntId)?.name ?? "Unknown"
                      : "None selected"}
                  </strong>
                </div>
              </div>
            )}
          </section>

          <section
            style={{
              display: "grid",
              gap: 24,
            }}
          >
            {showMostLikely && (
              <div
                style={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: 18,
                  padding: 20,
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    marginBottom: 16,
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Most Likely
                </h2>

                {topGhosts.length === 0 ? (
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: "#fff7ed",
                      border: "1px solid #fdba74",
                      color: "#9a3412",
                      fontWeight: 600,
                    }}
                  >
                    No likely ghosts yet.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {topGhosts.map((result) => (
                      <div
                        key={result.ghost.id}
                        style={{
                          border: "2px solid #22c55e",
                          background: "#ecfdf5",
                          borderRadius: 14,
                          padding: 16,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 18,
                            color: "#166534",
                          }}
                        >
                          {result.ghost.name}
                        </div>

                        <div
                          style={{
                            marginTop: 6,
                            fontSize: 13,
                            color: "#166534",
                            fontWeight: 700,
                          }}
                        >
                          Total score: {result.totalScore}
                        </div>

                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                            color: "#166534",
                          }}
                        >
                          Behavior: {result.behaviorScore} | Speed: {result.speedScore} | Hunt:{" "}
                          {result.huntScore}
                        </div>

                        {result.behaviorMatches.length > 0 && (
                          <ul
                            style={{
                              marginTop: 8,
                              marginBottom: 0,
                              paddingLeft: 18,
                              fontSize: 13,
                              color: "#166534",
                            }}
                          >
                            {result.behaviorMatches.map((match: string, i: number) => (
                              <li key={`behavior-${i}`}>{match}</li>
                            ))}
                          </ul>
                        )}

                        {result.speedMatches.length > 0 && (
                          <ul
                            style={{
                              marginTop: 8,
                              marginBottom: 0,
                              paddingLeft: 18,
                              fontSize: 13,
                              color: "#166534",
                            }}
                          >
                            {result.speedMatches.map((match: string, i: number) => (
                              <li key={`speed-${i}`}>{match}</li>
                            ))}
                          </ul>
                        )}

                        {result.huntMatches.length > 0 && (
                          <ul
                            style={{
                              marginTop: 8,
                              marginBottom: 0,
                              paddingLeft: 18,
                              fontSize: 13,
                              color: "#166534",
                            }}
                          >
                            {result.huntMatches.map((match: string, i: number) => (
                              <li key={`hunt-${i}`}>{match}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 18,
                padding: 20,
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Possible Ghosts
                </h2>

                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "#e2e8f0",
                    color: "#334155",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {possibleGhosts.length} remaining
                </div>
              </div>

              {possibleGhosts.length === 0 ? (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: "#fff7ed",
                    border: "1px solid #fdba74",
                    color: "#9a3412",
                    fontWeight: 600,
                  }}
                >
                  No ghosts match the current evidence.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 12,
                  }}
                >
                  {possibleGhosts.map((result) => (
                    <div
                      key={result.ghost.id}
                      style={{
                        border: "1px solid #bbf7d0",
                        background: "#f0fdf4",
                        borderRadius: 14,
                        padding: 14,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 800,
                          color: "#166534",
                          fontSize: 16,
                        }}
                      >
                        {result.ghost.name}
                      </div>

                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 13,
                          color: "#15803d",
                        }}
                      >
                        Still possible
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 13,
                          color: "#166534",
                          fontWeight: 700,
                        }}
                      >
                        Total score: {result.totalScore}
                      </div>

                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          color: "#166534",
                        }}
                      >
                        Behavior: {result.behaviorScore} | Speed: {result.speedScore} | Hunt:{" "}
                        {result.huntScore}
                      </div>

                      {result.behaviorMatches.length > 0 && (
                        <ul
                          style={{
                            marginTop: 8,
                            marginBottom: 0,
                            paddingLeft: 18,
                            color: "#166534",
                            fontSize: 13,
                          }}
                        >
                          {result.behaviorMatches.map((match: string, i: number) => (
                            <li key={`behavior-${i}`}>{match}</li>
                          ))}
                        </ul>
                      )}

                      {result.speedMatches.length > 0 && (
                        <ul
                          style={{
                            marginTop: 8,
                            marginBottom: 0,
                            paddingLeft: 18,
                            color: "#166534",
                            fontSize: 13,
                          }}
                        >
                          {result.speedMatches.map((match: string, i: number) => (
                            <li key={`speed-${i}`}>{match}</li>
                          ))}
                        </ul>
                      )}

                      {result.huntMatches.length > 0 && (
                        <ul
                          style={{
                            marginTop: 8,
                            marginBottom: 0,
                            paddingLeft: 18,
                            color: "#166534",
                            fontSize: 13,
                          }}
                        >
                          {result.huntMatches.map((match: string, i: number) => (
                            <li key={`hunt-${i}`}>{match}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 18,
                padding: 20,
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Ruled Out
                </h2>

                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "#e2e8f0",
                    color: "#334155",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {ruledOutGhosts.length} eliminated
                </div>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {ruledOutGhosts.map((result) => (
                  <div
                    key={result.ghost.id}
                    style={{
                      border: "1px solid #fecaca",
                      background: "#fef2f2",
                      borderRadius: 14,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                        color: "#991b1b",
                        fontSize: 16,
                        marginBottom: 8,
                      }}
                    >
                      {result.ghost.name}
                    </div>

                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: 18,
                        color: "#7f1d1d",
                        fontSize: 14,
                      }}
                    >
                      {result.reasons.map((reason, i) => (
                        <li key={`evidence-${i}`} style={{ marginBottom: 4 }}>
                          {reason}
                        </li>
                      ))}
                      {result.behaviorRuleOutReasons.map((reason: string, i: number) => (
                        <li key={`behavior-${i}`} style={{ marginBottom: 4 }}>
                          {reason}
                        </li>
                      ))}
                      {result.speedRuleOutReasons.map((reason: string, i: number) => (
                        <li key={`speed-${i}`} style={{ marginBottom: 4 }}>
                          {reason}
                        </li>
                      ))}
                      {result.huntRuleOutReasons.map((reason: string, i: number) => (
                        <li key={`hunt-${i}`} style={{ marginBottom: 4 }}>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}