// ==UserScript==
// @name         blitve's training mode
// @description  Extension to Geoguesser Training Mode by miraclewhips. Adds saving to map in-round, clickable streetview, and more.
// @version      1.0
// @author       blitve
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_openInTab
// @copyright    2026, blitve
// @license      MIT
// @downloadURL  https://github.com/oumpaxikis/geo-scripts/raw/refs/heads/main/blitve-training-mode.user.js
// @updateURL    https://github.com/oumpaxikis/geo-scripts/raw/refs/heads/main/blitve-training-mode.user.js
// ==/UserScript==

// Original Copyright 2022, miraclewhips 

/* ----- API KEY INSTRUCTIONS -----

Requires an API key from Map Making App in order to save locations.
Create one here: https://map-making.app/keys
Make sure not to share this key with anybody or show it publically as it will allow anybody to edit your maps.

Paste your generated API key in the next line (make sure not to delete the quotes surrounding the key) */
const MAP_MAKING_API_KEY = "PASTE_YOUR_KEY_HERE";




/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

if (window.frameElement) return;

const script = document.createElement('script');
script.textContent = `
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    console.log('BTM: Route changed to:', args[2]); // args[2] is the new URL
    window.dispatchEvent(new CustomEvent('spa-route-change', { detail: { url: args[2] } }));
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    console.log('BTM: Route replaced with:', args[2]);
    window.dispatchEvent(new CustomEvent('spa-route-change', { detail: { url: args[2] } }));
  };
`;
document.documentElement.appendChild(script);
script.remove();

