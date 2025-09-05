import React, { useState, useRef, useLayoutEffect } from "react";

export default function TwoTeamSingleElimination() {
    const [teamsInput, setTeamsInput] = useState(["", ""]);
    const [match, setMatch] = useState({
        M1: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null }
    });
    const [champion, setChampion] = useState(null);
    const boxRefs = useRef({});
    const [lines, setLines] = useState([]);

    const handleTeamChange = (index, value) => {
        const newTeams = [...teamsInput];
        newTeams[index] = value;
        setTeamsInput(newTeams);
    };

    const applyTeams = () => {
        const updated = { ...match };
        updated.M1.p1.name = teamsInput[0] || "TBD";
        updated.M1.p2.name = teamsInput[1] || "TBD";
        setMatch(updated);
        setChampion(null);
    };

    const handleClick = (playerKey) => {
        const updated = { ...match };
        const m = updated.M1;
        m[playerKey].score += 1;

        if (m.p1.name !== "TBD" && m.p2.name !== "TBD") {
            if (m.p1.score !== m.p2.score) {
                const winnerKey = m.p1.score > m.p2.score ? "p1" : "p2";
                m.winner = m[winnerKey].name;
                setChampion(m.winner);
            }
        }

        setMatch(updated);
    };

    const renderMatch = () => {
        const m = match.M1;
        return (
            <div
                id="M1"
                ref={(el) => (boxRefs.current["M1"] = el)}
                className="p-3 border rounded-lg bg-gray-800 text-white mb-6 w-44 relative"
            >
                <p className="font-bold mb-1">Match 1</p>
                {["p1", "p2"].map((key) => (
                    <button
                        key={key}
                        onClick={() => handleClick(key)}
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
        <div className="bg-gray-900 min-h-screen p-6 text-white">
            <h1 className="text-2xl font-bold text-center mb-6">2-Team Single Elimination Bracket</h1>

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

            <div className="flex flex-col items-center">
                {renderMatch()}
            </div>

            {champion && (
                <div className="mt-6 text-center">
                    <h2 className="text-3xl font-bold text-yellow-400">🏆 Champion: {champion}</h2>
                </div>
            )}
        </div>
    );
}
