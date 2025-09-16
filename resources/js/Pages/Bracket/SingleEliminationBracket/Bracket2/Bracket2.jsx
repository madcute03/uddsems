import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { router } from "@inertiajs/react";

export default function TwoTeamBracket({ eventId }) {
    const defaultMatches = {
        F: { p1: { name: "TBD", score: "" }, p2: { name: "TBD", score: "" }, winner: null },
    };

    const [teamsInput, setTeamsInput] = useState(["", ""]);
    const [matches, setMatches] = useState(defaultMatches);
    const [champion, setChampion] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentMatch, setCurrentMatch] = useState(null);
    const [scoreInput, setScoreInput] = useState({ p1: "", p2: "" });
    const [showPopup, setShowPopup] = useState(false);
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
                    setTeamsInput([
                        data.matches.F?.p1?.name || "",
                        data.matches.F?.p2?.name || ""
                    ]);
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
        updated.F.p1.name = teamsInput[0] || "TBD";
        updated.F.p2.name = teamsInput[1] || "TBD";
        updated.F.p1.score = "";
        updated.F.p2.score = "";
        updated.F.winner = null;
        setMatches(updated);
        setChampion(null);
    };

    const openReportScore = (matchId) => {
        setCurrentMatch(matchId);
        setScoreInput({
            p1: matches[matchId]?.p1?.score || "",
            p2: matches[matchId]?.p2?.score || "",
        });
        setShowModal(true);
    };

    const submitScore = () => {
        if (!currentMatch) return;
        const updated = { ...matches };
        const m = updated[currentMatch];
        m.p1.score = scoreInput.p1;
        m.p2.score = scoreInput.p2;

        if (m.p1.score !== m.p2.score) {
            const winnerKey = parseInt(m.p1.score) > parseInt(m.p2.score) ? "p1" : "p2";
            const winnerName = m[winnerKey].name;
            m.winner = winnerName;
            setChampion(winnerName);
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

    const resetBracket = () => {
        setTeamsInput(["", ""]);
        setMatches(defaultMatches);
        setChampion(null);
    };

    const renderMatch = (id, label) => {
        const m = matches[id];
        return (
            <div
                id={id}
                ref={(el) => (boxRefs.current[id] = el)}
                className="p-3 border rounded-lg bg-gray-800 text-white mb-12 w-44 relative"
            >
                <p className="font-bold mb-2 text-center">{label}</p>
                {["p1", "p2"].map((k) => (
                    <div key={k} className={`flex justify-between items-center mb-2 px-2 py-1 rounded ${m.winner === m[k]?.name ? "bg-green-600" : "bg-gray-700"}`}>
                        <span>{m[k]?.name ?? "TBD"}</span>
                        <span>{m[k]?.score || "-"}</span>
                    </div>
                ))}
                {m.p1?.name !== "TBD" && m.p2?.name !== "TBD" && !m.winner && (
                    <button onClick={() => openReportScore(id)} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded font-bold text-sm w-full mt-1">
                        Report Score
                    </button>
                )}
                {m.winner && <p className="text-green-400 text-sm mt-1">Winner: {m.winner}</p>}
            </div>
        );
    };

    useLayoutEffect(() => {
        const container = document.getElementById("bracket-container");
        if (!container) return;
        const newLines = []; // Only one match, no lines needed for now
        setLines(newLines);
    }, [matches]);

    return (
        <div className="bg-gray-900 min-h-screen p-6 text-white">
            <h1 className="text-2xl font-bold text-center mb-6">2-Team Bracket</h1>

            <div className="flex gap-4 justify-center mb-6 flex-wrap">
                {teamsInput.map((t, i) => (
                    <input key={i} type="text" value={t} onChange={(e) => handleTeamChange(i, e.target.value)} placeholder={`Team ${i + 1}`} className="px-2 py-1 rounded text-black" />
                ))}
                <button onClick={applyTeams} className="w-[200px] h-[45px] rounded-[15px] cursor-pointer 
                                                               transition duration-300 ease-in-out 
                                                               bg-gradient-to-br from-[#2e8eff] to-[#2e8eff]/0 
                                                               bg-[#2e8eff]/20 flex items-center justify-center 
                                                               hover:bg-[#2e8eff]/70 hover:shadow-[0_0_10px_rgba(46,142,255,0.5)] 
                                                               focus:outline-none focus:bg-[#2e8eff]/70 focus:shadow-[0_0_10px_rgba(46,142,255,0.5)]">Apply Teams</button>
                <button onClick={handleSave} className="w-[131px] h-[45px] rounded-[15px] cursor-pointer 
                                                               transition duration-300 ease-in-out 
                                                               bg-gradient-to-br from-[#00ff00] to-[#00ff00]/0 
                                                               bg-[#00ff00]/20 flex items-center justify-center 
                                                               hover:bg-[#00ff00]/70 hover:shadow-[0_0_10px_rgba(0,255,0,0.5)] 
                                                               focus:outline-none focus:bg-[#00ff00]/70 focus:shadow-[0_0_10px_rgba(0,255,0,0.5)]
">Save Bracket</button>
                <button onClick={resetBracket} className="w-[131px] h-[45px] rounded-[15px] cursor-pointer 
                                                               transition duration-300 ease-in-out 
                                                               bg-gradient-to-br from-[#ff0000] to-[#ff0000]/0 
                                                               bg-[#ff0000]/20 flex items-center justify-center 
                                                               hover:bg-[#ff0000]/70 hover:shadow-[0_0_10px_rgba(255,0,0,0.5)] 
                                                               focus:outline-none focus:bg-[#ff0000]/70 focus:shadow-[0_0_10px_rgba(255,0,0,0.5)]">Reset Bracket</button>
            </div>

            <div id="bracket-container" className="relative flex justify-center items-start gap-24">
                {renderMatch("F", "Final")}
                {champion && <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-6"><h2 className="text-3xl font-bold text-yellow-400">🏆 {champion}</h2></div>}
            </div>

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

            {showPopup && <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-green-600 px-4 py-2 rounded shadow-lg">Bracket Saved!</div>}
        </div>
    );
}
