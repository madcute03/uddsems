import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { router } from "@inertiajs/react";

export default function SixTeamDoubleElimination({ eventId }) {
    const defaultMatches = {
        UB1: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB2: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB3: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB4: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB5: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB1: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB2: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB3: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB4: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        GF: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
    };

    const [teamsInput, setTeamsInput] = useState(Array(6).fill(""));
    const [matches, setMatches] = useState(structuredClone(defaultMatches));
    const [champion, setChampion] = useState(null);
    const [lines, setLines] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [activeMatch, setActiveMatch] = useState(null);
    const [scoreInputs, setScoreInputs] = useState({ p1: 0, p2: 0 });

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
                        data.matches.UB2?.p1?.name || "",
                        data.matches.UB2?.p2?.name || "",
                        data.matches.UB3?.p1?.name || "",
                        data.matches.UB4?.p1?.name || "",
                    ];
                    setTeamsInput(initialTeams);
                }
            })
            .catch((err) => console.error("Failed to load bracket:", err));
    }, [eventId]);


    const handleSave = () => {
        if (!eventId) {
            alert("No event selected for this bracket!");
            return;
        }

        router.post(route("double-elimination.save"),
            { event_id: eventId, matches, champion },
            {
                preserveState: true,
                onSuccess: () => {
                    setShowPopup(true);
                    setTimeout(() => setShowPopup(false), 1500);
                },
                onError: (err) => console.error("Failed to save:", err)
            }
        );
    };

    const handleTeamChange = (index, value) => {
        const newTeams = [...teamsInput];
        newTeams[index] = value;
        setTeamsInput(newTeams);
    };

    const applyTeams = () => {
        const updated = structuredClone(defaultMatches);
        updated.UB1.p1.name = teamsInput[0] || "TBD";
        updated.UB1.p2.name = teamsInput[1] || "TBD";
        updated.UB2.p1.name = teamsInput[2] || "TBD";
        updated.UB2.p2.name = teamsInput[3] || "TBD";
        updated.UB3.p1.name = teamsInput[4] || "TBD";
        updated.UB4.p1.name = teamsInput[5] || "TBD";
        setMatches(updated);
        setChampion(null);
    };

    const handleSubmitScores = () => {
        if (!activeMatch) return;
        const updated = structuredClone(matches);

        updated[activeMatch].p1.score = parseInt(scoreInputs.p1) || 0;
        updated[activeMatch].p2.score = parseInt(scoreInputs.p2) || 0;

        const { p1, p2 } = updated[activeMatch];
        if (p1.name === "TBD" || p2.name === "TBD") return;

        const winnerKey = p1.score > p2.score ? "p1" : "p2";
        const loserKey = winnerKey === "p1" ? "p2" : "p1";

        const winnerName = updated[activeMatch][winnerKey].name;
        const loserName = updated[activeMatch][loserKey].name;

        updated[activeMatch].winner = winnerName;
        updated[activeMatch].loser = loserName;

        // Upper bracket propagation
        switch (activeMatch) {
            case "UB1": updated.UB3.p2.name = winnerName; updated.LB1.p1.name = loserName; break;
            case "UB2": updated.UB4.p2.name = winnerName; updated.LB1.p2.name = loserName; break;
            case "UB3": updated.UB5.p1.name = winnerName; updated.LB2.p1.name = loserName; break;
            case "UB4": updated.UB5.p2.name = winnerName; updated.LB3.p2.name = loserName; break;
            case "UB5": updated.GF.p1.name = winnerName; updated.LB4.p2.name = loserName; break;
        }

        // Lower bracket propagation
        switch (activeMatch) {
            case "LB1": updated.LB2.p2.name = winnerName; break;
            case "LB2": updated.LB3.p1.name = winnerName; break;
            case "LB3": updated.LB4.p1.name = winnerName; break;
            case "LB4": updated.GF.p2.name = winnerName; break;
            case "GF": setChampion(winnerName); break;
        }

        setMatches(updated);
        setActiveMatch(null);
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
                    <div key={key} className="flex justify-between mb-1">
                        <span>{m[key]?.name || ""}</span>
                        <span>{m[key]?.score > 0 ? m[key].score : ""}</span>
                    </div>
                ))}

                {/* Only show Report Score if both teams exist and are not TBD */}
                {m.p1.name && m.p2.name && m.p1.name !== "TBD" && m.p2.name !== "TBD" && (
                    <button
                        onClick={() => {
                            setActiveMatch(id);
                            setScoreInputs({ p1: m.p1.score, p2: m.p2.score });
                        }}
                        className="w-full mt-2 px-2 py-1 bg-blue-600 rounded text-white font-bold"
                    >
                        Report Score
                    </button>
                )}

                {m.winner && <p className="text-green-400 text-sm mt-1">Winner: {m.winner}</p>}
            </div>
        );
    };


    useLayoutEffect(() => {
        const updateLines = () => {
            const container = document.getElementById("bracket-container");
            if (!container) return;

            const connections = [
                ["UB1", "UB3"], ["UB2", "UB4"], ["UB3", "UB5"], ["UB4", "UB5"], ["UB5", "GF"],
                ["LB1", "LB2"], ["LB2", "LB3"], ["LB3", "LB4"], ["LB4", "GF"]
            ];

            const newLines = [];
            connections.forEach(([fromId, toId]) => {
                const from = boxRefs.current[fromId];
                const to = boxRefs.current[toId];
                if (!from || !to) return;

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
            });

            setLines(newLines);
        };

        requestAnimationFrame(updateLines);
    }, [matches]);

    return (
        <div className="bg-gray-900 min-h-screen p-6 text-white">
            <h1 className="text-2xl font-bold text-center mb-6">6-Team Double Elimination Bracket</h1>

            {/* Teams Input */}
            <div className="flex gap-4 justify-center mb-6 flex-wrap">
                {teamsInput.map((team, i) => (
                    <input key={i} type="text" value={team} onChange={e => handleTeamChange(i, e.target.value)} placeholder={`Team ${i + 1}`} className="px-2 py-1 rounded text-black" />
                ))}
                <button onClick={applyTeams} className="px-4 py-1 bg-blue-600 rounded text-white font-bold">Apply Teams</button>
                <button onClick={() => { setMatches(structuredClone(defaultMatches)); setTeamsInput(Array(6).fill("")); setChampion(null) }} className="px-4 py-1 bg-red-600 rounded text-white font-bold">Reset</button>
                <button onClick={handleSave} className="px-4 py-1 bg-green-600 rounded text-white font-bold">Save Bracket</button>
            </div>

            {/* Bracket */}
            <div id="bracket-container" className="relative">
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {lines.map((d, i) => <path key={i} d={d} stroke="white" strokeWidth="2" fill="none" />)}
                </svg>

                {/* Upper Bracket */}
                <div className="mb-10">
                    <h2 className="font-bold mb-2">Upper Bracket</h2>
                    <div className="flex gap-12">
                        <div>{renderMatch("UB1")}{renderMatch("UB2")}</div>
                        <div className="mt-12">{renderMatch("UB3")}{renderMatch("UB4")}</div>
                        <div className="mt-24">{renderMatch("UB5")}</div>
                    </div>
                </div>

                {/* Lower Bracket */}
                <div className="mb-10">
                    <h2 className="font-bold mb-2">Lower Bracket</h2>
                    <div className="flex gap-12">
                        <div>{renderMatch("LB1")}{renderMatch("LB2")}</div>
                        <div className="mt-12">{renderMatch("LB3")}</div>
                        <div className="mt-24">{renderMatch("LB4")}</div>
                    </div>
                </div>

                {/* Grand Final */}
                <div className="absolute left-2/3 top-1/2 transform -translate-y-1/2">{renderMatch("GF")}</div>

                {/* Champion */}
                {champion && (
                    <h2 className="absolute left-3/4 top-1/2 transform -translate-y-1/2 text-3xl font-bold text-yellow-400">🏆 Champion: {champion}</h2>
                )}
            </div>

            {/* Report Score Modal */}
            {activeMatch && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-80">
                        <h2 className="text-xl font-bold mb-4">Report Score: {activeMatch}</h2>
                        <div className="mb-3">
                            <label className="block mb-1">{matches[activeMatch].p1.name}</label>
                            <input type="number" min="0" value={scoreInputs.p1} onChange={e => setScoreInputs({ ...scoreInputs, p1: e.target.value })} className="w-full p-1 text-black rounded" />
                        </div>
                        <div className="mb-3">
                            <label className="block mb-1">{matches[activeMatch].p2.name}</label>
                            <input type="number" min="0" value={scoreInputs.p2} onChange={e => setScoreInputs({ ...scoreInputs, p2: e.target.value })} className="w-full p-1 text-black rounded" />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setActiveMatch(null)} className="px-4 py-1 bg-red-600 rounded text-white font-bold">Cancel</button>
                            <button onClick={handleSubmitScores} className="px-4 py-1 bg-green-600 rounded text-white font-bold">Submit</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup */}
            {showPopup && <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-green-600 px-4 py-2 rounded shadow-lg">Bracket Saved!</div>}
        </div>
    );
}
