// Map showing all listing locations on the index page
maptilersdk.config.apiKey = mapToken;

const map = new maptilersdk.Map({
    container: "map",
    style: maptilersdk.MapStyle.STREETS,
    center: [78.9629, 20.5937], // Default center (India)
    zoom: 4,
});

map.on("load", function () {
    // Add markers for each listing that has valid geometry
    const bounds = new maptilersdk.LngLatBounds();
    let hasValidListings = false;

    allListingsData.forEach(function (listing) {
        if (
            listing.geometry &&
            listing.geometry.coordinates &&
            listing.geometry.coordinates.length === 2
        ) {
            const coords = listing.geometry.coordinates; // [lng, lat]

            // Create popup content
            const popupContent = `
        <div style="max-width:200px;">
          <h6 style="margin:0 0 4px;">${listing.title}</h6>
          <p style="margin:0; font-size:13px;">📍 ${listing.location || ""}</p>
          <p style="margin:4px 0 0; font-size:13px; font-weight:600;">
            ₹${listing.price ? Number(listing.price).toLocaleString("en-IN") : "N/A"} / night
          </p>
          <a href="/listings/${listing._id}" style="font-size:12px;">View Listing →</a>
        </div>
      `;

            // Add marker
            new maptilersdk.Marker({ color: "#FF0000" })
                .setLngLat(coords)
                .setPopup(
                    new maptilersdk.Popup({ offset: 25 }).setHTML(popupContent)
                )
                .addTo(map);

            bounds.extend(coords);
            hasValidListings = true;
        }
    });

    // Fit map to show all markers
    if (hasValidListings) {
        map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
});
