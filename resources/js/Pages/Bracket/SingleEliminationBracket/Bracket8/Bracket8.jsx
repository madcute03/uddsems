import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { router } from "@inertiajs/react";

export default function EightTeamSingleElimination({ eventId }) {
    const defaultMatches = {
        R1A: { p1: { name: "TBD", score: "" }, p2: { name: "TBD", score: "" }, winner: null },
        R1B: { p1: { name: "TBD", score: "" }, p2: { name: "TBD", score: "" }, winner: null },
        R1C: { p1: { name: "TBD", score: "" }, p2: { name: "TBD", score: "" }, winner: null },
        R1D: { p1: { name: "TBD", score: "" }, p2: { name: "TBD", score: "" }, winner: null },
        SF1: { p1: { name: "TBD", score: "" }, p2: { name: "TBD", score: "" }, winner: null },
        SF2: { p1: { name: "TBD", score: "" }, p2: { name: "TBD", score: "" }, winner: null },
        GF: { p1: { name: "TBD", score: "" }, p2: { name: "TBD", score: "" }, winner: null },
    };

    const [teamsInput, setTeamsInput] = useState(Array(8).fill(""));
    const [matches, setMatches] = useState(defaultMatches);
    const [champion, setChampion] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentMatch, setCurrentMatch] = useState(null);
    const [scoreInput, setScoreInput] = useState({ p1: "", p2: "" });
    const boxRefs = useRef({});
    const [lines, setLines] = useState([]);

    // Load saved bracket
    useEffect(() => {
        if (!eventId) return;
        fetch(route("single-elimination.show", { event: eventId }))
            .then(res => res.json())
            .then(data => {
                if (data.matches) {
                    setMatches({ ...defaultMatches, ...data.matches });
                    setChampion(data.champion || null);
                    const initialTeams = [
                        data.matches.R1A?.p1?.name || "",
                        data.matches.R1A?.p2?.name || "",
                        data.matches.R1B?.p1?.name || "",
                        data.matches.R1B?.p2?.name || "",
                        data.matches.R1C?.p1?.name || "",
                        data.matches.R1C?.p2?.name || "",
                        data.matches.R1D?.p1?.name || "",
                        data.matches.R1D?.p2?.name || "",
                    ];
                    setTeamsInput(initialTeams);
                }
            })
            .catch(err => console.error("Failed to load bracket:", err));
    }, [eventId]);

    const handleTeamChange = (i, val) => {
        const arr = [...teamsInput];
        arr[i] = val;
        setTeamsInput(arr);
    };

    const applyTeams = () => {
        const updated = { ...defaultMatches };
        updated.R1A.p1.name = teamsInput[0] || "TBD";
        updated.R1A.p2.name = teamsInput[1] || "TBD";
        updated.R1B.p1.name = teamsInput[2] || "TBD";
        updated.R1B.p2.name = teamsInput[3] || "TBD";
        updated.R1C.p1.name = teamsInput[4] || "TBD";
        updated.R1C.p2.name = teamsInput[5] || "TBD";
        updated.R1D.p1.name = teamsInput[6] || "TBD";
        updated.R1D.p2.name = teamsInput[7] || "TBD";
        setMatches(updated);
        setChampion(null);
    };

    const openReportScore = (id) => {
        setCurrentMatch(id);
        setScoreInput({
            p1: matches[id].p1.score || "",
            p2: matches[id].p2.score || "",
        });
        setShowModal(true);
    };

    const submitScore = () => {
        if (!currentMatch) return;
        const updated = { ...matches };
        const m = updated[currentMatch];
        m.p1.score = scoreInput.p1;
        m.p2.score = scoreInput.p2;

        if (m.p1.name !== "TBD" && m.p2.name !== "TBD" && m.p1.score !== m.p2.score) {
            const winnerKey = parseInt(m.p1.score) > parseInt(m.p2.score) ? "p1" : "p2";
            const winnerName = m[winnerKey].name;
            m.winner = winnerName;

            switch (currentMatch) {
                case "R1A": updated.SF1.p1.name = winnerName; break;
                case "R1B": updated.SF1.p2.name = winnerName; break;
                case "R1C": updated.SF2.p1.name = winnerName; break;
                case "R1D": updated.SF2.p2.name = winnerName; break;
                case "SF1": updated.GF.p1.name = winnerName; break;
                case "SF2": updated.GF.p2.name = winnerName; break;
                case "GF": setChampion(winnerName); break;
            }
        }

        setMatches(updated);
        setShowModal(false);
    };

    const handleSave = () => {
        if (!eventId) return;
        router.post(
            route("single-elimination.save"),
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

    const renderMatch = (id, label) => {
        const m = matches[id];
        if (!m) return null;
        return (
            <div
                id={id}
                ref={el => (boxRefs.current[id] = el)}
                className="p-3 border rounded-lg bg-gray-800 text-white mb-6 w-56 relative"
            >
                <p className="font-bold mb-2">{label}</p>
                {["p1", "p2"].map(k => (
                    <div key={k} className={`flex justify-between items-center mb-2 ${m.winner === m[k]?.name ? "bg-green-600" : "bg-gray-700"} px-2 py-1 rounded`}>
                        <span>{m[k]?.name ?? "TBD"}</span>
                        <span>{m[k]?.score || "-"}</span>
                    </div>
                ))}
                {m.p1?.name !== "TBD" && m.p2?.name !== "TBD" && (
                    <button onClick={() => openReportScore(id)} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded font-bold text-sm w-full mt-1">
                        Report Score
                    </button>
                )}
                {m.winner && <p className="text-green-400 text-sm mt-1">Winner: {m.winner}</p>}
            </div>
        );
    };

    // Lines
    useLayoutEffect(() => {
        const container = document.getElementById("bracket-container");
        if (!container) return;
        const connections = [
            ["R1A", "SF1"], ["R1B", "SF1"],
            ["R1C", "SF2"], ["R1D", "SF2"],
            ["SF1", "GF"], ["SF2", "GF"]
        ];
        const newLines = connections.map(([fromId, toId]) => {
            const from = boxRefs.current[fromId];
            const to = boxRefs.current[toId];
            if (!from || !to) return null;
            const f = from.getBoundingClientRect();
            const t = to.getBoundingClientRect();
            const c = container.getBoundingClientRect();
            const startX = f.right - c.left;
            const startY = f.top + f.height / 2 - c.top;
            const endX = t.left - c.left;
            const endY = t.top + t.height / 2 - c.top;
            const midX = startX + 30;
            return `M${startX},${startY} H${midX} V${endY} H${endX}`;
        }).filter(Boolean);
        setLines(newLines);
    }, [matches]);

    return (
        <div className="bg-gray-900 min-h-screen p-4 text-white">
            <h1 className="text-2xl font-bold text-center mb-6">8-Team Single Elimination Bracket</h1>

            <div className="flex gap-2 justify-center mb-6 flex-wrap">
                {teamsInput.map((t, i) => (
                    <input key={i} type="text" value={t} onChange={e => handleTeamChange(i, e.target.value)} placeholder={`Team ${i + 1}`} className="px-2 py-1 rounded text-black" />
                ))}
                <button onClick={applyTeams} className="px-4 py-1 bg-blue-600 rounded text-white font-bold">Apply Teams</button>
                <button onClick={() => { setMatches(defaultMatches); setTeamsInput(Array(8).fill("")); setChampion(null); }} className="px-4 py-1 bg-red-600 rounded text-white font-bold">Reset</button>
                <button onClick={handleSave} className="px-4 py-1 bg-green-600 rounded text-white font-bold">Save Bracket</button>
            </div>

            <div id="bracket-container" className="relative">
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {lines.map((d, i) => <path key={i} d={d} stroke="white" strokeWidth="2" fill="none" />)}
                </svg>

                <div className="flex flex-col md:flex-row md:gap-24 justify-center">
                    <div className="flex flex-col gap-6">
                        {renderMatch("R1A", "Round 1")}
                        {renderMatch("R1B", "Round 1")}
                        {renderMatch("R1C", "Round 1")}
                        {renderMatch("R1D", "Round 1")}
                    </div>
                    <div className="flex flex-col gap-72 mt-12">
                        {renderMatch("SF1", "Semi-Final 1")}
                        {renderMatch("SF2", "Semi-Final 2")}
                    </div>
                    <div className="mt-24">{renderMatch("GF", "Grand Final")}</div>
                </div>
            </div>

            {champion && <h2 className="text-3xl font-bold text-yellow-400 mt-6 text-center">🏆 Champion: {champion}</h2>}

            {showPopup && <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-green-600 px-4 py-2 rounded shadow-lg">Bracket Saved!</div>}

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                    <div className="bg-white text-black p-6 rounded-lg shadow-lg w-80">
                        <h2 className="text-lg font-bold mb-4">Report Score ({currentMatch})</h2>
                        <div className="mb-3">
                            <label className="block text-sm font-semibold">{matches[currentMatch]?.p1?.name}</label>
                            <input type="number" value={scoreInput.p1} onChange={e => setScoreInput({ ...scoreInput, p1: e.target.value })} className="w-full border px-2 py-1 rounded" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold">{matches[currentMatch]?.p2?.name}</label>
                            <input type="number" value={scoreInput.p2} onChange={e => setScoreInput({ ...scoreInput, p2: e.target.value })} className="w-full border px-2 py-1 rounded" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowModal(false)} className="px-3 py-1 rounded bg-gray-400 text-white">Cancel</button>
                            <button onClick={submitScore} className="px-3 py-1 rounded bg-blue-600 text-white font-bold">Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
