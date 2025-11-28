// ==UserScript==
// @name         Thai Districts
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Add subdivision overlay to Geoguessr post-guess maps
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-event-framework.min.js?v=10
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
// @copyright    2025, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-training-mode.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-training-mode.user.js
// ==/UserScript==

let MWGTM_SV, MWGTM_M, MWGTM_SVC;
let toggleButton;
let infoDiv;

const GEOJSON_URL = "https://raw.githubusercontent.com/biltzerpos/ggmetamap/main/public/Layers/Thailand/Level2.geojson";
const PROV_URL = "https://raw.githubusercontent.com/biltzerpos/ggmetamap/main/public/Layers/Thailand/Level1.geojson";
const MAX_FETCH_RETRIES = 3;
const FETCH_RETRY_DELAY_MS = 1000;

GeoGuessrEventFramework.init().then(GEF => {
    console.log('GeoGuessr Training Mode initialised.');

    document.addEventListener('keypress', (e) => {
        if(e.ctrlKey || e.shiftKey || e.metaKey || e.altKey || document.activeElement.tagName === 'INPUT') return;

        // 		switch(e.code) {
        // 			case 'KeyN': lookNorth(); return;
        // 			case 'KeyH': toggleCompass(); return;
        // 			case 'KeyT': toggleTerrain(); return;
        // 			case 'KeyM': toggleCar(); return;
        // 			case 'KeyB': toggleCoverage(); return;
        // 		}
    })

    GEF.events.addEventListener('round_start', (state) => {
        console.log("SO-Round start");
        unloadGeoJson();
        //console.log(toggleButton);
        //toggleButton.classList.remove("hidden");
        hideToggleButton();
        infoDiv.style.display = "none";
        //shouldAddSettingsButtonToRound = true;
    });

    GEF.events.addEventListener('round_end', (state) => {
        //console.log("SO-Round end");
        //toggleButton.classList.add("hidden");
        showToggleButton();
        if (toggleButton.dataset.state == "on") loadAndAddGeoJson();
        // 		const loc = state.detail.rounds[state.detail.rounds.length - 1]?.location;
        // 		if(!loc) return;

        // 		LOCATION = loc;
        // 		shouldAddSettingsButtonToSummary = true;
    });

    GEF.events.addEventListener('game_end', (state) => {
        hideToggleButton();
        unloadGeoJson();
    });
});

function gmFetchJson(url, retries = MAX_FETCH_RETRIES) {
    return new Promise((resolve, reject) => {
        let attempt = 0;
        const tryOnce = () => {
            attempt++;
            console.log(`[GM-GeoJSON] gmFetchJson attempt ${attempt} -> ${url}`);

            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                responseType: "json",
                onload(response) {
                    // On some browsers Tampermonkey may not auto-parse; try to handle both.
                    try {
                        const data = response.response || JSON.parse(response.responseText || "{}");
                        if (!data) throw new Error("empty JSON");
                        console.log("[Subdivision Overlay] fetch succeeded");
                        resolve(data);
                    } catch (err) {
                        console.warn("[Subdivision Overlay] parse error:", err);
                        if (attempt < retries) {
                            setTimeout(tryOnce, FETCH_RETRY_DELAY_MS);
                        } else {
                            reject(err);
                        }
                    }
                },
                onerror(err) {
                    console.warn("[Subdivision Overlay] request error:", err);
                    if (attempt < retries) setTimeout(tryOnce, FETCH_RETRY_DELAY_MS);
                    else reject(err);
                },
                ontimeout() {
                    console.warn("[Subdivision Overlay] request timeout");
                    if (attempt < retries) setTimeout(tryOnce, FETCH_RETRY_DELAY_MS);
                    else reject(new Error("timeout"));
                },
            });
        };
        tryOnce();
    });
}

/* --- Simple UI: toggle button --- */
GM_addStyle(`
        #gm-geojson-toggle {
            position: absolute;
            right: 12px;
            top: 12px;
            z-index: 10000;
            background: white;
            border-radius: 6px;
            padding: 6px 8px;
            box-shadow: 0 1px 6px rgba(0,0,0,0.3);
            font-family: Arial, Helvetica, sans-serif;
            cursor: pointer;
            user-select: none;
            .hidden { display: none !important; }
        }
    `);

function createToggleButton(onToggle) {
    let btn = document.getElementById("gm-geojson-toggle");
    if (btn) return btn;
    btn = document.createElement("div");
    btn.id = "gm-geojson-toggle";
    btn.textContent = "Show Thai districts";
    btn.dataset.state = "off";
    btn.addEventListener("click", () => {
        const isOn = btn.dataset.state === "on";
        if (isOn) {
            btn.dataset.state = "off";
            btn.textContent = "Show Thai districts";
        } else {
            btn.dataset.state = "on";
            btn.textContent = "Hide Thai districts";
        }
        onToggle(!isOn);
    });
    //document.body.appendChild(btn);
    return btn;
}

