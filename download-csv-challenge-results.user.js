// ==UserScript==
// @name         Download CSV of GeoGuessr Challenge Results
// @description  Download CSV of GeoGuessr Challenge Results
// @version      1.0
// @author       blitve
// @match        https://www.geoguessr.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @copyright    2026, blitve
// @license      CC BY-NC-SA
// @downloadURL  https://github.com/oumpaxikis/geo-scripts/raw/refs/heads/main/download-csv-challenge-results.user.js
// @updateURL    https://github.com/oumpaxikis/geo-scripts/raw/refs/heads/main/download-csv-challenge-results.user.js
// ==/UserScript==

let button = null;

function updateButton() {
    if (window.location.pathname.includes("results")) {
        if (!button) {
            button = document.createElement("button");
            button.textContent = "Download CSV";
            // ... all your button styling and click handler ...
            button.style.cssText = `
              position: fixed;
              bottom: 20px;
              right: 20px;
              z-index: 9999;
              padding: 10px 20px;
              background: #f00;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
            `;
            document.body.appendChild(button);
            button.addEventListener("click", async () => {
                button.textContent = "Exporting...";
                button.disabled = true;

                try {
                    const gameId = window.location.pathname.split("/").pop();
                    const apiUrl = `https://www.geoguessr.com/api/v3/results/highscores/${gameId}?friends=false&limit=9999`;
                    const response = await fetch(apiUrl);
                    const data = await response.json();

                    const firstPlayer = data.items[0].game.player;

                    const guessHeaders = firstPlayer.guesses.flatMap((_, i) => [
                        `R${i+1} Score`,
                        `R${i+1} Distance (m)`,
                        `R${i+1} Time (s)`,
                        `R${i+1} Steps`
                    ]);

                    const headers = [
                        "Nick",
                        "Total Score",
                        "Total Distance (m)",
                        "Total Time (s)",
                        "Total Steps",
                        ...guessHeaders
                    ];

                    const rows = data.items.map(item => {
                        const player = item.game.player;

                        // Base columns
                        const baseColumns = [
                            player.nick,
                            player.totalScore.amount,
                            player.totalDistanceInMeters,
                            player.totalTime,
                            player.totalStepsCount
                        ];

                        // Guess columns (5 rounds × 4 fields)
                        const guessColumns = player.guesses.flatMap(guess => [
                            guess.roundScoreInPoints,
                            guess.distanceInMeters,
                            guess.time,
                            guess.stepsCount
                        ]);

                        return [...baseColumns, ...guessColumns];
                    });

                    const allRows = [headers, ...rows];

                    //const csvContent = allRows.map(row => row.join(",")).join("\n");
                    const csvContent = allRows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
                    const blob = new Blob([csvContent], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);

                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `geoguessr_${gameId}.csv`;
                    a.click();

                    URL.revokeObjectURL(url);

                    button.textContent = "Done! ✓";
                } catch (err) {
                    console.error(err);
                    button.textContent = "Error ✗";
                }
            });
        }
    } else {
        if (button) {
            button.remove();
            button = null;
        }
    }
}

let lastUrl = window.location.pathname;

setInterval(() => {
    if (window.location.pathname === lastUrl) return;
    lastUrl = window.location.pathname;
    updateButton();
}, 1000);

updateButton();

