mapboxgl.accessToken = mapToken;            // declared at show.ejs
const camp = JSON.parse(campground);        // campground passed as a string
const coords = camp.geometry.coordinates;   // the coordinates from campground object

const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v11', // style URL
center: coords, // starting position [lng, lat]
zoom: 10 // starting zoom
});

new mapboxgl.Marker()
    .setLngLat(coords)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h4>${camp.title}</h4><p>${camp.location}</p>`
        )
    )
    .addTo(map)