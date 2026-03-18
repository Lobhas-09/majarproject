
      // maptilersdk.config.apiKey = 'AFkjcVXlvq01IiFF0LnL';
      // const map = new maptilersdk.Map({
      //   container : 'map', // container's id or the HTML element to render the map
      //   style: maptilersdk.MapStyle.STREETS,
      // });
      
     
      // ✅ API key from .env (passed from controller via show.ejs)
maptilersdk.config.apiKey = mapToken;

const map = new maptilersdk.Map({
  container: "map",
  style: maptilersdk.MapStyle.STREETS,

  // ✅ Center map on listing location
  center: listingCoordinates,   // [longitude, latitude]
  zoom: 13,
});

// ✅ Add marker when map loads
map.on("load", function () {
  new maptilersdk.Marker({ color: "#FF0000" })
    .setLngLat(listingCoordinates)
    .setPopup(
      new maptilersdk.Popup({ offset: 25 })
        .setHTML(`
          <h6>${listingTitle}</h6>
          <p>📍 ${listingLocation}</p>
        `)
    )
    .addTo(map);
});