function showToggleButton() {
    if (!document.getElementById("gm-geojson-toggle")) {
        document.body.appendChild(toggleButton);
    }
}

function hideToggleButton() {
    const btn = document.getElementById("gm-geojson-toggle");
    if (btn) btn.remove();
}

let addedFeatures = [];

async function loadAndAddGeoJson() {
    try {
        const geojson = await gmFetchJson(GEOJSON_URL);
        const provinces = await gmFetchJson(PROV_URL);
        //console.log("[Subdivision Overlay] geojson loaded:", geojson);

        // Remove previous features
        if (addedFeatures.length) {
            addedFeatures.forEach(f => MWGTM_M.data.remove(f));
            addedFeatures = [];
        }

        try {
            const features = MWGTM_M.data.addGeoJson(geojson);
            MWGTM_M.data.forEach(feature => {
                if (!feature.getProperty("SOtag")) {
                    feature.setProperty("SOtag", "district");
                }
            });
            //             if (Array.isArray(features)) {
            //                 addedFeatures = features;
            //             } else {
            //                 // older internal implementations may not return features; fallback: remember all features by a property
            //                 console.log("[Subdivision Overlay] addGeoJson did not return features — proceeding without feature list");
            //             }
            const features2 = MWGTM_M.data.addGeoJson(provinces);
            MWGTM_M.data.forEach(feature => {
                if (!feature.getProperty("SOtag")) {
                    feature.setProperty("SOtag", "province");
                }
            });
            MWGTM_M.data.forEach(f => addedFeatures.push(f));
        } catch (err) {
            console.error("[Subdivision Overlay] addGeoJson error:", err);
            // In rare cases addGeoJson might throw if constructors are not available; bail.
            throw err;
        }

        // Styling
        MWGTM_M.data.setStyle(feature => {
            const source = feature.getProperty("SOtag");

            if (source === "district") {
                return {
                    strokeColor: "black",
                    strokeWeight: 1,
                    fillOpacity: 0,
                    zIndex: 10
                };
            } else if (source === "province") {
                return {
                    strokeColor: "blue",
                    strokeWeight: 5,
                    strokeOpacity: 0.2,
                    fillOpacity: 0,
                    zIndex: 4
                };
            }

            // default style
            return {
                fillColor: "gray",
                strokeColor: "gray",
                strokeWeight: 1,
                fillOpacity: 0.3
            };
        });

        MWGTM_M.data.addListener('click', function(event) {
            // event.feature is the Feature that was clicked
            //console.log(event.feature);
            console.log("Clicked feature:", event.feature.getProperty("NAME_2"));
            console.log("qwe");

            // Format content for the info box
            infoDiv.innerHTML = event.feature.getProperty("NAME_2") + "<br>" + event.feature.getProperty("NL_NAME_2");

            // Get pixel coordinates of the click
            const projection = MWGTM_M.getProjection();
            if (!projection) {
                console.warn("Map projection not ready");
                return;
            }

            // event.latLng is a google.maps.LatLng
            const point = projection.fromLatLngToPoint(event.latLng);
            const scale = Math.pow(2, MWGTM_M.getZoom());
            const pixel = {
                x: point.x * scale,
                y: point.y * scale
            };

            console.log(pixel);
            // Position the div
            infoDiv.style.right = 12 + "px";
            infoDiv.style.top = 50 + "px";
            infoDiv.style.display = "block";

        });

        console.log("[Subdivision Overlay] GeoJSON overlay added.");
    } catch (err) {
        console.error("[Subdivision Overlay] Failed to load/add geojson:", err);
    }
}

function unloadGeoJson() {
    try {
        if (addedFeatures.length) {
            addedFeatures.forEach(f => MWGTM_M.data.remove(f));
            addedFeatures = [];
            console.log("[Subdivision Overlay] removed features");
        } else {
            // fallback: clear entire data layer (may remove other stuff)
            try {
                MWGTM_M.data.forEach(f => MWGTM_M.data.remove(f));
                console.log("[Subdivision Overlay] cleared data layer");
            } catch (e) {
                console.warn("[Subdivision Overlay] could not clear data layer:", e);
            }
        }
    } catch (e) {
        console.error("[Subdivision Overlay] unload error:", e);
    }
}

