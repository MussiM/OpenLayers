let allStoresTurfPoints = [];
let vectorSource;
fetch("https://raw.githubusercontent.com/mmcloughlin/starbucks/master/locations.json").then((response) => { return response.json(); }).then((jsonObject) => {
    const points = [];
    vectorSource = new ol.source.Vector();
    for (let feature of jsonObject) {
        vectorSource.addFeature(new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([feature.longitude, feature.latitude]))
        }));
        points.push([feature.longitude, feature.latitude]);
    }
    allStoresTurfPoints = turf.points(points);
    const vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 4,
                fill: new ol.style.Fill({ color: 'red' })
            })
        })
    });
    const map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            vectorLayer
        ],
        view: new ol.View({
            center: [0, 0],
            zoom: 0
        })
    });
})


const countriesMap = new Map();
const select = document.getElementById("countrySelect");
select.addEventListener("change", e => {
    vectorSource.clear();
    const country = countriesMap.get(e.target.value);
    let storesToShow = allStoresTurfPoints;
    if (country !== undefined) {
        storesToShow = turf.pointsWithinPolygon(allStoresTurfPoints, country);
    }
    for(let store of storesToShow.features) {
        vectorSource.addFeature(new ol.Feature({
            geometry:  new ol.geom.Point(ol.proj.fromLonLat(store.geometry.coordinates))
        }));
    }
});

fetch("./countries.geojson").then(r => r.json()).then(json => {
    for (let feature of json.features) {
        countriesMap.set(feature.id, feature);
        const node = document.createElement("option");
        node.value = feature.id;
        node.innerText = feature.properties.name;
        select.appendChild(node);
    }
});