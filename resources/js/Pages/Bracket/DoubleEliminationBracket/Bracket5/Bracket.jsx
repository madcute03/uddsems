import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { router } from "@inertiajs/react";

export default function FiveTeamDoubleElimination({ eventId, teamCount = 5 }) {
    const defaultMatches = {
        UB1: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB2: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB3: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB4: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB1: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB2: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB3: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        GF: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
    };

    const [teamsInput, setTeamsInput] = useState(Array(teamCount).fill(""));
    const [matches, setMatches] = useState(defaultMatches);
    const [champion, setChampion] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const boxRefs = useRef({});
    const [lines, setLines] = useState([]);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [activeMatch, setActiveMatch] = useState(null);
    const [scoreP1, setScoreP1] = useState(0);
    const [scoreP2, setScoreP2] = useState(0);

    // Load saved data
    useEffect(() => {
        if (!eventId) return;

        fetch(route("double-elimination.show", { event: eventId }))
            .then(res => res.json())
            .then(data => {
                if (data.matches) setMatches({ ...defaultMatches, ...data.matches });
                if (data.champion) setChampion(data.champion);

                // For 5-team bracket, pick the first 5 players from their positions
                const initialTeams = [
                    data.matches.UB1?.p1?.name || "",
                    data.matches.UB1?.p2?.name || "",
                    data.matches.UB2?.p1?.name || "",
                    data.matches.UB2?.p2?.name || "",
                    data.matches.UB3?.p1?.name || ""
                ];
                setTeamsInput(initialTeams);
            })
            .catch(err => console.error("Failed to load bracket:", err));
    }, [eventId]);


    // Save bracket
    const handleSave = () => {
        if (!eventId) return alert("No event selected!");
        router.post(
            route("double-elimination.save"),
            { event_id: eventId, matches, champion },
            {
                preserveState: true,
                onSuccess: () => {
                    setShowPopup(true);
                    setTimeout(() => setShowPopup(false), 1500);
                },
            }
        );
    };

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
        setMatches(updated);
        setChampion(null);
    };

    // Open modal to report score
    const openReportScore = (matchId) => {
        setActiveMatch(matchId);
        setScoreP1(matches[matchId].p1.score || 0);
        setScoreP2(matches[matchId].p2.score || 0);
        setShowModal(true);
    };

    // Submit scores
    const submitScores = () => {
        const updated = { ...matches };
        const matchId = activeMatch;
        if (!matchId) return;

        updated[matchId].p1.score = parseInt(scoreP1) || 0;
        updated[matchId].p2.score = parseInt(scoreP2) || 0;

        const { p1, p2 } = updated[matchId];
        if (p1.name !== "TBD" && p2.name !== "TBD" && p1.score !== p2.score) {
            const winnerKey = p1.score > p2.score ? "p1" : "p2";
            const loserKey = winnerKey === "p1" ? "p2" : "p1";
            const winnerName = updated[matchId][winnerKey].name;
            const loserName = updated[matchId][loserKey].name;

            updated[matchId].winner = winnerName;
            updated[matchId].loser = loserName;

            // Upper Bracket progression
            if (matchId === "UB1") { updated.UB3.p2.name = winnerName; updated.LB1.p1.name = loserName; }
            if (matchId === "UB2") { updated.UB4.p1.name = winnerName; updated.LB1.p2.name = loserName; }
            if (matchId === "UB3") { updated.UB4.p2.name = winnerName; updated.LB2.p1.name = loserName; }
            if (matchId === "UB4") { updated.GF.p1.name = winnerName; updated.LB3.p2.name = loserName; }

            // Lower Bracket progression
            if (matchId === "LB1") updated.LB2.p2.name = winnerName;
            if (matchId === "LB2") updated.LB3.p1.name = winnerName;
            if (matchId === "LB3") updated.GF.p2.name = winnerName;

            // Grand Final
            if (matchId === "GF") setChampion(winnerName);
        }

        setMatches(updated);
        setShowModal(false);
    };

    const renderMatch = (id) => {
        const m = matches[id];
        if (!m) return null;

        return (
            <div
                id={id}
                ref={(el) => (boxRefs.current[id] = el)}
                className="p-3 border rounded-lg bg-gray-800 text-white mb-6 w-52 relative"
            >
                <p className="font-bold mb-2">{id}</p>
                {["p1", "p2"].map((key) => (
                    <div key={key} className="flex justify-between items-center mb-2">
                        <span>{m[key]?.name ?? "TBD"}</span>
                        <span className="ml-2 px-2 py-1 text-center">
                            {m[key]?.score}
                        </span>
                    </div>
                ))}

                {/* Show button only if both teams are assigned */}
                {m.p1.name !== "TBD" && m.p2.name !== "TBD" && (
                    <button
                        onClick={() => openReportScore(id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded font-bold text-sm"
                    >
                        Report Score
                    </button>
                )}
            </div>
        );
    };


    useLayoutEffect(() => {
        const updateLines = () => {
            const container = document.getElementById("bracket-container");
            if (!container) return;

            const connections = [
                ["UB1", "UB3"], ["UB2", "UB4"], ["UB3", "UB4"], ["UB4", "GF"],
                ["LB1", "LB2"], ["LB2", "LB3"], ["LB3", "GF"],
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
        <div className="bg-gray-900 min-h-screen p-6 text-white">
            <h1 className="text-2xl font-bold text-center mb-6">{teamCount}-Team Double Elimination Bracket</h1>

            {/* Inputs + Controls */}
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
                <button onClick={applyTeams} className="px-4 py-1 bg-blue-600 rounded text-white font-bold">Apply Teams</button>
                <button onClick={() => {
                    setMatches(defaultMatches);
                    setTeamsInput(Array(teamCount).fill(""));
                    setChampion(null);
                }} className="px-4 py-1 bg-red-600 rounded text-white font-bold">Reset</button>
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 rounded font-bold">Save Bracket</button>
            </div>

            {/* Bracket */}
            <div id="bracket-container" className="relative">
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {lines.map((d, i) => <path key={i} d={d} stroke="white" strokeWidth="2" fill="none" />)}
                </svg>

                {/* Upper Bracket */}
                <h2 className="font-bold mb-2">Upper Bracket</h2>
                <div className="flex gap-12 mb-10">
                    <div>{renderMatch("UB1")}</div>
                    <div>{renderMatch("UB2")}{renderMatch("UB3")}</div>
                    <div>{renderMatch("UB4")}</div>
                </div>

                {/* Lower Bracket */}
                <h2 className="font-bold mb-2">Lower Bracket</h2>
                <div className="flex gap-12 mb-10">
                    <div>{renderMatch("LB1")}</div>
                    <div>{renderMatch("LB2")}</div>
                    <div>{renderMatch("LB3")}</div>
                </div>

                {/* Grand Final */}
                <div className="flex flex-col justify-center items-center absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2">
                    <h2 className="font-bold mb-2 text-center">Grand Final</h2>
                    {renderMatch("GF")}
                </div>
            </div>

            {/* Champion */}
            {champion && (
                <div className="text-center mt-10 text-yellow-400 text-3xl font-bold">
                    🏆 Champion: {champion}
                </div>
            )}

            {/* Popup */}
            {showPopup && <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-green-600 px-4 py-2 rounded shadow-lg">Bracket Saved!</div>}

            {/* Report Score Modal */}
            {showModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-80">
                        <h2 className="text-lg font-bold mb-4">Report Score - {activeMatch}</h2>
                        <div className="flex flex-col gap-3">
                            <label className="flex justify-between items-center">
                                <span>{matches[activeMatch].p1.name}</span>
                                <input
                                    type="number"
                                    value={scoreP1}
                                    onChange={(e) => setScoreP1(e.target.value)}
                                    className="w-16 text-center text-black rounded"
                                />
                            </label>
                            <label className="flex justify-between items-center">
                                <span>{matches[activeMatch].p2.name}</span>
                                <input
                                    type="number"
                                    value={scoreP2}
                                    onChange={(e) => setScoreP2(e.target.value)}
                                    className="w-16 text-center text-black rounded"
                                />
                            </label>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setShowModal(false)} className="px-3 py-1 bg-gray-600 rounded">Cancel</button>
                            <button onClick={submitScores} className="px-3 py-1 bg-blue-600 rounded font-bold">Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