// Event Framework
(function () {
    var __awaiter = this && this.__awaiter || function (c, R, t, i) { function o(n) { return n instanceof t ? n : new t(function (s) { s(n) }) } return new (t || (t = Promise))(function (n, s) { function l(r) { try { u(i.next(r)) } catch (a) { s(a) } } function v(r) { try { u(i.throw(r)) } catch (a) { s(a) } } function u(r) { r.done ? n(r.value) : o(r.value).then(l, v) } u((i = i.apply(c, R || [])).next()) }) }; const THE_WINDOW = unsafeWindow || window; (function () { class c { constructor() { this.events = new EventTarget, this.state = this.defaultState(), this.loadState(), this.initFetchEvents(), this.overrideFetch(), this.init(), THE_WINDOW.addEventListener("load", () => { var t, i, o; if (location.pathname.startsWith("/challenge/")) { const n = (o = (i = (t = THE_WINDOW?.__NEXT_DATA__) === null || t === void 0 ? void 0 : t.props) === null || i === void 0 ? void 0 : i.pageProps) === null || o === void 0 ? void 0 : o.gameSnapshot; if (!n || !n.round) return; THE_WINDOW.GEFFetchEvents.dispatchEvent(new CustomEvent("received_data", { detail: n })) } }), THE_WINDOW.GEFFetchEvents.addEventListener("received_data", t => { this.parseData(t.detail) }) } initFetchEvents() { THE_WINDOW.GEFFetchEvents === void 0 && (THE_WINDOW.GEFFetchEvents = new EventTarget) } overrideFetch() { if (THE_WINDOW.fetch.isGEFFetch) return; const t = THE_WINDOW.fetch; THE_WINDOW.fetch = function () { return function (...i) { var o; return __awaiter(this, void 0, void 0, function* () { const n = i[0].toString(); if (n.match(/geoguessr\.com\/api\/v3\/games$/) && ((o = i[1]) === null || o === void 0 ? void 0 : o.method) === "POST") { const s = yield t.apply(THE_WINDOW, i), l = yield s.clone().json(); return l.round && THE_WINDOW.GEFFetchEvents.dispatchEvent(new CustomEvent("received_data", { detail: l })), s } if (/geoguessr.com\/api\/v3\/(games|challenges)\//.test(n) && n.indexOf("daily-challenge") === -1) { const s = yield t.apply(THE_WINDOW, i), l = yield s.clone().json(); return l.round && THE_WINDOW.GEFFetchEvents.dispatchEvent(new CustomEvent("received_data", { detail: l })), s } return t.apply(THE_WINDOW, i) }) } }(), THE_WINDOW.fetch.isGEFFetch = !0 } init() { return __awaiter(this, void 0, void 0, function* () { return this.loadedPromise || (this.loadedPromise = Promise.resolve(this)), yield this.loadedPromise }) } defaultState() { return { current_game_id: "", is_challenge_link: !1, current_round: 0, round_in_progress: !1, game_in_progress: !0, total_score: { amount: 0, unit: "points", percentage: 0 }, total_distance: { meters: { amount: 0, unit: "km" }, miles: { amount: 0, unit: "miles" } }, total_time: 0, rounds: [], map: { id: "", name: "" } } } parseData(t) { const i = t.player.guesses.length == t.round, o = t.round !== this.state.current_round || t.token !== this.state.current_game_id; i ? this.stopRound(t) : o && this.startRound(t) } loadState() { let t = window.localStorage.getItem("GeoGuessrEventFramework_STATE"); if (!t) return; let i = JSON.parse(t); i && (Object.assign(this.state, this.defaultState(), i), this.saveState()) } saveState() { window.localStorage.setItem("GeoGuessrEventFramework_STATE", JSON.stringify(this.state)) } hex2a(t) { const i = t.toString(); let o = ""; for (let n = 0; n < i.length; n += 2)o += String.fromCharCode(parseInt(i.substring(n, n + 2), 16)); return o } startRound(t) { this.state.current_round = t.round, this.state.round_in_progress = !0, this.state.game_in_progress = !0, this.state.current_game_id = t.token, this.state.is_challenge_link = t.type == "challenge", this.state.rounds = this.state.rounds.slice(0, t.round - 1), t && (this.state.map = { id: t.map, name: t.mapName }), this.saveState(), this.state.current_round === 1 && this.events.dispatchEvent(new CustomEvent("game_start", { detail: this.state })), this.events.dispatchEvent(new CustomEvent("round_start", { detail: this.state })) } stopRound(t) { var i, o, n, s, l, v, u, r, a, h, m, _, p, f, g, E, F, w, y, S, G, k, T, C, D, x, I, N, O, b; if (this.state.round_in_progress = !1, t) { const d = t.rounds[this.state.current_round - 1], e = t.player.guesses[this.state.current_round - 1]; if (!d || !e) return; this.state.rounds[this.state.current_round - 1] = { location: { lat: d.lat, lng: d.lng, heading: d.heading, pitch: d.pitch, zoom: d.zoom, panoId: d.panoId ? this.hex2a(d.panoId) : void 0 }, player_guess: { lat: e.lat, lng: e.lng }, score: { amount: parseFloat((i = e?.roundScore) === null || i === void 0 ? void 0 : i.amount) || 0, unit: ((o = e?.roundScore) === null || o === void 0 ? void 0 : o.unit) || "points", percentage: ((n = e?.roundScore) === null || n === void 0 ? void 0 : n.percentage) || 0 }, distance: { meters: { amount: parseFloat((l = (s = e?.distance) === null || s === void 0 ? void 0 : s.meters) === null || l === void 0 ? void 0 : l.amount) || 0, unit: ((u = (v = e?.distance) === null || v === void 0 ? void 0 : v.meters) === null || u === void 0 ? void 0 : u.unit) || "km" }, miles: { amount: parseFloat((a = (r = e?.distance) === null || r === void 0 ? void 0 : r.miles) === null || a === void 0 ? void 0 : a.amount) || 0, unit: ((m = (h = e?.distance) === null || h === void 0 ? void 0 : h.miles) === null || m === void 0 ? void 0 : m.unit) || "miles" } }, time: e?.time }, this.state.total_score = { amount: parseFloat((p = (_ = t?.player) === null || _ === void 0 ? void 0 : _.totalScore) === null || p === void 0 ? void 0 : p.amount) || 0, unit: ((g = (f = t?.player) === null || f === void 0 ? void 0 : f.totalScore) === null || g === void 0 ? void 0 : g.unit) || "points", percentage: ((F = (E = t?.player) === null || E === void 0 ? void 0 : E.totalScore) === null || F === void 0 ? void 0 : F.percentage) || 0 }, this.state.total_distance = { meters: { amount: parseFloat((S = (y = (w = t?.player) === null || w === void 0 ? void 0 : w.totalDistance) === null || y === void 0 ? void 0 : y.meters) === null || S === void 0 ? void 0 : S.amount) || 0, unit: ((T = (k = (G = t?.player) === null || G === void 0 ? void 0 : G.totalDistance) === null || k === void 0 ? void 0 : k.meters) === null || T === void 0 ? void 0 : T.unit) || "km" }, miles: { amount: parseFloat((x = (D = (C = t?.player) === null || C === void 0 ? void 0 : C.totalDistance) === null || D === void 0 ? void 0 : D.miles) === null || x === void 0 ? void 0 : x.amount) || 0, unit: ((O = (N = (I = t?.player) === null || I === void 0 ? void 0 : I.totalDistance) === null || N === void 0 ? void 0 : N.miles) === null || O === void 0 ? void 0 : O.unit) || "miles" } }, this.state.total_time = (b = t?.player) === null || b === void 0 ? void 0 : b.totalTime, this.state.map = { id: t.map, name: t.mapName } } this.saveState(), this.events.dispatchEvent(new CustomEvent("round_end", { detail: this.state })), this.state.current_round === 5 && this.events.dispatchEvent(new CustomEvent("game_end", { detail: this.state })) } } THE_WINDOW.GeoGuessrEventFramework || (THE_WINDOW.GeoGuessrEventFramework = new c, console.log("GeoGuessr Event Framework initialised: https://github.com/miraclewhips/geoguessr-event-framework")) })();
})();

const compassColors = {
    n: '#fd8f8f',
    ne: '#f8ce74',
    e: '#feff84',
    se: '#a3fa80',
    s: '#8affe2',
    sw: '#77aaf7',
    w: '#bb6ff5',
    nw: '#ffa1d6',
}

let MWGTM_SV, MWGTM_SVC, MWGTM_LABELS;
//let MWGTM_SV, MWGTM_M, MWGTM_SVC, MWGTM_LABELS;
let isHoveringFlag = false;
const allMapObjects = [];

GM_addStyle(`
.mwgtm-override-classic-compass button[class^="compass_compass__"],
body.mwgtm-compass-hidden button[class^="compass_compass__"],
body.mwgtm-compass-hidden div[class^="panorama-compass_compassContainer__"],
body.mwgtm-compass-hidden .mwgtm-compass {
	display: none !important;
}

.mwgtm-modal {
	position: fixed;
	inset: 0;
	z-index: 99999;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
}

.mwgtm-modal .dim {
	position: fixed;
	inset: 0;
	z-index: 0;
	background: rgba(0,0,0,0.75);
}

.mwgtm-modal .text {
	position: relative;
	z-index: 1;
}

.mwgtm-modal .inner {
	box-sizing: border-box;
	position: relative;
	z-index: 1;
	background: #fff;
	padding: 20px;
	margin: 20px;
	width: calc(100% - 40px);
	max-width: 500px;
	overflow: auto;
	color: #000;
	flex: 0 1 auto;
}

#mwgtm-loader {
	color: #fff;
	font-weight: bold;
}

#mwgtm-button {
	position: absolute;
	top: 20px;
	left: 20px;
	z-index: 100;
	background: var(--ds-color-purple-100);
	color: #fff;
	padding: 10px 15px;
	font-weight: bold;
	cursor: pointer;
	border-radius: 4px;
}

.btm-main-div {
	position: absolute;
	top: 5rem;
	right: 1rem;
	z-index: 9;
	display: flex;
	flex-direction: column;
	gap: 5px;
	align-items: flex-start;
}

.btm-main-div.in-round {
	top: 2.5rem;
    left: 1rem;
}

.btm-results-div {
	position: fixed;
	top: 80px;
	right: 80px;
	z-index: 9;
	display: flex;
	flex-direction: column;
	gap: 5px;
	align-items: flex-start;
}

.btm-container-div {
	top: 1rem;
	right: 1rem;
	z-index: 9;
	display: flex;
	flex-direction: column;
	gap: 5px;
	align-items: flex-start;
}

.mwgtm-title {
	--outline-color: rgb(48, 48, 204);
	font-size: 15px;
	font-weight: bold;
	text-shadow: var(--outline-color) 2px 0px 0px, var(--outline-color) 1.75517px 0.958851px 0px, var(--outline-color) 1.0806px 1.68294px 0px, var(--outline-color) 0.141474px 1.99499px 0px, var(--outline-color) -0.832294px 1.81859px 0px, var(--outline-color) -1.60229px 1.19694px 0px, var(--outline-color) -1.97998px 0.28224px 0px, var(--outline-color) -1.87291px -0.701566px 0px, var(--outline-color) -1.30729px -1.5136px 0px, var(--outline-color) -0.421592px -1.95506px 0px, var(--outline-color) 0.567324px -1.91785px 0px, var(--outline-color) 1.41734px -1.41108px 0px, var(--outline-color) 1.92034px -0.558831px 0px;
	position: relative;
	z-index: 1;
}

.mwgtm-subtitle {
	font-size: 12px;
	background: rgba(48, 48, 204, 0.4);
	padding: 3px 5px;
	border-radius: 5px;
	position: relative;
	z-index: 0;
	top: -8px;
	text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.mwgtm-subtitle a:hover {
	text-decoration: underline;
}

.btm-button {
	background: var(--ds-color-purple-100);
	padding: 6px 10px;
	border-radius: 5px;
	font-size: 12px;
	cursor: pointer;
	opacity: 0.75;
	transition: opacity 0.2s;
}

.btm-button:hover {
	opacity: 1;
}

#mwgtm-car-warning {
	position: absolute;
	bottom: 1rem;
	left: 50%;
	z-index: 100;
	transform: translateX(-50%);
	padding: 5px 10px;
	border-radius: 5px;
	font-weight: bold;
	color: #fff;
	background: #900;
}

#mwgtm-map-list h3 {
	margin-bottom: 10px;
}

#mwgtm-map-list .tag-input {
	display: block;
	width: 100%;
	font: inherit;
}

#mwgtm-map-list .maps {
	max-height: 200px;
	overflow-x: hidden;
	overflow-y: auto;
	font-size: 15px;
}

#mwgtm-map-list .map {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 20px;
	padding: 8px;
	transition: background 0.2s;
}

#mwgtm-map-list .map:nth-child(2n) {
	background: #f0f0f0;
}

#mwgtm-map-list .map-buttons:not(.is-added) .map-added {
	display: none !important;
}
#mwgtm-map-list .map-buttons.is-added .map-add {
	display: none !important;
}

#mwgtm-map-list .map-add {
	background: var(--ds-color-green-80);
	color: #fff;
	padding: 3px 6px;
	border-radius: 5px;
	font-size: 13px;
	font-weight: bold;
	cursor: pointer;
}

#mwgtm-map-list .map-added {
	background: #000;
	color: #fff;
	padding: 3px 6px;
	border-radius: 5px;
	font-size: 13px;
	font-weight: bold;
}

#mwgtm-timer {
    background: var(--ds-color-purple-100);
    padding: 6px 10px;
    border-radius: 5px;
    font-size: 12px;
    font-weight: bold;
    opacity: 0.75;
    color: #fff;
    min-width: 3.5em;
    text-align: center;
    font-variant-numeric: tabular-nums;
}

#btm-round-time {
    background: rgba(0, 0, 0, 0.5);
    padding: 6px 10px;
    border-radius: 5px;
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    text-align: center;
    font-variant-numeric: tabular-nums;
    cursor: default;
    user-select: none;
}

div[class^="panorama-compass_compassContainer__"] {
	background-color: var(--ds-color-black-80);
}

/* NW */
div[class^="panorama-compass_latitude___"]:nth-of-type(1) span[class^="panorama-compass_latitudeLabel__"] {
	color: ${compassColors.nw};
}
div[class^="panorama-compass_latitude___"]:nth-of-type(1) span[class^="panorama-compass_latitudeLines__"] {
	background-color: ${compassColors.nw};
}

/* N */
div[class^="panorama-compass_latitude___"]:nth-of-type(2) span[class^="panorama-compass_latitudeLabel__"] {
	color: ${compassColors.n};
}
div[class^="panorama-compass_latitude___"]:nth-of-type(2) span[class^="panorama-compass_latitudeLines__"] {
	background-color: ${compassColors.n};
}

/* NE */
div[class^="panorama-compass_latitude___"]:nth-of-type(3) span[class^="panorama-compass_latitudeLabel__"] {
	color: ${compassColors.ne};
}
div[class^="panorama-compass_latitude___"]:nth-of-type(3) span[class^="panorama-compass_latitudeLines__"] {
	background-color: ${compassColors.ne};
}

/* E */
div[class^="panorama-compass_latitude___"]:nth-of-type(4) span[class^="panorama-compass_latitudeLabel__"] {
	color: ${compassColors.e};
}
div[class^="panorama-compass_latitude___"]:nth-of-type(4) span[class^="panorama-compass_latitudeLines__"] {
	background-color: ${compassColors.e};
}

/* SE */
div[class^="panorama-compass_latitude___"]:nth-of-type(5) span[class^="panorama-compass_latitudeLabel__"] {
	color: ${compassColors.se};
}
div[class^="panorama-compass_latitude___"]:nth-of-type(5) span[class^="panorama-compass_latitudeLines__"] {
	background-color: ${compassColors.se};
}

/* S */
div[class^="panorama-compass_latitude___"]:nth-of-type(6) span[class^="panorama-compass_latitudeLabel__"] {
	color: ${compassColors.s};
}
div[class^="panorama-compass_latitude___"]:nth-of-type(6) span[class^="panorama-compass_latitudeLines__"] {
	background-color: ${compassColors.s};
}

/* SW */
div[class^="panorama-compass_latitude___"]:nth-of-type(7) span[class^="panorama-compass_latitudeLabel__"] {
	color: ${compassColors.sw};
}
div[class^="panorama-compass_latitude___"]:nth-of-type(7) span[class^="panorama-compass_latitudeLines__"] {
	background-color: ${compassColors.sw};
}

/* W */
div[class^="panorama-compass_latitude___"]:nth-of-type(8) span[class^="panorama-compass_latitudeLabel__"] {
	color: ${compassColors.w};
}
div[class^="panorama-compass_latitude___"]:nth-of-type(8) span[class^="panorama-compass_latitudeLines__"] {
	background-color: ${compassColors.w};
}

aside[class^="game_controls___"] {
	z-index: 9;
}

.mwgtm-compass {
	background: transparent;
	border: 0;
	height: 3rem;
	outline: none;
	padding: 0;
	position: absolute;
	-webkit-user-select: none;
	-moz-user-select: none;
	user-select: none;
	width: 3rem;
	left: 0;
	bottom: 14rem;
}

.mwgtm-compass .circle {
	border-radius: 100%;
	box-shadow: inset 0 0 0 0.75rem var(--ds-color-white);
	height: 100%;
	opacity: .4;
	width: 100%;
}

.mwgtm-compass .arrow {
	height: 3rem;
	left: calc(50% - 0.375rem);
	position: absolute;
	top: calc(50% - 1.5rem);
	width: 0.75rem;
}


`);

function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        const timer = setTimeout(() => {
            observer.disconnect();
            resolve(null); // give up
        }, timeout);

        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                clearTimeout(timer);
                observer.disconnect();
                resolve(el);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    });
}

function pointCompass() {
    const arrow = document.getElementById('mwgtm-compass-arrow');
    if (!MWGTM_SV || !arrow) return;

    const heading = MWGTM_SV.getPov().heading;
    arrow.style.transform = `rotate(${-heading}deg)`;
}

function startTimer() {
    MWGTM_STATE.timerStart = Date.now();

    if (MWGTM_STATE.timerInterval) clearInterval(MWGTM_STATE.timerInterval);

    MWGTM_STATE.timerInterval = setInterval(() => {
        const el = document.getElementById('mwgtm-timer');
        if (!el) return; // just wait until it appears

        const elapsed = Math.floor((Date.now() - MWGTM_STATE.timerStart) / 1000);
        const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const s = String(elapsed % 60).padStart(2, '0');
        el.textContent = `${m}:${s}`;
    }, 1000);
}

function stopTimer() {
    if (MWGTM_STATE.timerInterval) {
        clearInterval(MWGTM_STATE.timerInterval);
        MWGTM_STATE.timerInterval = null;
    }
    MWGTM_STATE.timerFinal = Math.floor((Date.now() - MWGTM_STATE.timerStart) / 1000);
}

function defaultState() {
    return {
        PLAYING_A_SEED: false,
        LOOKING_AT_RESULTS: false,
        ROUND_ACTIVE: false,
        timerStart: null,
        timerInterval: null,
        timerFinal: 0,
        compassHidden: false,
        terrainEnabled: false,
        satelliteEnabled: false,
        carSetting: 0,
        coverageEnabled: false,
        recentMaps: []
    }
}

function loadState() {
    let data = window.localStorage.getItem('mwgtm_state');
    if (!data) return;

    let dataJson = JSON.parse(data);
    if (!dataJson) return;

    Object.assign(MWGTM_STATE, defaultState(), dataJson);
    saveState();
}

function saveState() {
    window.localStorage.setItem('mwgtm_state', JSON.stringify(MWGTM_STATE));
}

var MWGTM_STATE = defaultState();
loadState();

const LOADED_CAR_SETTING = MWGTM_STATE.carSetting;

async function mmaFetch(url, options = {}) {
    const response = await fetch(new URL(url, 'https://map-making.app'), {
        ...options,
        headers: {
            accept: 'application/json',
            authorization: `API ${MAP_MAKING_API_KEY.trim()}`,
            ...options.headers
        }
    });
    if (!response.ok) {
        let message = 'Unknown error';
        try {
            const res = await response.json();
            if (res.message) {
                message = res.message;
            }
        } catch {
        }
        alert(`An error occurred while trying to connect to Map Making App. ${message}`);
        throw Object.assign(new Error(message), { response });
    }
    return response;
}
async function getMaps() {
    const response = await mmaFetch(`/api/maps`);
    const maps = await response.json();
    return maps;
}
async function importLocations(mapId, locations) {
    const response = await mmaFetch(`/api/maps/${mapId}/locations`, {
        method: 'post',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            edits: [{
                action: { type: 4 },
                create: locations,
                remove: []
            }]
        })
    });
    await response.json();
}

var LOCATION;
var GUESS;
var MAP_LIST;
var ROUND_NUMBER = 0;
var nextData = "";

if (!GeoGuessrEventFramework) {
    throw new Error('GeoGuessr Location Manager requires GeoGuessr Event Framework (https://github.com/miraclewhips/geoguessr-event-framework). Please include this before you include GeoGuessr Location Manager.');
}

function roundTimer() {
    const roundTimerDiv = document.createElement('div');
    roundTimerDiv.id = 'mwgtm-timer';
    roundTimerDiv.textContent = '00:00';
    return roundTimerDiv;
}

async function addButtonsInRound() {
    const container = document.querySelector(`div[class^="game_canvas__"]`);
    if (!container || document.getElementById('btm-in-round-div')) return;

    const element = document.createElement('div');
    element.id = 'btm-in-round-div';
    element.className = 'btm-main-div in-round';
    element.style.display = 'none';
    element.appendChild(saveToMapButton());
    element.appendChild(roundTimer());
    container.appendChild(element);

    const clock = await waitForElement('[class*="clock-timer"]', 2000);
    console.log("clock: " + clock);
    if (!clock) {
        element.style.display = '';
    }
    // toggleMapType('roadmap');
    // MWGTM_STATE.coverageEnabled = false;
    // toggleCoverage(MWGTM_STATE.coverageEnabled);
    // saveState();

    toggleMapType('roadmap');
    toggleCoverage(false);
}

function lookNorth() {
    if (!document.getElementById('mwgtm-opt-compass-north')) return;

    const settings = JSON.parse(window.localStorage.getItem('game-settings')) ?? { forbidRotating: false };
    if (settings.forbidRotating) return;

    if (MWGTM_SV) {
        let pov = MWGTM_SV.getPov();
        pov.heading = 0;
        MWGTM_SV.setPov(pov);
    }
}

function toggleCompass(hidden) {
    if (!document.getElementById('mwgtm-opt-compass-toggle')) return;

    if (typeof hidden === 'undefined') {
        hidden = !MWGTM_STATE.compassHidden;
    }

    document.body.classList.toggle('mwgtm-compass-hidden', hidden);
    document.getElementById('mwgtm-opt-compass-toggle').textContent = hidden ? 'COMPASS HIDDEN - [ H ]' : 'COMPASS VISIBLE - [ H ]';

    MWGTM_STATE.compassHidden = hidden;
    saveState();
}

function toggleMapType(mapType) {

    // Do not do anything if trying to change map type when not allowed
    const allowed = (MWGTM_STATE.LOOKING_AT_RESULTS || (MWGTM_STATE.PLAYING_A_SEED && (!MWGTM_STATE.ROUND_ACTIVE)));
    if (!allowed && !mapType === 'roadmap') return;

    // 3 lines can go
    console.log("All maps:", allMapObjects);
    // const index = getActiveMapIndex();
    // console.log("Active map index:", index); // -1 if not found

    // const activeMap = getActiveMap();

    // if (activeMap) {
    //     activeMap.setMapTypeId(mapType);
    //     // MWGTM_M.addListener('idle', () => {
    //     //     MWGTM_M.setMapTypeId(mapType);
    //     // });
    // } else {
    //     console.log("No map found to toggle type");
    // }
    if (allMapObjects.length == 0) console.log("No map found to toggle type");
    allMapObjects.forEach(map => map.setMapTypeId(mapType));

    if (mapType == 'roadmap') {
        MWGTM_STATE.satelliteEnabled = false;
        MWGTM_STATE.terrainEnabled = false;
    } else if (mapType == 'terrain') {
        MWGTM_STATE.satelliteEnabled = false;
        MWGTM_STATE.terrainEnabled = true;
    } else if (mapType == 'satellite') {
        MWGTM_STATE.satelliteEnabled = true;
        MWGTM_STATE.terrainEnabled = false;
    }

    const terrainButtons = document.querySelectorAll('.btm-terrain-button');
    for (const tb of terrainButtons) {
        if (mapType == 'roadmap') {
            tb.textContent = 'TERRAIN DISABLED - [ T ]';
        } else if (mapType == 'terrain') {
            tb.textContent = 'TERRAIN ENABLED - [ T ]';
        } else if (mapType == 'satellite') {
            tb.textContent = 'TERRAIN DISABLED - [ T ]';
        }
    }

    const satelliteButtons = document.querySelectorAll('.btm-satellite-button');
    for (const sb of satelliteButtons) {
        if (mapType == 'roadmap') {
            sb.textContent = 'SATELLITE DISABLED - [ S ]';
        } else if (mapType == 'terrain') {
            sb.textContent = 'SATELLITE DISABLED - [ S ]';
        } else if (mapType == 'satellite') {
            sb.textContent = 'SATELLITE ENABLED - [ S ]';
        }
    }

    saveState();

}

function toggleCar(setting) {
    if (!document.getElementById('mwgtm-opt-car')) return;

    if (typeof setting === 'undefined') {
        setting = (MWGTM_STATE.carSetting + 1) % 3
    }

    let label = 'CAR VISIBLE';
    switch (setting) {
        case 1: label = 'CAR MASK SLIM'; break;
        case 2: label = 'CAR MASK FULL'; break;
    }

    document.getElementById('mwgtm-opt-car').textContent = `${label} - [ M ]`;

    MWGTM_STATE.carSetting = setting;
    saveState();

    if (LOADED_CAR_SETTING !== setting) {
        showCarWarning();
    } else {
        hideCarWarning();
    }
}

function toggleCoverage(enabled) {
    const coverage_allowed = (MWGTM_STATE.LOOKING_AT_RESULTS || (MWGTM_STATE.PLAYING_A_SEED && (!MWGTM_STATE.ROUND_ACTIVE)))
    if (typeof enabled === 'undefined') {
        enabled = !MWGTM_STATE.coverageEnabled;
    }
    // Do not do anything if trying to enable coverage when not allowed
    if (!coverage_allowed && enabled) return;

    // 3 lines can go
    console.log("All maps:", allMapObjects);
    // const index = getActiveMapIndex();
    // console.log("Active map index:", index); // -1 if not found

    // const activeMap = getActiveMap();
    // if (!activeMap) console.log("No map found to toggle coverage");

    // if (MWGTM_SVC && activeMap) {
    //     if (enabled) {
    //         activeMap.overlayMapTypes.insertAt(0, MWGTM_SVC);
    //         activeMap.overlayMapTypes.insertAt(1, MWGTM_LABELS);
    //     } else {
    //         activeMap.overlayMapTypes.removeAt(1);
    //         activeMap.overlayMapTypes.removeAt(0);
    //     }
    // }

    if (allMapObjects.length == 0) console.log("No map found to toggle type");
    if (MWGTM_SVC) {
        allMapObjects.forEach(map => {
            if (enabled) {
                map.overlayMapTypes.insertAt(0, MWGTM_SVC);
                map.overlayMapTypes.insertAt(1, MWGTM_LABELS);
            } else {
                map.overlayMapTypes.removeAt(1);
                map.overlayMapTypes.removeAt(0);
            }
        });
    }

    const coverageButtons = document.querySelectorAll('.btm-coverage-button');

    for (const cb of coverageButtons) {
        cb.textContent = enabled ? 'COVERAGE VISIBLE - [ B ]' : 'COVERAGE HIDDEN - [ B ]';
    }

    MWGTM_STATE.coverageEnabled = enabled;
    saveState();
}

function showCarWarning() {
    const container = document.querySelector(`div[class^="game_canvas__"]`);
    if (!container || document.getElementById('mwgtm-car-warning')) return;

    const element = document.createElement('div');
    element.id = 'mwgtm-car-warning';
    element.textContent = 'MUST RELOAD PAGE FOR CAR MASK CHANGE TO TAKE EFFECT';
    container.appendChild(element);
}

function hideCarWarning() {
    const element = document.getElementById('mwgtm-car-warning');
    if (element) element.remove();
}

function showLoader() {
    if (document.getElementById('mwgtm-loader')) return;

    const element = document.createElement('div');
    element.id = 'mwgtm-loader';
    element.className = 'mwgtm-modal';
    element.innerHTML = `
		<div class="text">LOADING...</div>
		<div class="dim"></div>
	`;
    document.body.appendChild(element);
}

function hideLoader() {
    const element = document.getElementById('mwgtm-loader');
    if (element) element.remove();
}

async function clickedMapButton(e) {
    if (MAP_MAKING_API_KEY.startsWith('PASTE_YOUR_KEY')) {
        alert('An API Key is required in order to save locations to Map Making App. Please add your API key by editing the Userscript and following the instructions at the top of the script.');
        return;
    }

    if (!MAP_LIST) {
        showLoader();

        try {
            MAP_LIST = await getMaps();
        } catch { }

        hideLoader();
    }

    if (MAP_LIST) {
        showMapList()
    }
}

function showMapList() {
    if (document.getElementById('mwgtm-map-list')) return;

    const element = document.createElement('div');
    element.id = 'mwgtm-map-list';
    element.className = 'mwgtm-modal';

    let recentMapsSection = ``;
    if (MWGTM_STATE.recentMaps.length > 0) {
        let recentMapsHTML = '';
        for (let m of MWGTM_STATE.recentMaps) {
            if (m.archivedAt) continue;
            recentMapsHTML += `<div class="map">
				<span class="map-name">${m.name}</span>
				<span class="map-buttons">
					<span class="map-add" data-id="${m.id}">ADD</span>
					<span class="map-added">ADDED</span>
				</span>
			</div>`;
        }

        recentMapsSection = `
			<h3>Recent Maps</h3>

			<div class="maps">
				${recentMapsHTML}
			</div>

			<br>
		`;
    }

    let mapsHTML = '';
    for (let m of MAP_LIST) {
        if (m.archivedAt) continue;
        mapsHTML += `<div class="map">
			<span class="map-name">${m.name}</span>
			<span class="map-buttons">
				<span class="map-add" data-id="${m.id}">ADD</span>
				<span class="map-added">ADDED</span>
			</span>
		</div>`;
    }

    element.innerHTML = `
		<div class="inner">
			<h3>Tags (comma separated)</h3>

			<input type="text" class="tag-input" id="mwgtm-map-tags" />

			<br><br>

			${recentMapsSection}

			<h3>All Maps</h3>
		
			<div class="maps">
				${mapsHTML}
			</div>
		</div>

		<div class="dim"></div>
	`;

    document.body.appendChild(element);

    element.querySelector('.dim').addEventListener('click', closeMapList);

    document.getElementById('mwgtm-map-tags').addEventListener('keyup', e => e.stopPropagation());
    document.getElementById('mwgtm-map-tags').addEventListener('keydown', e => e.stopPropagation());
    document.getElementById('mwgtm-map-tags').addEventListener('keypress', e => e.stopPropagation());
    document.getElementById('mwgtm-map-tags').focus();

    for (let map of element.querySelectorAll('.maps .map-add')) {
        map.addEventListener('click', addLocationToMap);
    }
}

function closeMapList(e) {
    const element = document.getElementById('mwgtm-map-list');
    if (element) element.remove();
}

function addLocationToMap(e) {
    e.target.parentNode.classList.add('is-added');

    const id = parseInt(e.target.dataset.id);
    MWGTM_STATE.recentMaps = MWGTM_STATE.recentMaps.filter(e => e.id !== id).slice(0, 2);
    for (let map of MAP_LIST) {
        if (map.id === id) {
            MWGTM_STATE.recentMaps.unshift(map);
            break;
        }
    }
    saveState();

    if (!MWGTM_STATE.ROUND_ACTIVE && LOCATION) {
        console.log(LOCATION.panoId);

        importLocations(id, [{
            id: -1,
            location: { lat: LOCATION.lat, lng: LOCATION.lng },
            panoId: LOCATION.panoId ?? null,
            heading: LOCATION.heading,
            pitch: LOCATION.pitch,
            zoom: LOCATION.zoom === 0 ? null : LOCATION.zoom,
            tags: document.getElementById('mwgtm-map-tags').value.split(',').map(t => t.trim()).filter(t => t.length > 0),
            flags: LOCATION.panoId ? 1 : 0
        }]);
    } else if (MWGTM_STATE.ROUND_ACTIVE && MWGTM_SV) {
        console.log("Ready to import");
        console.log(MWGTM_SV);
        console.log("data");
        console.log(MWGTM_SV.getPosition().lat());
        console.log(MWGTM_SV.pano);
        console.log(MWGTM_SV.getPov().heading);
        console.log(MWGTM_SV.getPov().pitch);
        console.log(MWGTM_SV.getPov().zoom);
        importLocations(id, [{
            id: -1,
            location: { lat: MWGTM_SV.getPosition().lat(), lng: MWGTM_SV.getPosition().lng() },
            panoId: MWGTM_SV.pano ?? null,
            heading: MWGTM_SV.getPov().heading,
            pitch: MWGTM_SV.getPov().pitch,
            zoom: MWGTM_SV.getPov().zoom === 0 ? null : MWGTM_SV.getPov().zoom,
            tags: document.getElementById('mwgtm-map-tags').value.split(',').map(t => t.trim()).filter(t => t.length > 0),
            flags: MWGTM_SV.pano ? 1 : 0
        }]);
    }
}

function googleMapsLink(loc) {
    const fov = 180 / Math.pow(2, loc.zoom ?? 0);
    let link = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${loc.lat},${loc.lng}&heading=${loc.heading}&pitch=${loc.pitch}&fov=${fov}`;

    if (loc.panoId) {
        link += `&pano=${loc.panoId}`;
    }

    return link;
}

function addButtonsToRoundResult() {
    const container = document.querySelector(`div[data-qa="result-view-top"]`);
    if (!container || document.getElementById('btm-round-result-div')) return;

    const element = document.createElement('div');
    element.id = 'btm-round-result-div';
    element.className = 'btm-main-div';

    element.appendChild(btmTitle());
    element.appendChild(terrainButton());
    element.appendChild(satelliteButton());
    element.appendChild(coverageButton());
    element.appendChild(removableButtons('seed'));
    element.appendChild(roundTime());
    container.appendChild(element);

    toggleMapType('roadmap');
    toggleCoverage(false);

}

function btmTitle() {
    const btmTitleDiv = document.createElement('div');
    btmTitleDiv.innerHTML = `
		<div class="mwgtm-title">blitve's training mode</div>
    	<div class="mwgtm-subtitle">Originally by <a href="https://miraclewhips.dev/" target="_blank" rel="noopener noreferrer">miraclewhips</a><br> <a href="https://ko-fi.com/miraclewhips" target="_blank" rel="noopener noreferrer">Support their work</a>.</div>
	`;
    return btmTitleDiv;
}

function roundTime() {
    const m = String(Math.floor(MWGTM_STATE.timerFinal / 60)).padStart(2, '0');
    const s = String(MWGTM_STATE.timerFinal % 60).padStart(2, '0');
    const roundTimeDiv = document.createElement('div');
    roundTimeDiv.innerHTML = `
    <div id="btm-round-time">
        <div style="font-size:10px; opacity:0.7; margin-bottom:2px;">ROUND TIME ${m}:${s}
        </div>
    </div>
`;
    return roundTimeDiv;
}

function addButtonsToChallengeResults() {
    const container = document.querySelector(`div[class^="results_root__"]`);
    if (!container || document.getElementById('btm-buttons-challenge-results')) return;

    const element = document.createElement('div');
    element.id = 'btm-buttons-challenge-results';
    element.className = 'btm-results-div';

    element.appendChild(btmTitle());
    element.appendChild(terrainButton());
    element.appendChild(satelliteButton());
    element.appendChild(coverageButton());
    element.appendChild(removableButtons('challenge'));
    container.appendChild(element);

    toggleMapType('roadmap');
    toggleCoverage(false);
}

function addButtonsToDuelResults() {
    const container = document.querySelector(`div[class^="game-summary_container__"]`);
    if (!container || document.getElementById('btm-buttons-duel-results')) return;

    const element = document.createElement('div');
    element.id = 'btm-buttons-duel-results';
    element.className = 'btm-results-div';

    element.appendChild(btmTitle());
    element.appendChild(terrainButton());
    element.appendChild(satelliteButton());
    element.appendChild(coverageButton());
    element.appendChild(removableButtons('duel'));
    container.appendChild(element);

    toggleMapType('roadmap');
    toggleCoverage(false);
}

function terrainButton() {
    const terrainButton = document.createElement('div');
    terrainButton.className = 'btm-button btm-terrain-button';
    terrainButton.textContent = 'TERRAIN DISABLED - [ T ]';
    terrainButton.addEventListener('click', () => {
        toggleMapType(MWGTM_STATE.terrainEnabled ? 'roadmap' : 'terrain');
    });
    return terrainButton;
}

function satelliteButton() {
    const satelliteButton = document.createElement('div');
    satelliteButton.className = 'btm-button btm-satellite-button';
    satelliteButton.textContent = 'SATELLITE DISABLED - [ S ]';
    satelliteButton.addEventListener('click', () => {
        toggleMapType(MWGTM_STATE.satelliteEnabled ? 'roadmap' : 'satellite');
    });
    return satelliteButton;
}

function coverageButton() {
    const coverageButton = document.createElement('div');
    coverageButton.className = 'btm-button btm-coverage-button';
    coverageButton.textContent = 'COVERAGE HIDDEN - [ B ]';
    coverageButton.addEventListener('click', () => {
        toggleCoverage();
    });
    return coverageButton;
}

function saveToMapButton() {
    const saveToMapButton = document.createElement('div');
    saveToMapButton.className = 'btm-button btm-savetomap-button';
    saveToMapButton.textContent = 'SAVE TO MAP';
    saveToMapButton.addEventListener('click', () => {
        clickedMapButton();
    });
    return saveToMapButton;
}

function openLocationButton() {
    const openlocationButton = document.createElement('div');
    openlocationButton.className = 'btm-button btm-openlocation-button';
    openlocationButton.textContent = 'OPEN LOCATION';
    openlocationButton.addEventListener('click', () => {
        const link = googleMapsLink(LOCATION);
        GM_openInTab(link, false);
    });
    return openlocationButton;
}

function openGuessButton() {
    const openGuessButton = document.createElement('div');
    openGuessButton.className = 'btm-button btm-openguess-button';
    openGuessButton.textContent = 'OPEN MY GUESS';
    openGuessButton.addEventListener('click', () => {
        showSV(GUESS);
    });
    return openGuessButton;
}

function removableButtons(mode) {
    const locationButtons = document.createElement('div');
    locationButtons.id = 'btm-removable-buttons-' + mode;
    locationButtons.className = 'btm-container-div';
    if (mode == 'challenge') locationButtons.style.display = 'none';
    locationButtons.appendChild(saveToMapButton());
    locationButtons.appendChild(openLocationButton());
    locationButtons.appendChild(openGuessButton());
    return locationButtons;
}

// function waitForNextDataUpdate(currentData) {
//     return new Promise((resolve) => {
//         const script = document.querySelector('script#__NEXT_DATA__');

//         const observer = new MutationObserver(() => {
//             const fresh = JSON.parse(script.textContent);
//             if (fresh !== currentData) {
//                 observer.disconnect();
//                 resolve(fresh);
//             }
//         });

//         observer.observe(script, { characterData: true, subtree: true });
//     });
// }

async function getFreshNextData() {
    const response = await fetch(window.location.href);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const raw = doc.querySelector('script#__NEXT_DATA__').textContent;
    return JSON.parse(raw);
}

async function getDuelData() {
    const data = await getFreshNextData();
    console.log("Duel data:");
    console.log(data);
    return { game: data.props.pageProps.game, userID: data.props.accountProps.account.user.userId };
}

async function getChallengeData() {
    const data = await getFreshNextData();
    console.log("Challenge data:");
    console.log(data);
    return data.props.pageProps.preselectedGame;
}

GeoGuessrEventFramework.init().then(GEF => {
    console.log('GeoGuessr Training Mode initialised.');

    document.addEventListener('keypress', (e) => {
        if (e.ctrlKey || e.shiftKey || e.metaKey || e.altKey || document.activeElement.tagName === 'INPUT') return;

        switch (e.code) {
            case 'KeyN': lookNorth(); return;
            case 'KeyH': toggleCompass(); return;
            case 'KeyT': toggleMapType(MWGTM_STATE.terrainEnabled ? 'roadmap' : 'terrain'); return;
            case 'KeyS': toggleMapType(MWGTM_STATE.satelliteEnabled ? 'roadmap' : 'satellite'); return;
            case 'KeyM': toggleCar(); return;
            case 'KeyB': toggleCoverage(); return;
        }
    })

    window.addEventListener('spa-route-change', async (e) => {
        console.log('BTM caught route change to:', e.detail.url);
        if ((e.detail.url.startsWith('/game')) || (e.detail.url.startsWith('/challenge'))) {
            console.log('Seed started:', e.detail.url);
            MWGTM_STATE.PLAYING_A_SEED = true;
            MWGTM_STATE.LOOKING_AT_RESULTS = false;
        } else if ((e.detail.url.startsWith('/results')) || (e.detail.url.startsWith('/duels'))) {
            console.log('Looking at results:', e.detail.url);
            if (e.detail.url.startsWith('/duels')) {
                await updateLOCATIONandGUESSforDuelResults();
            } else if (e.detail.url.startsWith('/results')) {
                await updateLOCATIONandGUESSforChallengeResults();
            }
            MWGTM_STATE.PLAYING_A_SEED = false;
            MWGTM_STATE.LOOKING_AT_RESULTS = true;
        } else {
            console.log('Other route:', e.detail.url);
            toggleMapType('roadmap');
            toggleCoverage(false);
            saveState();
            MWGTM_STATE.PLAYING_A_SEED = false;
            MWGTM_STATE.LOOKING_AT_RESULTS = false;
        }
        saveState();
    });

    // document.addEventListener('click', function (e) {
    //     const text = e.target.textContent.trim();
    //     if ((text.startsWith('Round ')) || (text === "Total")) {
    //         const threeOps = document.getElementById('btm-removable-buttons-challenge');
    //         if (!threeOps) return;
    //         if (text === 'Total') {
    //             ROUND_NUMBER = 0;
    //             threeOps.style.display = 'none';
    //         } else {
    //             const match = text.match(/Round (\d+)/);
    //             if (match) {
    //                 const rn = parseInt(match[1]);
    //                 if (ROUND_NUMBER == rn) {
    //                     ROUND_NUMBER = 0;
    //                     threeOps.style.display = 'none';
    //                 } else {
    //                     ROUND_NUMBER = parseInt(match[1]);
    //                     threeOps.style.display = 'contents';
    //                 }
    //             }
    //         }
    //         console.log('ROUND_NUMBER:', ROUND_NUMBER);
    //     }
    // });

    GEF.events.addEventListener('game_start', (state) => {
        console.log("BTM:Game started");
        console.log(MWGTM_STATE);
    });

    GEF.events.addEventListener('round_start', (state) => {
        console.log("BTM:Round started");
        MWGTM_STATE.ROUND_ACTIVE = true;
        toggleMapType('roadmap');
        MWGTM_STATE.coverageEnabled = false;
        toggleCoverage(MWGTM_STATE.coverageEnabled);
        saveState();
        startTimer();
        console.log(MWGTM_STATE);
    });

    GEF.events.addEventListener('round_end', (state) => {
        console.log("BTM:Round ended");
        console.log(state);
        MWGTM_STATE.ROUND_ACTIVE = false;
        toggleMapType('roadmap');
        MWGTM_STATE.coverageEnabled = false;
        toggleCoverage(MWGTM_STATE.coverageEnabled);
        saveState();
        stopTimer();
        console.log(MWGTM_STATE);
        const loc = state.detail.rounds[state.detail.rounds.length - 1]?.location;
        if (loc) LOCATION = loc;
        const gss = state.detail.rounds[state.detail.rounds.length - 1]?.player_guess;
        if (gss) GUESS = gss;
    });

    GEF.events.addEventListener('game_end', async (state) => {
        console.log("BTM:Game ended");
        console.log(MWGTM_STATE);
        const btn = await waitForElement('[data-qa="close-round-result"]');
        console.log("btn: " + btn);
        btn.addEventListener('click', async () => {
            const threeButtons = await waitForElement('[id="btm-removable-buttons-seed"]');
            console.log("threeButtons: " + threeButtons)
            if (threeButtons) threeButtons.style.display = 'none';
            const rTimer = await waitForElement('[id="btm-round-time"]');
            if (rTimer) rTimer.style.display = 'none';
        });
    });
});

// Add buttons to the GUI
const observer = new MutationObserver(() => {
    addButtonsInRound();
    addButtonsToRoundResult();
    addButtonsToChallengeResults();
    addButtonsToDuelResults();
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
    });
} else {
    observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}


// Flags update isHoveringFlag variable
const flagObserver = new MutationObserver(() => {
    const markers = document.querySelectorAll('[data-qa="correct-location-marker"]');

    if (markers.length > 0) {
        markers.forEach(marker => {
            marker.addEventListener('mouseenter', () => {
                isHoveringFlag = true;
            });
            marker.addEventListener('mouseleave', () => {
                isHoveringFlag = false;
            });
        });

        flagObserver.disconnect();
    }
});

flagObserver.observe(document.body, { childList: true, subtree: true });

function getGuesses(playerId, teams) {
    console.log(playerId);
    console.log(teams);
    for (const team of teams) {
        for (const player of team.players) {
            if (player.playerId === playerId) {
                return player.guesses;
            }
        }
    }
    return null; // player not found
}

async function updateLOCATIONandGUESSforDuelResults() {
    let { game, userID } = await getDuelData();
    console.log(game);
    console.log("userId: " + userID);
    const loc = game.rounds[game.rounds.length - 1]?.panorama;
    if (loc) LOCATION = loc;
    else console.log("Hmm");
    const guesses = getGuesses(userID, game.teams);
    console.log(guesses);
    const guess = { lat: guesses[game.rounds.length - 1]?.lat, lng: guesses[game.rounds.length - 1]?.lng };
    console.log(guess);
    if (guess) GUESS = guess;
    else console.log("Hmm2");
    const roundButtons = document.querySelectorAll((`div[class^="game-summary_playedRound__"]`));
    console.log(roundButtons);
    for (const rb of roundButtons) {
        rb.addEventListener('click', () => {
            const roundDiv = Array.from(rb.querySelectorAll('div'))
                .find(div => div.textContent.startsWith('Round '));
            if (roundDiv) {
                const number = parseInt(roundDiv.textContent.replace('Round ', ''));
                console.log("Clicked on Round " + number);
                const locc = game.rounds[number - 1]?.panorama;
                if (locc) LOCATION = locc;
                else console.log("Hmm2");
                const guesses = getGuesses(userID, game.teams);
                console.log(guesses);
                const guess = { lat: guesses[number - 1]?.lat, lng: guesses[number - 1]?.lng };
                console.log(guess);
                if (guess) GUESS = guess;
                else console.log("Hmm2");
            }
        });
    }
}

async function updateLOCATIONandGUESSforChallengeResults() {
    let game = await getChallengeData();
    console.log(game);
    await waitForElement('div[class*="coordinate-results_clickableColumn__"]');
    const roundColumns = document.querySelectorAll((`div[class*="coordinate-results_clickableColumn__"]`));
    console.log(roundColumns);
    for (const rc of roundColumns) {
        rc.addEventListener('click', () => {
            const threeOps = document.getElementById('btm-removable-buttons-challenge');
            if (!threeOps) return;
            if (rc.textContent === 'Total') {
                ROUND_NUMBER = 0;
                threeOps.style.display = 'none';
            } else {
                const match = rc.textContent.match(/Round (\d+)/);
                if (match) {
                    const rn = parseInt(match[1]);
                    if (ROUND_NUMBER == rn) {
                        ROUND_NUMBER = 0;
                        threeOps.style.display = 'none';
                    } else {
                        console.log(game.rounds);
                        ROUND_NUMBER = parseInt(match[1]);
                        const locc = game.rounds[ROUND_NUMBER - 1];
                        if (locc) LOCATION = locc;
                        else console.log("Hmm");
                        const guess = game.player.guesses[ROUND_NUMBER - 1];
                        if (guess) GUESS = guess;
                        else console.log("Hmm2");
                        
                        threeOps.style.display = 'contents';
                    }
                }
            }
            console.log('ROUND_NUMBER:', ROUND_NUMBER);
        });
    }
}

// Script injection, extracted from unityscript extracted from extenssr:
// https://gitlab.com/nonreviad/extenssr/-/blob/main/src/injected_scripts/maps_api_injecter.ts

function overrideOnLoad(googleScript, observer, overrider) {
    const oldOnload = googleScript.onload;
    googleScript.onload = (event) => {
        const google = window['google'] || unsafeWindow['google'];
        if (google) {
            observer.disconnect();
            overrider(google);
        }
        if (oldOnload) {
            oldOnload.call(googleScript, event);
        }
    }
}

function grabGoogleScript(mutations) {
    for (const mutation of mutations) {
        for (const newNode of mutation.addedNodes) {
            const asScript = newNode;
            if (asScript && asScript.src && asScript.src.startsWith('https://maps.googleapis.com/')) {
                return asScript;
            }
        }
    }
    return null;
}

function injecter(overrider) {
    new MutationObserver((mutations, observer) => {
        const googleScript = grabGoogleScript(mutations);
        if (googleScript) {
            overrideOnLoad(googleScript, observer, overrider);
        }
    }).observe(document.documentElement, { childList: true, subtree: true });
}

function showNoStreetViewMessage(e) {
    const existing = document.getElementById('btm-no-sv-message');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.id = 'btm-no-sv-message';
    el.innerHTML = 'No streetview<br>within 2km';
    el.style.cssText = `
        position: fixed;
        right: 120px;
        top: 350px;
        background: rgba(0,0,0,0.75);
        color: white;
        padding: 8px 16px;
        border-radius: 5px;
        font-weight: bold;
        z-index: 9999;
    `;
    if (e) {
        el.style.left = (e.clientX + 40) + 'px';
        el.style.right = '';
        el.style.top = (e.clientY - 40) + 'px';
    }
    document.body.appendChild(el);

    setTimeout(() => el.remove(), 1500);
}

function showSV(latlng, event = null) {
    const streetViewService = new google.maps.StreetViewService();

    streetViewService.getPanorama(
        {
            location: latlng,
            radius: 2000,
        },
        (data, status) => {
            if (status === google.maps.StreetViewStatus.OK) {
                console.log("Closest pano at:", data.location?.latLng);
                const myLoc = { lat: data.location?.latLng.lat(), lng: data.location?.latLng.lng(), heading: 0, pitch: 0, zoom: 0 };
                console.log(myLoc);
                const link = googleMapsLink(myLoc);
                GM_openInTab(link, false);
            } else {
                console.log("No SV");
                showNoStreetViewMessage(event);
            }
        }
    );
}

function getActiveMap() {
    return allMapObjects.find(map => {
        const container = map.getDiv();
        return container && container.isConnected && container.offsetParent !== null;
    });
}

function getActiveMapIndex() {
    const index = allMapObjects.findIndex(map => {
        const container = map.getDiv();
        return container && container.isConnected && container.offsetParent !== null;
    });
    //return { index, map: allMaps[index] ?? null };
    return index;
}

document.addEventListener('DOMContentLoaded', (event) => {
    injecter(() => {
        const google = window['google'] || unsafeWindow['google'];
        if (!google) return;

        google.maps.StreetViewPanorama = class extends google.maps.StreetViewPanorama {
            constructor(...args) {
                super(...args);
                MWGTM_SV = this;

                MWGTM_SV.addListener('pov_changed', () => {
                    pointCompass();
                });

                //                 MWGTM_SV.addListener('position_changed', () => {
                //                     console.log(MWGTM_SV.position);
                //                     console.log(MWGTM_SV.pov);
                //                 });
            }
        }

        google.maps.Map = class extends google.maps.Map {
            constructor(...args) {
                super(...args);
                //MWGTM_M = this;
                allMapObjects.push(this);
                console.log("Map object updated, total maps:", allMapObjects.length);

                MWGTM_SVC = new google.maps.ImageMapType({
                    getTileUrl: (point, zoom) => `https://www.google.com/maps/vt?pb=!1m7!8m6!1m3!1i${zoom}!2i${point.x}!3i${point.y}!2i9!3x1!2m8!1e2!2ssvv!4m2!1scc!2s*211m3*211e2*212b1*213e2*212b1*214b1!4m2!1ssvl!2s*211b0*212b1!3m8!2sen!3sus!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m4!1e0!8m2!1e1!1e1!6m6!1e12!2i2!11e0!39b0!44e0!50e`,
                    tileSize: new google.maps.Size(256, 256),
                    maxZoom: 9,
                    minZoom: 0,
                });

                MWGTM_LABELS = new google.maps.StyledMapType([
                    { featureType: 'all', stylers: [{ visibility: 'off' }] },
                    { featureType: 'all', elementType: 'labels', stylers: [{ visibility: 'on' }] },
                ], { name: 'labels' });;

                //                 this.addListener('idle', () => {
                //                     toggleTerrain(MWGTM_STATE.terrainEnabled);
                //                     toggleCoverage(MWGTM_STATE.coverageEnabled);
                //                 });

                this.addListener('click', (event) => {
                    console.log("Click detected");
                    console.log("PLAYING A SEED = " + MWGTM_STATE.PLAYING_A_SEED);
                    console.log("LOOKING AT RESULTS = " + MWGTM_STATE.LOOKING_AT_RESULTS);
                    if (isHoveringFlag) {
                        console.log('Flag image clicked!');
                    } else {
                        console.log("Click off the flag image");
                        let not_in_round = ((MWGTM_STATE.PLAYING_A_SEED) && (!MWGTM_STATE.ROUND_ACTIVE)) || (MWGTM_STATE.LOOKING_AT_RESULTS);
                        if (not_in_round && MWGTM_STATE.coverageEnabled) {
                            showSV({ lat: event.latLng.lat(), lng: event.latLng.lng() }, event.domEvent);
                        }
                    }
                });
            }
        }
    });
});

