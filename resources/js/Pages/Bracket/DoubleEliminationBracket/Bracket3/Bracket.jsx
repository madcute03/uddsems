import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { router } from "@inertiajs/react";

export default function ThreeTeamDoubleElimination({ eventId, teamCount = 3 }) {
    const defaultMatches = {
        UB1: { p1: { name: "TBD", score: "" }, p2: { name: "TBD", score: "" }, winner: null, loser: null },
        UB2: { p1: { name: "TBD", score: "" }, p2: { name: "TBD", score: "" }, winner: null, loser: null },
        LB1: { p1: { name: "TBD", score: "" }, p2: { name: "TBD", score: "" }, winner: null, loser: null },
        GF: { p1: { name: "TBD", score: "" }, p2: { name: "TBD", score: "" }, winner: null, loser: null },
    };

    const [teamsInput, setTeamsInput] = useState(Array(teamCount).fill(""));
    const [matches, setMatches] = useState(defaultMatches);
    const [champion, setChampion] = useState(null);
    const [lines, setLines] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [modalMatch, setModalMatch] = useState(null);
    const [scoreInputs, setScoreInputs] = useState({ p1: "", p2: "" });
    const boxRefs = useRef({});

    // Load saved bracket
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
                        data.matches.UB2?.p2?.name || "",
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
        updated.UB2.p2.name = teamsInput[2] || "TBD"; // Team 3
        setMatches(updated);
        setChampion(null);
    };

    const openScoreModal = (matchId) => {
        setModalMatch(matchId);
        setScoreInputs({
            p1: matches[matchId].p1.score || "",
            p2: matches[matchId].p2.score || "",
        });
    };

    const submitScores = () => {
        if (!modalMatch) return;
        const updated = { ...matches };
        const m = updated[modalMatch];
        m.p1.score = scoreInputs.p1;
        m.p2.score = scoreInputs.p2;

        const p1Score = parseInt(scoreInputs.p1, 10);
        const p2Score = parseInt(scoreInputs.p2, 10);

        if (isNaN(p1Score) || isNaN(p2Score)) {
            alert("Please enter valid scores");
            return;
        }

        let winnerKey = p1Score > p2Score ? "p1" : "p2";
        let loserKey = winnerKey === "p1" ? "p2" : "p1";

        m.winner = m[winnerKey].name;
        m.loser = m[loserKey].name;

        // Upper Bracket propagation
        switch (modalMatch) {
            case "UB1":
                updated.UB2.p1.name = m.winner;
                updated.LB1.p1.name = m.loser;
                break;
            case "UB2":
                updated.GF.p1.name = m.winner;
                updated.LB1.p2.name = m.loser;
                break;
        }

        // Lower Bracket propagation
        switch (modalMatch) {
            case "LB1":
                updated.GF.p2.name = m.winner;
                break;
            case "GF":
                setChampion(m.winner);
                break;
        }

        setMatches(updated);
        setModalMatch(null);
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
                className="p-3 border rounded-lg bg-gray-800 text-white mb-6 w-56 relative"
            >
                <p className="font-bold mb-2">{id}</p>
                {["p1", "p2"].map((key) => (
                    <div key={key} className="flex justify-between items-center mb-2">
                        <span>{m[key]?.name ?? "TBD"}</span>
                        <span className="ml-2">{m[key]?.score || "-"}</span>
                    </div>
                ))}

                {m.p1?.name !== "TBD" && m.p2?.name !== "TBD" && (
                    <button
                        onClick={() => openScoreModal(id)}
                        className="w-full px-2 py-1 mt-2 rounded text-sm font-bold bg-blue-600 hover:bg-blue-500"
                    >
                        Report Score
                    </button>
                )}

                {m.winner && m.winner !== "TBD" && (
                    <p className="text-green-400 text-sm mt-1">Winner: {m.winner}</p>
                )}
            </div>
        );
    };

    useLayoutEffect(() => {
        const updateLines = () => {
            const container = document.getElementById("bracket-container");
            if (!container) return;

            const connections = [
                ["UB1", "UB2"], ["UB2", "GF"], ["LB1", "GF"],
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
            <h1 className="text-2xl font-bold text-center mb-6">{teamCount}-Team Double Elimination Bracket</h1>

            <div className="flex gap-4 justify-center mb-6 flex-wrap">
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

                <div>
                    <h2 className="font-bold mb-2">Upper Bracket</h2>
                    <div className="flex gap-12 mb-10">
                        <div>{renderMatch("UB1")}</div>
                        <div>{renderMatch("UB2")}</div>
                    </div>
                </div>

                <div>
                    <h2 className="font-bold mb-2">Lower Bracket</h2>
                    <div className="flex gap-12 mb-10">{renderMatch("LB1")}</div>
                </div>

                <div className="absolute left-2/3 top-1/2 transform -translate-y-1/2">
                    {renderMatch("GF")}
                    {champion && (
                        <h2 className="text-3xl font-bold text-yellow-400 mt-4">
                            🏆 Champion: {champion}
                        </h2>
                    )}
                </div>

                {showPopup && (
                    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-green-600 px-4 py-2 rounded shadow-lg">
                        Bracket Saved!
                    </div>
                )}

                {modalMatch && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-6 rounded-lg w-80">
                            <h2 className="text-lg font-bold mb-4">Report Score ({modalMatch})</h2>
                            <div className="mb-3">
                                <label className="block text-sm mb-1">{matches[modalMatch].p1.name}</label>
                                <input
                                    type="number"
                                    value={scoreInputs.p1}
                                    onChange={(e) => setScoreInputs({ ...scoreInputs, p1: e.target.value })}
                                    className="w-full px-2 py-1 rounded text-black"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm mb-1">{matches[modalMatch].p2.name}</label>
                                <input
                                    type="number"
                                    value={scoreInputs.p2}
                                    onChange={(e) => setScoreInputs({ ...scoreInputs, p2: e.target.value })}
                                    className="w-full px-2 py-1 rounded text-black"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setModalMatch(null)}
                                    className="px-3 py-1 bg-gray-600 rounded text-white font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitScores}
                                    className="px-3 py-1 bg-blue-600 rounded text-white font-bold"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
