import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { router } from "@inertiajs/react";

export default function FiveTeamDoubleElimination({ eventId, teamCount = 5 }) {
    const [teamsInput, setTeamsInput] = useState(Array(teamCount).fill(""));
    const [matches, setMatches] = useState({
        UB1: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB2: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB3: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        UB4: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB1: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB2: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        LB3: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
        GF: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null },
    });

    const [champion, setChampion] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [history, setHistory] = useState([]);
    const boxRefs = useRef({});
    const [lines, setLines] = useState([]);

    // ✅ Load saved data if available
    useEffect(() => {
        if (!eventId) return;
        fetch(route("double-elimination.show", { event: eventId }))
            .then(res => res.json())
            .then(data => {
                if (data.matches) setMatches(data.matches);
                if (data.champion) setChampion(data.champion);
                const teamNames = [];
                Object.values(data.matches || {}).forEach(match => {
                    ["p1", "p2"].forEach(key => {
                        if (match[key].name !== "TBD") teamNames.push(match[key].name);
                    });
                });
                setTeamsInput(teamNames.slice(0, teamCount));
            })
            .catch(err => console.error(err));
    }, [eventId]);

    // ✅ Save bracket
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

    const handleClick = (matchId, playerKey) => {
        const updated = { ...matches };
        setHistory(prev => [...prev, { matches: structuredClone(matches), champion }]);

        updated[matchId][playerKey].score += 1;
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
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const last = history[history.length - 1];
        setMatches(last.matches);
        setChampion(last.champion);
        setHistory(prev => prev.slice(0, -1));
    };

    const renderMatch = (id) => {
        const m = matches[id];
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
                        disabled={m[key].name === "TBD"}
                        className={`flex justify-between items-center w-full px-2 py-1 mb-1 rounded text-left ${m.winner === m[key].name
                            ? "bg-green-600"
                            : "bg-gray-700 hover:bg-gray-600"
                            }`}
                    >
                        <span>{m[key].name}</span>
                        <span className="ml-2 px-2 py-1 bg-gray-900 rounded border border-white w-8 text-center">
                            {m[key].score}
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
                ["UB1", "UB3"], ["UB2", "UB4"], ["UB3", "UB4"], ["UB4", "GF"],
                ["LB1", "LB2"], ["LB2", "LB3"], ["LB3", "GF"],
            ];

            const newLines = [];
            connections.forEach(([fromId, toId]) => {
                const from = boxRefs.current[fromId];
                const to = boxRefs.current[toId];
                if (from && to) {
                    const fromBox = from.getBoundingClientRect();
                    const toBox = to.getBoundingClientRect();
                    const containerBox = container.getBoundingClientRect();
                    const startX = fromBox.right - containerBox.left;
                    const startY = fromBox.top + fromBox.height / 2 - containerBox.top;
                    const endX = toBox.left - containerBox.left;
                    const endY = toBox.top + toBox.height / 2 - containerBox.top;
                    const midX = startX + 20;
                    const midY = endY;
                    newLines.push(`M${startX},${startY} H${midX} V${midY} H${endX}`);
                }
            });
            setLines(newLines);
        };
        requestAnimationFrame(updateLines);
    }, [matches]);

    return (
        <div className="bg-gray-900 min-h-screen p-6 text-white">
            <h1 className="text-2xl font-bold text-center mb-6">5-Team Double Elimination Bracket</h1>

            {/* Inputs + Controls */}
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
                <button onClick={applyTeams} className="px-4 py-1 bg-blue-600 rounded text-white font-bold">Apply</button>
                <button onClick={() => {
                    const cleared = Object.keys(matches).reduce((acc, k) => {
                        acc[k] = { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null, loser: null };
                        return acc;
                    }, {});
                    setMatches(cleared);
                    setTeamsInput(Array(teamCount).fill(""));
                    setChampion(null);
                }} className="px-4 py-1 bg-red-600 rounded text-white font-bold">Reset</button>
                <button onClick={handleUndo} className="px-4 py-1 bg-yellow-600 rounded text-white font-bold">Undo</button>
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

            {/* Save Button */}
            <div className="fixed bottom-4 right-4">
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 rounded font-bold">Save Bracket</button>
            </div>

            {/* Popup */}
            {showPopup && (
                <div className="fixed bottom-16 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg">
                    Bracket saved!
                </div>
            )}
        </div>
    );
}