// car shaders credit to drparse and victheturtle
// https://openuserjs.org/scripts/drparse/GeoNoCar
// https://greasyfork.org/en/scripts/459812-geonocar-lite

const vertexOld = "const float f=3.1415926;varying vec3 a;uniform vec4 b;attribute vec3 c;attribute vec2 d;uniform mat4 e;void main(){vec4 g=vec4(c,1);gl_Position=e*g;a=vec3(d.xy*b.xy+b.zw,1);a*=length(c);}";
const fragOld = "precision highp float;const float h=3.1415926;varying vec3 a;uniform vec4 b;uniform float f;uniform sampler2D g;void main(){vec4 i=vec4(texture2DProj(g,a).rgb,f);gl_FragColor=i;}";

const vertexNewSlim = `
varying vec3 a;
varying vec3 potato;
uniform vec4 b;
attribute vec3 c;
attribute vec2 d;
uniform mat4 e;
 
void main(){
    vec4 g=vec4(c,1);
    gl_Position=e*g;
    a = vec3(d.xy * b.xy + b.zw,1);
    a *= length(c);
    potato = vec3(d.xy, 1.0) * length(c);
}`;

const fragNewSlim = `
precision highp float;
varying vec3 a;
varying vec3 potato;
uniform vec4 b;
uniform float f;
uniform sampler2D g;
 
bool show(float alpha1, float alpha2) {
    float alpha3 = abs(alpha1 - 0.5);
    float alpha4 = (alpha3 > 0.25) ? 0.5 - alpha3 : alpha3;
    if (alpha4 < 0.0062) {
        return alpha2 > 0.63;
    } else if (alpha4 < 0.0066) {
        return alpha2 > mix(0.63, 0.67, (alpha4-0.0062) / (0.0066-0.0062));
    } else if (alpha4 < 0.065) {
        return alpha2 > 0.67;
    } else if (alpha4 < 0.10) {
        return alpha2 > mix(0.67, 0.715, (alpha4-0.065) / (0.10-0.065));
    } else if (alpha4 < 0.16) {
        return alpha2 > mix(0.715, 0.73, (alpha4-0.10) / (0.16-0.10));
    } else if (alpha4 < 0.175) {
        return alpha2 > mix(0.73, 0.79, (alpha4-0.16) / (0.175-0.16));
    } else {
        return alpha2 > 0.81 - 3.5 * (alpha4 - 0.25) * (alpha4 - 0.25);
    }
}
 
void main(){
    vec2 aD = potato.xy / a.z;
    vec4 i = vec4(show(aD.x, aD.y) ? vec3(float(0.1), float(0.1), float(0.1)) : texture2DProj(g,a).rgb, f);
    gl_FragColor=i;
}`;

