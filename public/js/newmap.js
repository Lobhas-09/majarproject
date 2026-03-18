// Live location preview map for the "Create New Listing" form
maptilersdk.config.apiKey = mapToken;

const map = new maptilersdk.Map({
    container: "map",
    style: maptilersdk.MapStyle.STREETS,
    center: [78.9629, 20.5937], // Default: center of India
    zoom: 4,
});

let marker = null;
const locationInput = document.getElementById("location-input");
const mapStatus = document.getElementById("map-status");

// Debounce timer
let debounceTimer;

// Geocode the location and update the map
async function geocodeAndUpdateMap(location) {
    if (!location || location.trim().length < 2) {
        mapStatus.textContent = "Enter a location above to see it on the map";
        return;
    }

    mapStatus.textContent = "🔍 Searching location...";

    try {
        const result = await maptilersdk.geocoding.forward(location, {
            limit: 1,
            language: ["en"],
        });

        if (result.features && result.features.length > 0) {
            const coords = result.features[0].geometry.coordinates; // [lng, lat]
            const placeName = result.features[0].place_name || location;

            // Fly to the location
            map.flyTo({
                center: coords,
                zoom: 13,
                essential: true,
            });

            // Remove old marker
            if (marker) {
                marker.remove();
            }

            // Add new marker with popup
            marker = new maptilersdk.Marker({ color: "#FF0000" })
                .setLngLat(coords)
                .setPopup(
                    new maptilersdk.Popup({ offset: 25 }).setHTML(
                        `<h6>📍 ${placeName}</h6>`
                    )
                )
                .addTo(map);

            // Open popup immediately
            marker.togglePopup();

            mapStatus.textContent = `✅ Found: ${placeName}`;
            mapStatus.classList.remove("text-muted");
            mapStatus.classList.add("text-success");
        } else {
            mapStatus.textContent = "❌ Location not found. Try a different name.";
            mapStatus.classList.remove("text-success");
            mapStatus.classList.add("text-danger");
        }
    } catch (err) {
        console.error("Geocoding error:", err);
        mapStatus.textContent = "⚠️ Error searching location. Please try again.";
        mapStatus.classList.remove("text-success");
        mapStatus.classList.add("text-danger");
    }
}

// Listen for input changes with debounce (waits 800ms after typing stops)
locationInput.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    mapStatus.textContent = "⏳ Typing...";
    mapStatus.className = "text-muted";

    debounceTimer = setTimeout(() => {
        geocodeAndUpdateMap(this.value);
    }, 800);
});

// Also geocode on blur (when user clicks/tabs away from the field)
locationInput.addEventListener("blur", function () {
    clearTimeout(debounceTimer);
    if (this.value.trim().length >= 2) {
        geocodeAndUpdateMap(this.value);
    }
});
