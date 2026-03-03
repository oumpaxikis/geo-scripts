# GeoGuessr Exporter

A TamperMonkey userscript that exports GeoGuessr challenge results to a CSV file.

## Installation

1. Install the [TamperMonkey](https://www.tampermonkey.net/) browser extension if you haven't already
2. Click the link below to install the script:

👉 **[Install GeoGuessr Exporter](https://raw.githubusercontent.com/oumpaxikis/geo-scripts/main/download-csv-challenge-results.js)**

TamperMonkey will open and ask you to confirm the installation. Click **Install**.

## Usage

1. Navigate to any GeoGuessr challenge results page, e.g.:
   `https://www.geoguessr.com/results/3tJajK5xnm0njyhp`
2. Click the **Download CSV** button in the bottom-right corner of the page
3. A CSV file will be downloaded named `geoguessr_GAMEID.csv`

## CSV Format

The exported file contains one row per player with the following columns:

| Column | Description |
|--------|-------------|
| Nick | Player username |
| Total Score | Overall score in points |
| Total Distance (m) | Total distance error in metres |
| Total Time (s) | Total time taken in seconds |
| Total Steps | Total steps taken |
| R1 Score ... R5 Score | Score for each round |
| R1 Distance ... R5 Distance | Distance error for each round |
| R1 Time ... R5 Time | Time taken for each round |
| R1 Steps ... R5 Steps | Steps taken for each round |

## Updates

TamperMonkey will automatically notify you when a new version is available.
