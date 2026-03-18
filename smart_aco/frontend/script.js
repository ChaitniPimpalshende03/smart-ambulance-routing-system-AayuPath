// Initialize Map (Mumbai default)
const map = L.map('map').setView([19.0760, 72.8777], 12);

// Map Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: "© OpenStreetMap"
}).addTo(map);

let routeLayer = null;


// -------- GEOCODING FUNCTION --------
async function geocode(place){

    const url = `https://api.openrouteservice.org/geocode/search?api_key=eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjJjNzRkY2I2MjUzMGFhYWM1NDAxMDQxNmYzYzcwZTIxZTZhZGQzZTBlZmI5MDBkZmJlZmI3MDJlIiwiaCI6Im11cm11cjY0In0=&text=${place}`;

    const res = await fetch(url);
    const data = await res.json();

    if(!data.features.length){
        alert("Location not found");
        return null;
    }

    return data.features[0].geometry.coordinates;
}



// -------- MAIN ROUTE FUNCTION --------
async function findRoute(){

    try{

        const startPlace = document.getElementById("start").value;
        const hospitalPlace = document.getElementById("hospital").value;

        if(!startPlace || !hospitalPlace){
            alert("Please enter both locations");
            return;
        }

        // Convert names to coordinates
        const start = await geocode(startPlace);
        const end = await geocode(hospitalPlace);

        if(!start || !end) return;

        // Call backend
        const response = await fetch("http://127.0.0.1:5000/route",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                start:start,
                end:end
            })
        });

        const data = await response.json();

        // Show ACO result
        document.getElementById("routes").innerHTML =
        "ACO Routes Found: " + data.routes_found;

        // Show distance
        document.getElementById("distance").innerHTML =
        "Shortest Distance: " + (data.distance/1000).toFixed(2) + " km";


        // Remove old route if exists
        if(routeLayer){
            map.removeLayer(routeLayer);
        }

        // Draw route
        const latlngs = data.coordinates;

        routeLayer = L.polyline(latlngs,{
            color:"green",
            weight:5
        }).addTo(map);

        map.fitBounds(routeLayer.getBounds());

        // Markers
        L.marker(latlngs[0]).addTo(map).bindPopup("Accident Location").openPopup();
        L.marker(latlngs[latlngs.length-1]).addTo(map).bindPopup("Hospital");

    }

    catch(error){
        console.error("Error:",error);
        alert("Something went wrong. Check backend.");
    }

}