const vertexNewFull = `
const float f=3.1415926;
varying vec3 a;
varying vec3 potato;
uniform vec4 b;
attribute vec3 c;
attribute vec2 d;
uniform mat4 e;
void main(){
vec4 g=vec4(c,1);
gl_Position=e*g;
a = vec3(d.xy * b.xy + b.zw,1);
a *= length(c);

potato = vec3(d.xy, 1.0) * length(c);
}`;
const fragNewFull = `precision highp float;
const float h=3.1415926;
varying vec3 a;
varying vec3 potato;
uniform vec4 b;
uniform float f;
uniform sampler2D g;
void main(){

vec2 aD = potato.xy / a.z;
float thetaD = aD.y;

float thresholdD1 = 0.6;
float thresholdD2 = 0.7;

float x = aD.x;
float y = abs(4.0*x - 2.0);
float phiD = smoothstep(0.0, 1.0, y > 1.0 ? 2.0 - y : y);

vec4 i = vec4(
thetaD > mix(thresholdD1, thresholdD2, phiD)
? vec3(float(0.1), float(0.1), float(0.1)) // texture2DProj(g,a).rgb * 0.25
: texture2DProj(g,a).rgb
,f);
gl_FragColor=i;
}`;

function getVertexShader() {
    switch (MWGTM_STATE.carSetting) {
        case 1: return vertexNewSlim;
        case 2: return vertexNewFull;
    }
}
function getFragShader() {
    switch (MWGTM_STATE.carSetting) {
        case 1: return fragNewSlim;
        case 2: return fragNewFull;
    }
}

function installShaderSource(ctx) {
    const oldShaderSource = ctx.shaderSource;

    function shaderSource() {
        if (typeof arguments[1] === 'string') {
            if (arguments[1] === vertexOld) {
                const s = getVertexShader();
                if (s) arguments[1] = s;
            } else if (arguments[1] === fragOld) {
                const s = getFragShader();
                if (s) arguments[1] = s;
            }
        }
        return oldShaderSource.apply(this, arguments);
    }

    shaderSource.bestcity = 'bintulu';
    ctx.shaderSource = shaderSource;
}
function installGetContext(el) {
    const oldGetContext = el.getContext;

    el.getContext = function () {
        const ctx = oldGetContext.apply(this, arguments);
        if ((arguments[0] === 'webgl' || arguments[0] === 'webgl2') && ctx && ctx.shaderSource && ctx.shaderSource.bestcity !== 'bintulu') {
            installShaderSource(ctx);
        }
        return ctx;
    };
}
const oldCreateElement = document.createElement;

document.createElement = function () {
    const el = oldCreateElement.apply(this, arguments);
    if (arguments[0] === 'canvas' || arguments[0] === 'CANVAS') {
        installGetContext(el);
    }
    return el;
}

