import React, { useState, useRef, useLayoutEffect } from "react";

export default function FiveTeamBracketVerticalSF() {
    const [teamsInput, setTeamsInput] = useState(["", "", "", "", ""]);
    const [matches, setMatches] = useState({
        R1: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null },
        SF1: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null },
        SF2: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null },
        GF: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null },
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
        const updated = { ...matches };
        updated.R1.p1.name = teamsInput[3] || "TBD";
        updated.R1.p2.name = teamsInput[4] || "TBD";
        updated.SF1.p1.name = teamsInput[0] || "TBD";
        updated.SF1.p2.name = "TBD"; // Winner of R1
        updated.SF2.p1.name = teamsInput[1] || "TBD";
        updated.SF2.p2.name = teamsInput[2] || "TBD";
        setMatches(updated);
        setChampion(null);
    };

    const handleClick = (matchId, playerKey) => {
        const updated = { ...matches };
        const m = updated[matchId];
        m[playerKey].score += 1;

        if (m.p1.name !== "TBD" && m.p2.name !== "TBD" && m.p1.score !== m.p2.score) {
            const winnerKey = m.p1.score > m.p2.score ? "p1" : "p2";
            m.winner = m[winnerKey].name;

            if (matchId === "R1") updated.SF1.p2.name = m.winner;
            else if (matchId === "SF1") updated.GF.p1.name = m.winner;
            else if (matchId === "SF2") updated.GF.p2.name = m.winner;
            else if (matchId === "GF") setChampion(m.winner);
        }

        setMatches(updated);
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

    // Draw straight L-shaped lines
    useLayoutEffect(() => {
        const container = document.getElementById("bracket-container");
        if (!container) return;

        const connections = [
            ["R1", "SF1"],
            ["SF1", "GF"],
            ["SF2", "GF"]
        ];

        const newLines = connections.map(([fromId, toId]) => {
            const from = boxRefs.current[fromId];
            const to = boxRefs.current[toId];
            if (!from || !to) return null;

            const fromBox = from.getBoundingClientRect();
            const toBox = to.getBoundingClientRect();
            const containerBox = container.getBoundingClientRect();

            const startX = fromBox.right - containerBox.left;
            const startY = fromBox.top + fromBox.height / 2 - containerBox.top;
            const endX = toBox.left - containerBox.left;
            const endY = toBox.top + toBox.height / 2 - containerBox.top;

            const midX = startX + (endX - startX) / 2;

            return `M${startX},${startY} H${midX} V${endY} H${endX}`;
        }).filter(Boolean);

        setLines(newLines);
    }, [matches]);

    return (
        <div className="bg-gray-900 min-h-screen p-6 text-white">
            <h1 className="text-2xl font-bold text-center mb-6">5-Team Bracket (Vertical SF)</h1>

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
            </div>

            <div id="bracket-container" className="relative flex justify-center items-start gap-24">
                {/* Left column: Round 1 */}
                <div className="flex flex-col gap-48">
                    {renderMatch("R1", "Round 1")}
                </div>

                {/* Middle column: SF1 & SF2 vertical */}
                <div className="flex flex-col gap-24 mt-12">
                    {renderMatch("SF1", "Semi-Final 1")}
                    {renderMatch("SF2", "Semi-Final 2")}
                </div>

                {/* Right column: Grand Final slightly to the right */}
                <div className="relative mt-24 ml-12">
                    {renderMatch("GF", "Grand Final")}

                    {champion && (
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-6">
                            <h2 className="text-3xl font-bold text-yellow-400">🏆 {champion}</h2>
                        </div>
                    )}
                </div>

                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {lines.map((d, i) => (
                        <path key={i} d={d} stroke="white" strokeWidth="2" fill="none" />
                    ))}
                </svg>
            </div>
        </div>
    );
}
