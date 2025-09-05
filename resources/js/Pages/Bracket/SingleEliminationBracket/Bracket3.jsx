import React, { useState } from "react";

export default function ThreeTeamSingleElimination() {
    const [teamsInput, setTeamsInput] = useState(["", "", ""]);
    const [matches, setMatches] = useState({
        SF: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null },
        GF: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null }
    });
    const [champion, setChampion] = useState(null);

    const handleTeamChange = (index, value) => {
        const newTeams = [...teamsInput];
        newTeams[index] = value;
        setTeamsInput(newTeams);
    };

    const applyTeams = () => {
        const updated = { ...matches };
        // Team 1 gets a bye to Grand Final
        updated.GF.p1.name = teamsInput[0] || "TBD";
        updated.SF.p1.name = teamsInput[1] || "TBD";
        updated.SF.p2.name = teamsInput[2] || "TBD";
        setMatches(updated);
        setChampion(null);
    };

    const handleClick = (matchId, playerKey) => {
        const updated = { ...matches };
        const m = updated[matchId];
        m[playerKey].score += 1;

        if (m.p1.name !== "TBD" && m.p2.name !== "TBD") {
            if (m.p1.score !== m.p2.score) {
                const winnerKey = m.p1.score > m.p2.score ? "p1" : "p2";
                m.winner = m[winnerKey].name;

                if (matchId === "SF") {
                    // Winner of SF goes to GF p2
                    updated.GF.p2.name = m.winner;
                    updated.GF.p2.score = 0;
                } else if (matchId === "GF") {
                    setChampion(m.winner);
                }
            }
        }

        setMatches(updated);
    };

    const renderMatch = (id, label) => {
        const m = matches[id];
        return (
            <div className="p-3 border rounded-lg bg-gray-800 text-white mb-6 w-44">
                <p className="font-bold mb-1 text-center">{label}</p>
                {["p1", "p2"].map((key) => (
                    <button
                        key={key}
                        onClick={() => handleClick(id, key)}
                        disabled={m[key].name === "TBD"}
                        className={`flex justify-between items-center w-full px-2 py-1 mb-1 rounded text-left ${m.winner === m[key].name ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"
                            }`}
                    >
                        <span>{m[key].name}</span>
                        <span className="ml-2 px-2 py-1 bg-gray-900 rounded border border-white w-8 text-center">{m[key].score}</span>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-gray-900 min-h-screen p-6 text-white flex flex-col items-center">
            <h1 className="text-2xl font-bold text-center mb-6">3-Team Single Elimination Bracket</h1>

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
                <button onClick={applyTeams} className="px-4 py-1 bg-blue-600 rounded text-white font-bold">Apply Teams</button>
            </div>

            {/* Matches */}
            <div className="flex flex-col items-center">
                {renderMatch("SF", "Semi-Final")}
                {renderMatch("GF", "Grand Final")}
            </div>

            {champion && (
                <div className="mt-6 text-center">
                    <h2 className="text-3xl font-bold text-yellow-400">🏆 Champion: {champion}</h2>
                </div>
            )}
        </div>
    );
}
