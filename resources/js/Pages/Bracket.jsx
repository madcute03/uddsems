import React, { useState, useRef } from "react";

export default function DoubleEliminationBracket() {
    const boxW = 160;
    const boxH = 70;
    const hSpace = 100;
    const vSpace = 30;

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

    const Box = ({ match, onWin, bracket, id }) => (
        <div
            id={id || match.id}
            className="box"
            style={{
                width: boxW,
                height: boxH,
                background: match.winner
                    ? "linear-gradient(135deg, #68D391, #48BB78)"
                    : bracket === "Upper"
                        ? "linear-gradient(135deg, #63B3ED, #4299E1)"
                        : bracket === "Lower"
                            ? "linear-gradient(135deg, #F6E05E, #ECC94B)"
                            : "#FBB6CE",
                borderRadius: 15,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
                marginBottom: vSpace,
                color: "#1a202c",
                fontFamily: "sans-serif",
            }}
        >
            <div style={{ fontWeight: "bold", textDecoration: match.loser === match.team1 ? "line-through" : "none" }}>
                {match.team1}
            </div>
            <div style={{ fontSize: 12, margin: "2px 0" }}>vs</div>
            <div style={{ fontWeight: "bold", textDecoration: match.loser === match.team2 ? "line-through" : "none" }}>
                {match.team2}
            </div>
            {!match.winner && match.team1 !== "TBD" && match.team2 !== "TBD" && (
                <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
                    <button
                        style={{
                            padding: "4px 8px",
                            borderRadius: 6,
                            border: "none",
                            cursor: "pointer",
                            background: "#3182ce",
                            color: "#fff",
                            transition: "0.2s",
                        }}
                        onClick={() => onWin(match.team1)}
                        onMouseOver={(e) => (e.target.style.background = "#2c5282")}
                        onMouseOut={(e) => (e.target.style.background = "#3182ce")}
                    >
                        {match.team1} Wins
                    </button>
                    <button
                        style={{
                            padding: "4px 8px",
                            borderRadius: 6,
                            border: "none",
                            cursor: "pointer",
                            background: "#e53e3e",
                            color: "#fff",
                            transition: "0.2s",
                        }}
                        onClick={() => onWin(match.team2)}
                        onMouseOver={(e) => (e.target.style.background = "#9b2c2c")}
                        onMouseOut={(e) => (e.target.style.background = "#e53e3e")}
                    >
                        {match.team2} Wins
                    </button>
                </div>
            )}
        </div>
    );

    // The renderLines function can stay the same for simplicity
    const renderLines = () => {
        const lines = [];
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return lines;

        const drawCurve = (fromBox1, fromBox2, toBox) => {
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

            // Draw cubic Bézier curve from each box to the destination
            const path1 = `M${x1},${y1} C${x1 + 40},${y1} ${xTo - 40},${yTo} ${xTo},${yTo}`;
            const path2 = `M${x2},${y2} C${x2 + 40},${y2} ${xTo - 40},${yTo} ${xTo},${yTo}`;

            lines.push(
                <path key={`curve1-${lines.length}`} d={path1} stroke="#333" strokeWidth={2} fill="none" />
            );
            lines.push(
                <path key={`curve2-${lines.length}`} d={path2} stroke="#333" strokeWidth={2} fill="none" />
            );
        };

        const drawHorizontalCurve = (fromBox, toBox) => {
            if (!fromBox || !toBox) return;

            const r = fromBox.getBoundingClientRect();
            const rTo = toBox.getBoundingClientRect();

            const y = r.top + r.height / 2 - containerRect.top;
            const xStart = r.right - containerRect.left;
            const xEnd = rTo.left - containerRect.left;

            const path = `M${xStart},${y} C${xStart + 30},${y} ${xEnd - 30},${y} ${xEnd},${y}`;
            lines.push(<path key={`hcurve-${lines.length}`} d={path} stroke="#333" strokeWidth={2} fill="none" />);
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
                    drawCurve(boxes[j * 2], boxes[j * 2 + 1], nextBoxes[j]);
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

                    if (boxes.length === 1) drawHorizontalCurve(boxes[0], nextBox);
                    else if (i === 0) {
                        drawHorizontalCurve(boxes[j * 2], nextBox);
                        drawHorizontalCurve(boxes[j * 2 + 1], nextBox);
                    } else {
                        drawCurve(boxes[j * 2], boxes[j * 2 + 1], nextBox);
                    }
                }
            }
        }

        // Connect Upper R3 and Lower L4 to Grand Final
        const grandBox = containerRef.current?.querySelector("#GrandFinalBox");
        if (grandBox && upper[2] && upper[2][0] && lower[3] && lower[3][0]) {
            const upperBox = containerRef.current.querySelector(`#${upper[2][0].id}`);
            const lowerBox = containerRef.current.querySelector(`#${lower[3][0].id}`);
            drawCurve(upperBox, lowerBox, grandBox);
        }

        return (
            <svg
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            >
                {lines}
            </svg>
        );
    };


    return (
        <div style={{ padding: 20, position: "relative", background: "#f7fafc", minHeight: "100vh" }} ref={containerRef}>
            <h2 style={{ textAlign: "center", fontFamily: "sans-serif", marginBottom: 30 }}>🏆 Double Elimination Bracket (8 Teams) 🏆</h2>

            {upper.length === 0 && (
                <div style={{ marginBottom: 20, textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
                    {teams.map((team, idx) => (
                        <input
                            key={idx}
                            type="text"
                            value={team}
                            onChange={(e) => handleTeamChange(idx, e.target.value)}
                            placeholder={`Team ${idx + 1}`}
                            style={{
                                width: 250,
                                alignSelf: "center",
                                padding: 8,
                                borderRadius: 8,
                                border: "1px solid #cbd5e0",
                                fontFamily: "sans-serif",
                                fontSize: 14,
                            }}
                        />
                    ))}
                    <button
                        style={{
                            marginTop: 15,
                            padding: "8px 16px",
                            borderRadius: 10,
                            border: "none",
                            background: "#3182ce",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: 16,
                        }}
                        onClick={initializeBracket}
                        onMouseOver={(e) => (e.target.style.background = "#2c5282")}
                        onMouseOut={(e) => (e.target.style.background = "#3182ce")}
                    >
                        Start Bracket
                    </button>
                </div>
            )}

            {upper.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
                    {/* Upper Bracket */}
                    <div className="upper" style={{ display: "flex", justifyContent: "flex-start", gap: hSpace }}>
                        {upper.map((round, rIdx) => (
                            <div key={rIdx} style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: vSpace }}>
                                {round.map((m, idx) => (
                                    <Box key={m.id} match={m} onWin={(w) => handleUpperWin(rIdx, idx, w)} bracket="Upper" />
                                ))}
                            </div>
                        ))}
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

                    {/* Grand Final */}
                    <div style={{ position: "absolute", left: "70%", top: "45%", transform: "translate(-50%, -50%)" }}>
                        <h4 style={{ textAlign: "center", fontFamily: "sans-serif", marginBottom: 10 }}>Grand Final</h4>
                        <div style={{ position: "relative", display: "inline-block" }}>
                            <Box match={grandFinal} onWin={handleGrandWin} bracket="GrandFinal" id="GrandFinalBox" />
                            {champion && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "100%",
                                        transform: "translate(12px, -50%)",
                                        whiteSpace: "nowrap",
                                        color: "#d69e2e",
                                        fontWeight: "bold",
                                        fontSize: 16,
                                        textShadow: "0 1px 3px rgba(0,0,0,0.3)",
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
