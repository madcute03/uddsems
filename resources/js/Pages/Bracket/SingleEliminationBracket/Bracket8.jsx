import React, { useState, useRef, useLayoutEffect } from "react";

export default function EightTeamBracketResponsive() {
    const [teamsInput, setTeamsInput] = useState(Array(8).fill(""));
    const [matches, setMatches] = useState({
        R1A: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null },
        R1B: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null },
        R1C: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null },
        R1D: { p1: { name: "TBD", score: 0 }, p2: { name: "TBD", score: 0 }, winner: null },
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
        updated.R1A.p1.name = teamsInput[0] || "TBD";
        updated.R1A.p2.name = teamsInput[7] || "TBD";
        updated.R1B.p1.name = teamsInput[3] || "TBD";
        updated.R1B.p2.name = teamsInput[4] || "TBD";
        updated.R1C.p1.name = teamsInput[1] || "TBD";
        updated.R1C.p2.name = teamsInput[6] || "TBD";
        updated.R1D.p1.name = teamsInput[2] || "TBD";
        updated.R1D.p2.name = teamsInput[5] || "TBD";

        updated.SF1.p1.name = "TBD";
        updated.SF1.p2.name = "TBD";
        updated.SF2.p1.name = "TBD";
        updated.SF2.p2.name = "TBD";

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

            if (matchId === "R1A") updated.SF1.p1.name = m.winner;
            else if (matchId === "R1B") updated.SF1.p2.name = m.winner;
            else if (matchId === "R1C") updated.SF2.p1.name = m.winner;
            else if (matchId === "R1D") updated.SF2.p2.name = m.winner;
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
                className="p-3 border rounded-lg bg-gray-800 text-white mb-6 w-full max-w-xs relative"
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

    useLayoutEffect(() => {
        const container = document.getElementById("bracket-container");
        if (!container) return;

        const connections = [
            ["R1A", "SF1"],
            ["R1B", "SF1"],
            ["R1C", "SF2"],
            ["R1D", "SF2"],
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
        <div className="bg-gray-900 min-h-screen p-4 text-white">
            <h1 className="text-2xl font-bold text-center mb-4">8-Team Responsive Bracket</h1>

            <div className="flex flex-wrap gap-2 justify-center mb-4">
                {teamsInput.map((team, i) => (
                    <input
                        key={i}
                        type="text"
                        value={team}
                        onChange={(e) => handleTeamChange(i, e.target.value)}
                        placeholder={`Team ${i + 1}`}
                        className="px-2 py-1 rounded text-black flex-1 min-w-[80px]"
                    />
                ))}
                <button onClick={applyTeams} className="px-4 py-1 bg-blue-600 rounded text-white font-bold">Apply Teams</button>
            </div>

            <div
                id="bracket-container"
                className="relative flex flex-col md:flex-row flex-wrap justify-center items-start gap-8 md:gap-24"
            >
                {/* Round 1 column */}
                <div className="flex flex-col md:gap-6 gap-4">{renderMatch("R1A", "Round 1")}{renderMatch("R1B", "Round 1")}{renderMatch("R1C", "Round 1")}{renderMatch("R1D", "Round 1")}</div>

                {/* Semi-Finals column */}
                <div className="flex flex-col md:gap-12 gap-6 mt-4 md:mt-12">{renderMatch("SF1", "Semi-Final 1")}{renderMatch("SF2", "Semi-Final 2")}</div>

                {/* Grand Final column */}
                <div className="relative mt-4 md:mt-24 ml-0 md:ml-12 w-full max-w-xs">
                    {renderMatch("GF", "Grand Final")}
                    {champion && (
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-4 md:ml-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-yellow-400">🏆 {champion}</h2>
                        </div>
                    )}
                </div>

                {/* Lines */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {lines.map((d, i) => (
                        <path key={i} d={d} stroke="white" strokeWidth="2" fill="none" />
                    ))}
                </svg>
            </div>
        </div>
    );
}