//styles_columnOne__rw8hK
const observer = new MutationObserver(() => {
    ///addSettingsButtonsToRound();
    //addSettingsButtonsToSummary();

    if(document.getElementById('mwgtm-restore-classic-compass')) return;

    const controls = document.querySelector(`aside[class^="game_controls__"]`) || document.querySelector(`aside[class^="game-panorama_controls__"]`);
    if(!controls) return;

    const container = controls.querySelector('div[class^="styles_columnOne__"]');
    if(container) {
        let compass = document.createElement('div');
        compass.id = 'mwgtm-restore-classic-compass';
        compass.className = 'mwgtm-compass';
        compass.innerHTML = `<div class="circle"></div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 96" class="arrow" id="mwgtm-compass-arrow"><g fill="none" fill-rule="evenodd"><path fill="#B82A2A" d="M12 0v48H0z"/><path fill="#CC2F30" d="M12 0v48h12z"/><path fill="#E6E6E6" d="M12 96V48H0z"/><path fill="#FFF" d="M12 96V48h12z"/></g></svg>`;
        container.appendChild(compass);
        container.classList.add('mwgtm-override-classic-compass');
        //pointCompass();
    }
});

observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });

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

// function loadMapsApi() {
//     return new Promise(resolve => {
//         const script = document.createElement("script");
//         script.src =
//           "https://maps.googleapis.com/maps/api/js?key=AIzaSyBRwHMUsLBB18sh48vxK4ZTKXqywAt0DoA&libraries=marker";
//         script.onload = resolve;
//         document.head.appendChild(script);
//     });
// }


// await loadMapsApi();

document.addEventListener('DOMContentLoaded', (event) => {



    injecter(() => {
        const google = window['google'] || unsafeWindow['google'];
        if(!google) return;

        // 		google.maps.StreetViewPanorama = class extends google.maps.StreetViewPanorama {
        // 			constructor(...args) {
        // 				super(...args);
        // 				MWGTM_SV = this;

        // 				MWGTM_SV.addListener('pov_changed', () => {
        // 					pointCompass();
        // 				});
        // 			}
        // 		}

        google.maps.Map = class extends google.maps.Map {
            constructor(...args) {
                super(...args);
                MWGTM_M = this;

                console.log("[Subdivision Overlay] Map instance detected!", MWGTM_M);
                //console.log("[Subdivision Overlay] map.data:", MWGTM_M.data);

                //                 const { AdvancedMarkerElement } = google.maps.marker;

                // const div = document.createElement("div");
                // div.textContent = "Hello Toronto!";
                // div.style.background = "white";
                // div.style.padding = "3px 6px";
                // div.style.borderRadius = "4px";
                // div.style.fontSize = "14px";
                // div.style.fontWeight = "bold";
                // div.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";

                // const marker = new AdvancedMarkerElement({
                //     map: MWGTM_M,
                //     position: { lat: 43.6532, lng: -79.3832 },
                //     content: div
                // });


                // Test by drawing a simple polygon
                //                 MWGTM_M.data.add({
                //                     geometry: new google.maps.Data.Polygon([[
                //                         { lat: 43.0, lng: -79.0 },
                //                         { lat: 43.1, lng: -79.0 },
                //                         { lat: 43.1, lng: -79.1 },
                //                         { lat: 43.0, lng: -79.1 },
                //                         { lat: 43.0, lng: -79.0 }
                //                     ]])
                //                 });

                //                 console.log("[Subdivision Overlay] Test polygon added.");

                toggleButton = createToggleButton(async (turnOn) => {
                    if (turnOn) {
                        await loadAndAddGeoJson();
                    } else {
                        unloadGeoJson();
                    }
                });

                infoDiv = document.createElement("div");
                infoDiv.style.position = "absolute";
                infoDiv.style.background = "white";
                infoDiv.style.padding = "6px 10px";
                infoDiv.style.border = "1px solid #333";
                infoDiv.style.borderRadius = "4px";
                infoDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
                infoDiv.style.pointerEvents = "auto"; // allow interaction
                infoDiv.style.display = "none"; // hide by default
                infoDiv.style.zIndex = 10000;

                document.body.appendChild(infoDiv);



                //                 const marker = new google.maps.marker.AdvancedMarkerElement({
                //     MWGTM_M,
                //     position: { lat: 43.6532, lng: -79.3832 },
                //     title: "Hello Toronto!",
                // });

                // 				MWGTM_SVC = new google.maps.ImageMapType({
                // 					getTileUrl: (point, zoom) => `https://www.google.com/maps/vt?pb=!1m7!8m6!1m3!1i${zoom}!2i${point.x}!3i${point.y}!2i9!3x1!2m8!1e2!2ssvv!4m2!1scc!2s*211m3*211e2*212b1*213e2*212b1*214b1!4m2!1ssvl!2s*211b0*212b1!3m8!2sen!3sus!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m4!1e0!8m2!1e1!1e1!6m6!1e12!2i2!11e0!39b0!44e0!50e`,
                // 					tileSize: new google.maps.Size(256, 256),
                // 					maxZoom: 9,
                // 					minZoom: 0,
                // 				});

                // 				toggleCoverage(MWGTM_STATE.coverageEnabled);

                // 				MWGTM_M.addListener('idle', () => {
                // 					toggleTerrain(MWGTM_STATE.terrainEnabled);
                // 				});
            }
        }
    });
});
