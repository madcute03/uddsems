import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { router } from "@inertiajs/react";

export default function SevenTeamDoubleElimination({ eventId, teamCount =7 }) {
    const defaultMatches = {
        UB1: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB2: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB3: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB5: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB6: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB7: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB1: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB2: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB3: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB4: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB5: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        GF: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
    };

    const [teamsInput, setTeamsInput] = useState(Array(teamCount).fill(""));
    const [matches, setMatches] = useState(defaultMatches);
    const [champion, setChampion] = useState(null);
    const [lines, setLines] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const boxRefs = useRef({});
    const [history, setHistory] = useState([]);

    // Auto-load saved bracket
    useEffect(() => {
        if (!eventId) return;

        fetch(route("double-elimination.show", { event: eventId }))
            .then((res) => res.json())
            .then((data) => {
                if (data.matches) {
                    setMatches({ ...defaultMatches, ...data.matches });
                    setChampion(data.champion || null);

                    const initialTeams = [
                        data.matches.UB1?.p1?.name || "",
                        data.matches.UB1?.p2?.name || "",
                        data.matches.UB2?.p1?.name || "",
                        data.matches.UB2?.p2?.name || "",
                        data.matches.UB3?.p1?.name || "",
                        data.matches.UB3?.p2?.name || "",
                        data.matches.UB5?.p2?.name || "",
                    ];
                    setTeamsInput(initialTeams);
                }
            })
            .catch((err) => console.error("Failed to load bracket:", err));
    }, [eventId]);

    const handleTeamChange = (index, value) => {
        const newTeams = [...teamsInput];
        newTeams[index] = value;
        setTeamsInput(newTeams);
    };

    const applyTeams = () => {
        const updated = { ...matches };
        updated.UB1.p1.name = teamsInput[0] || "TBD";
        updated.UB1.p2.name = teamsInput[1] || "TBD";
        updated.UB2.p1.name = teamsInput[2] || "TBD";
        updated.UB2.p2.name = teamsInput[3] || "TBD";
        updated.UB3.p1.name = teamsInput[4] || "TBD";
        updated.UB3.p2.name = teamsInput[5] || "TBD";
        updated.UB5.p2.name = teamsInput[6] || "TBD"; // Team 7 bye
        setMatches(updated);
        setChampion(null);
    };

    const handleClick = (matchId, playerKey) => {
        const updated = { ...matches };
        setHistory((prev) => [...prev, { matches: structuredClone(matches), champion }]);

        if (!updated[matchId] || !updated[matchId][playerKey]) return;

        updated[matchId][playerKey].score += 1;

        const { p1, p2 } = updated[matchId];
        if (p1.name !== "TBD" && p2.name !== "TBD" && p1.score !== p2.score) {
            const winnerKey = p1.score > p2.score ? "p1" : "p2";
            const loserKey = winnerKey === "p1" ? "p2" : "p1";
            const winnerName = updated[matchId][winnerKey].name;
            const loserName = updated[matchId][loserKey].name;

            updated[matchId].winner = winnerName;
            updated[matchId].loser = loserName;

            // Upper Bracket propagation
            switch (matchId) {
                case "UB1": updated.UB5.p1.name = winnerName; updated.LB2.p2.name = loserName; break;
                case "UB2": updated.UB6.p1.name = winnerName; updated.LB1.p1.name = loserName; break;
                case "UB3": updated.UB6.p2.name = winnerName; updated.LB1.p2.name = loserName; break;
                case "UB5": updated.UB7.p1.name = winnerName; updated.LB3.p1.name = loserName; break;
                case "UB6": updated.UB7.p2.name = winnerName; updated.LB2.p1.name = loserName; break;
                case "UB7": updated.GF.p1.name = winnerName; updated.LB5.p2.name = loserName; break;
            }

            // Lower Bracket propagation
            switch (matchId) {
                case "LB1": updated.LB3.p2.name = winnerName; break;
                case "LB2": updated.LB4.p2.name = winnerName; break;
                case "LB3": updated.LB4.p1.name = winnerName; break;
                case "LB4": updated.LB5.p1.name = winnerName; break;
                case "LB5": updated.GF.p2.name = winnerName; break;
                case "GF": setChampion(winnerName); break;
            }
        }

        setMatches(updated);
    };

    const handleSave = () => {
        if (!eventId) return;

        router.post(
            route("double-elimination.save"),
            { event_id: eventId, matches, champion },
            {
                preserveState: true,
                onSuccess: () => {
                    setShowPopup(true);
                    setTimeout(() => setShowPopup(false), 1500);
                },
                onError: (err) => console.error("Failed to save:", err),
            }
        );
    };

    const renderMatch = (id) => {
        const m = matches[id];
        if (!m) return null;

        return (
            <div
                id={id}
                ref={(el) => (boxRefs.current[id] = el)}
                className="p-3 border rounded-lg bg-gray-800 text-white mb-6 w-44 relative"
            >
                <p className="font-bold mb-1">{id}</p>
                {["p1", "p2"].map((key) => (
                    <button
                        key={key}
                        onClick={() => handleClick(id, key)}
                        disabled={!m[key] || m[key].name === "TBD"}
                        className={`flex justify-between items-center w-full px-2 py-1 mb-1 rounded text-left ${m.winner === m[key]?.name ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"
                            }`}
                    >
                        <span>{m[key]?.name ?? "TBD"}</span>
                        <span className="ml-2 px-2 py-1 bg-gray-900 rounded border border-white w-8 text-center">
                            {m[key]?.score ?? 0}
                        </span>
                    </button>
                ))}
            </div>
        );
    };

    useLayoutEffect(() => {
        const updateLines = () => {
            const container = document.getElementById("bracket-container");
            if (!container) return;

            const connections = [
                ["UB1", "UB5"], ["UB2", "UB6"], ["UB3", "UB6"], ["UB5", "UB7"], ["UB6", "UB7"], ["UB7", "GF"],
                ["LB1", "LB3"], ["LB2", "LB4"], ["LB3", "LB4"], ["LB4", "LB5"], ["LB5", "GF"],
            ];

            const newLines = [];
            connections.forEach(([fromId, toId]) => {
                const from = boxRefs.current[fromId];
                const to = boxRefs.current[toId];
                if (from && to) {
                    const f = from.getBoundingClientRect();
                    const t = to.getBoundingClientRect();
                    const c = container.getBoundingClientRect();
                    const startX = f.right - c.left;
                    const startY = f.top + f.height / 2 - c.top;
                    const endX = t.left - c.left;
                    const endY = t.top + t.height / 2 - c.top;
                    const midX = startX + 30;
                    const path = `M${startX},${startY} H${midX} V${endY} H${endX}`;
                    newLines.push(path);
                }
            });
            setLines(newLines);
        };
        requestAnimationFrame(updateLines);
    }, [matches]);

    return (
        <div className="bg-gray-900 min-h-screen p-4 text-white">
            <h1 className="text-2xl font-bold text-center mb-6">7-Team Double Elimination Bracket</h1>

            <div className="flex gap-4 justify-center mb-6">
                {teamsInput.map((team, i) => (
                    <input
                        key={i}
                        type="text"
                        value={team}
                        onChange={(e) => handleTeamChange(i, e.target.value)}
                        placeholder={`Team ${i + 1}`}
                        className="px-2 py-1 rounded text-black"
                    />
                ))}
                <button onClick={applyTeams} className="px-4 py-1 bg-blue-600 rounded text-white font-bold">
                    Apply Teams
                </button>
                <button
                    onClick={() => {
                        setMatches(defaultMatches);
                        setTeamsInput(Array(teamCount).fill(""));
                        setChampion(null);
                    }}
                    className="px-4 py-1 bg-red-600 rounded text-white font-bold"
                >
                    Reset
                </button>
                <button onClick={handleSave} className="px-4 py-1 bg-green-600 rounded text-white font-bold">
                    Save Bracket
                </button>
            </div>

            <div id="bracket-container" className="relative">
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {lines.map((d, i) => (
                        <path key={i} d={d} stroke="white" strokeWidth="2" fill="none" />
                    ))}
                </svg>

                {/* Upper Bracket */}
                <div>
                    <h2 className="font-bold mb-2">Upper Bracket</h2>
                    <div className="flex gap-12 mb-10">
                        <div>
                            {renderMatch("UB1")}
                            {renderMatch("UB2")}
                            {renderMatch("UB3")}
                        </div>
                        <div>
                            {renderMatch("UB5")}
                            {renderMatch("UB6")}
                        </div>
                        <div>
                            {renderMatch("UB7")}
                        </div>
                    </div>
                </div>

                {/* Lower Bracket */}
                <div>
                    <h2 className="font-bold mb-2">Lower Bracket</h2>
                    <div className="flex gap-12 mb-10">
                        <div>{renderMatch("LB1")}</div>
                        <div>{renderMatch("LB2")}{renderMatch("LB3")}</div>
                        <div>{renderMatch("LB4")}</div>
                        <div>{renderMatch("LB5")}</div>
                    </div>
                </div>

                {/* Grand Final */}
                <div className="absolute left-2/3 top-1/2 transform -translate-y-1/2">
                    {renderMatch("GF")}
                    {champion && (
                        <h2 className="text-3xl font-bold text-yellow-400 mt-4">
                            🏆 Champion: {champion}
                        </h2>
                    )}
                </div>

                {/* Popup */}
                {showPopup && (
                    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-green-600 px-4 py-2 rounded shadow-lg">
                        Bracket Saved!
                    </div>
                )}
            </div>
        </div>
    );
}
