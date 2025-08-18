import React, { useState, useRef } from "react";

export default function DoubleEliminationBracket() {
    const boxW = 120;
    const boxH = 60;
    const hSpace = 70;
    const vSpace = 10;

    const containerRef = useRef(null);

    const [teams, setTeams] = useState(Array(8).fill(""));
    const [upper, setUpper] = useState([]);
    const [lower, setLower] = useState([]);
    const [grandFinal, setGrandFinal] = useState({
        id: "gf",
        team1: "TBD",
        team2: "TBD",
        winner: null,
        loser: null,
    });
    const [champion, setChampion] = useState(null);

    const handleTeamChange = (index, value) => {
        const updated = [...teams];
        updated[index] = value;
        setTeams(updated);
    };

    const initializeBracket = () => {
        if (teams.some((t) => t.trim() === "")) return alert("All 8 teams must be entered!");

        const u = [
            [
                { id: "u1-0", team1: teams[0], team2: teams[1], winner: null, loser: null },
                { id: "u1-1", team1: teams[2], team2: teams[3], winner: null, loser: null },
                { id: "u1-2", team1: teams[4], team2: teams[5], winner: null, loser: null },
                { id: "u1-3", team1: teams[6], team2: teams[7], winner: null, loser: null },
            ],
            [
                { id: "u2-0", team1: "TBD", team2: "TBD", winner: null, loser: null },
                { id: "u2-1", team1: "TBD", team2: "TBD", winner: null, loser: null },
            ],
            [{ id: "u3-0", team1: "TBD", team2: "TBD", winner: null, loser: null }],
        ];

        const l = [
            [
                { id: "l1-0", team1: "TBD", team2: "TBD", winner: null, loser: null },
                { id: "l1-1", team1: "TBD", team2: "TBD", winner: null, loser: null },
            ],
            [
                { id: "l2-0", team1: "TBD", team2: "TBD", winner: null, loser: null },
                { id: "l2-1", team1: "TBD", team2: "TBD", winner: null, loser: null },
            ],
            [{ id: "l3-0", team1: "TBD", team2: "TBD", winner: null, loser: null }],
            [{ id: "l4-0", team1: "TBD", team2: "TBD", winner: null, loser: null }],
        ];

        setUpper(u);
        setLower(l);
        setGrandFinal({ id: "gf", team1: "TBD", team2: "TBD", winner: null, loser: null });
        setChampion(null);
    };

    const handleUpperWin = (rIdx, mIdx, winner) => {
        const u = upper.map((r) => r.map((m) => ({ ...m })));
        const match = u[rIdx][mIdx];
        match.winner = winner;
        match.loser = match.team1 === winner ? match.team2 : match.team1;

        const loser = match.loser;

        if (rIdx < u.length - 1) {
            const next = u[rIdx + 1][Math.floor(mIdx / 2)];
            if (next.team1 === "TBD") next.team1 = winner;
            else next.team2 = winner;
        } else {
            setGrandFinal((prev) => ({ ...prev, team1: winner }));
        }
        setUpper(u);
        sendToLower(loser, rIdx, mIdx);
    };

    const sendToLower = (loser, rIdx, mIdx) => {
        const l = lower.map((r) => r.map((m) => ({ ...m })));
        if (rIdx === 0) {
            const slot = l[0][Math.floor(mIdx / 2)];
            if (slot.team1 === "TBD") slot.team1 = loser;
            else slot.team2 = loser;
        } else if (rIdx === 1) {
            l[1][mIdx].team2 = loser;
        } else if (rIdx === 2) {
            l[3][0].team2 = loser;
        }
        setLower(l);
    };

    const handleLowerWin = (rIdx, mIdx, winner) => {
        const l = lower.map((r) => r.map((m) => ({ ...m })));
        const match = l[rIdx][mIdx];
        match.winner = winner;
        match.loser = match.team1 === winner ? match.team2 : match.team1;

        if (rIdx === 0) {
            const nextMatch = l[1][mIdx];
            if (nextMatch.team1 === "TBD") nextMatch.team1 = winner;
            else nextMatch.team2 = winner;
        } else if (rIdx === 1) {
            const nextMatch = l[2][0];
            if (nextMatch.team1 === "TBD") nextMatch.team1 = winner;
            else nextMatch.team2 = winner;
        } else if (rIdx === 2) {
            const nextMatch = l[3][0];
            if (nextMatch.team1 === "TBD") nextMatch.team1 = winner;
            else nextMatch.team2 = winner;
        } else if (rIdx === 3) {
            setGrandFinal((prev) => ({ ...prev, team2: winner }));
        }
        setLower(l);
    };

    const handleGrandWin = (winner) => {
        setGrandFinal((prev) => ({
            ...prev,
            winner,
            loser: prev.team1 === winner ? prev.team2 : prev.team1,
        }));
        setChampion(winner);
    };

    const Box = ({ match, onWin, bracket, id }) => {
        const getBgColor = () => {
            if (match.winner) return "#4fd1c5"; // winner green
            if (bracket === "Upper") return "#63b3ed"; // upper blue
            if (bracket === "Lower") return "#faf089"; // lower yellow
            return "#fbb6ce"; // grand final pink
        };

        return (
            <div style={{ position: "relative", marginBottom: 30, width: boxW }}>
                {/* Box */}
                <div
                    id={id || match.id}
                    className="box"
                    style={{
                        width: "100%",
                        minHeight: boxH,
                        background: getBgColor(),
                        border: "2px solid #2b6cb0",
                        borderRadius: 15,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "5px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        textAlign: "center",
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.03)";
                        e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.25)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                    }}
                >
                    <div
                        style={{
                            fontWeight: "600",
                            fontSize: 14,
                            textDecoration: match.loser === match.team1 ? "line-through" : "none",
                            color: "#1a202c",
                            marginBottom: 2,
                        }}
                    >
                        {match.team1}
                    </div>

                    <div style={{ fontSize: 12, color: "#2d3748", margin: "2px 0", fontWeight: "500" }}>
                        vs
                    </div>

                    <div
                        style={{
                            fontWeight: "600",
                            fontSize: 14,
                            textDecoration: match.loser === match.team2 ? "line-through" : "none",
                            color: "#1a202c",
                            marginTop: 2,
                        }}
                    >
                        {match.team2}
                    </div>
                </div>

                {/* Horizontal Buttons */}
                {!match.winner && match.team1 !== "TBD" && match.team2 !== "TBD" && (
                    <div
                        style={{
                            position: "absolute",
                            top: boxH + 10,
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            gap: 8, // horizontal spacing
                        }}
                    >
                        <button
                            onClick={() => onWin(match.team1)}
                            style={{
                                padding: "4px 8px",
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                backgroundColor: "#3182ce",
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: 12,
                                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                            }}
                        >
                            {match.team1} Wins
                        </button>
                        <button
                            onClick={() => onWin(match.team2)}
                            style={{
                                padding: "4px 8px",
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                backgroundColor: "#3182ce",
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: 12,
                                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                            }}
                        >
                            {match.team2} Wins
                        </button>
                    </div>
                )}
            </div>
        );
    };






    const renderLines = () => {
        const lines = [];
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return lines;

        const drawY = (fromBox1, fromBox2, toBox) => {
            if (!fromBox1 || !fromBox2 || !toBox) return;

            const r1 = fromBox1.getBoundingClientRect();
            const r2 = fromBox2.getBoundingClientRect();
            const rTo = toBox.getBoundingClientRect();

            const y1 = r1.top + r1.height / 2 - containerRect.top;
            const y2 = r2.top + r2.height / 2 - containerRect.top;
            const x1 = r1.right - containerRect.left;
            const x2 = r2.right - containerRect.left;
            const xTo = rTo.left - containerRect.left;
            const yTo = rTo.top + rTo.height / 2 - containerRect.top;

            const midX = xTo - 20;

            lines.push(
                <div
                    key={`h1-${lines.length}`}
                    style={{ position: "absolute", top: y1, left: x1, width: midX - x1, height: 2, background: "#000" }}
                />
            );
            lines.push(
                <div
                    key={`h2-${lines.length}`}
                    style={{ position: "absolute", top: y2, left: x2, width: midX - x2, height: 2, background: "#000" }}
                />
            );

            const yTop = Math.min(y1, y2);
            const yBottom = Math.max(y1, y2);
            lines.push(
                <div
                    key={`v-${lines.length}`}
                    style={{ position: "absolute", top: yTop, left: midX, width: 2, height: yBottom - yTop, background: "#000" }}
                />
            );

            lines.push(
                <div
                    key={`h3-${lines.length}`}
                    style={{ position: "absolute", top: yTo, left: midX, width: xTo - midX, height: 2, background: "#000" }}
                />
            );
        };

        const drawHorizontalOnly = (fromBox, toBox) => {
            if (!fromBox || !toBox) return;
            const r = fromBox.getBoundingClientRect();
            const rTo = toBox.getBoundingClientRect();
            const y = r.top + r.height / 2 - containerRect.top;
            const xStart = r.right - containerRect.left;
            const xEnd = rTo.left - containerRect.left;
            lines.push(
                <div
                    key={`hline-${lines.length}`}
                    style={{ position: "absolute", top: y, left: xStart, width: xEnd - xStart, height: 2, background: "#000" }}
                />
            );
        };

        // Upper bracket lines
        const upperCols = containerRef.current?.querySelectorAll(".upper > div");
        if (upperCols) {
            for (let i = 0; i < upperCols.length - 1; i++) {
                const currentCol = upperCols[i];
                const nextCol = upperCols[i + 1];
                const boxes = currentCol.querySelectorAll(".box");
                const nextBoxes = nextCol.querySelectorAll(".box");
                for (let j = 0; j < nextBoxes.length; j++) {
                    drawY(boxes[j * 2], boxes[j * 2 + 1], nextBoxes[j]);
                }
            }
        }

        // Lower bracket lines
        const lowerCols = containerRef.current?.querySelectorAll(".lower > div");
        if (lowerCols) {
            for (let i = 0; i < lowerCols.length - 1; i++) {
                const currentCol = lowerCols[i];
                const nextCol = lowerCols[i + 1];
                const boxes = currentCol.querySelectorAll(".box");
                const nextBoxes = nextCol.querySelectorAll(".box");

                for (let j = 0; j < nextBoxes.length; j++) {
                    const nextBox = nextBoxes[j];
                    if (!nextBox) continue;

                    if (boxes.length === 1) {
                        drawHorizontalOnly(boxes[0], nextBox);
                    } else if (i === 0) {
                        drawHorizontalOnly(boxes[j * 2], nextBox);
                        drawHorizontalOnly(boxes[j * 2 + 1], nextBox);
                    } else {
                        drawY(boxes[j * 2], boxes[j * 2 + 1], nextBox);
                    }
                }
            }
        }

        // Connect Upper R3 and Lower L4 to Grand Final using Y-lining
        const grandBox = containerRef.current?.querySelector("#GrandFinalBox");
        if (grandBox && upper[2] && upper[2][0] && lower[3] && lower[3][0]) {
            const upperBox = containerRef.current.querySelector(`#${upper[2][0].id}`);
            const lowerBox = containerRef.current.querySelector(`#${lower[3][0].id}`);
            drawY(upperBox, lowerBox, grandBox);
        }


        return lines;
    };

    return (
        <div style={{ padding: 20, position: "relative" }} ref={containerRef}>


            {upper.length === 0 && (
                <div style={{ marginBottom: 20, textAlign: "center", display: "flex", flexDirection: "column", gap: 5 }}>
                    {teams.map((team, idx) => (
                        <input
                            key={idx}
                            type="text"
                            value={team}
                            onChange={(e) => handleTeamChange(idx, e.target.value)}
                            placeholder={`Team ${idx + 1}`}
                            style={{ width: 200, alignSelf: "center" }}
                        />
                    ))}
                    <button style={{ marginTop: 10 }} onClick={initializeBracket}>Start Bracket</button>
                </div>
            )}

            {upper.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Upper Bracket Label */}
                    <div style={{ marginBottom: 1, textAlign: "center", fontWeight: "bold", fontSize: 18 }}>
                        Upper Bracket
                    </div>

                    {/* Upper Bracket */}
                    <div className="upper" style={{ display: "flex", justifyContent: "flex-start", gap: hSpace }}>
                        {upper.map((round, rIdx) => (
                            <div key={rIdx} style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: rIdx === 1 ? 120 : vSpace }}>
                                {round.map((m, idx) => (
                                    <Box key={m.id} match={m} onWin={(w) => handleUpperWin(rIdx, idx, w)} bracket="Upper" />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Lower Bracket Label */}
                    <div style={{ margin: "20px 0 10px 0", textAlign: "center", fontWeight: "bold", fontSize: 18 }}>
                        Lower Bracket
                    </div>

                    {/* Lower Bracket */}
                    <div className="lower" style={{ display: "flex", justifyContent: "flex-start", gap: hSpace }}>
                        {lower.map((round, rIdx) => (
                            <div key={rIdx} style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: vSpace }}>
                                {round.map((m, idx) => (
                                    <Box key={m.id} match={m} onWin={(w) => handleLowerWin(rIdx, idx, w)} bracket="Lower" />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Grand Final container */}
                    <div
                        style={{
                            position: "absolute",
                            left: "70%",
                            top: "45%",
                            transform: "translate(-50%, -50%)",
                        }}
                    >
                        <h4 style={{ textAlign: "center" }}>Grand Final</h4>

                        <div style={{ position: "relative", display: "inline-block" }}>
                            <Box match={grandFinal} onWin={handleGrandWin} bracket="GrandFinal" id="GrandFinalBox" />

                            {champion && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "100%",
                                        transform: "translate(10px, -50%)",
                                        whiteSpace: "nowrap",
                                        color: "#e53e3e",
                                        fontWeight: "bold",
                                    }}
                                >
                                    🏆 Champion: {champion} 🏆
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lines */}
                    {renderLines()}
                </div>
            )}

        </div>
    );
}
