/*--------------------------------------------------------------------
INITIALIZE MAP
--------------------------------------------------------------------*/

// This token connects my map to my Mapbox account and gives access to the Mapbox API
mapboxgl.accessToken = 'pk.eyJ1Ijoic3RlcGhuZWUiLCJhIjoiY2xkdnp0dmExMDJreDNwcXd6ajY1cHp1cSJ9.JkrzcmpJLmS8dzQwqlCcRg';
// 'pk.eyJ1Ijoic3RlcGhuZWUiLCJhIjoiY2xkdnp0dmExMDJreDNwcXd6ajY1cHp1cSJ9.JkrzcmpJLmS8dzQwqlCcRg';

/* 
    Creates new constant variable called map, which is connected to the map container in the html file
    Style of the map is based on the style made in Mapbox
    Map is automatically centered to Toronto, with a zoom of 9
*/
const map = new mapboxgl.Map({
    container:'map',
    style: 'mapbox://styles/stephnee/clexnrafr000a01lgiv945csc',
    // 'mapbox://styles/stephnee/cldw19hpq000001qdec8pey8a',
    center: [-79.34702, 43.65107],    // Long, lat
    zoom: 8,
    maxBounds: [
        [-90, 10],     // South, West extent of map
        [-60, 60]     // North, East extent of map
    ],
});



/*--------------------------------------------------------------------
ADDING MAPBOX CONTROLS AS ELEMENTS ON MAP
--------------------------------------------------------------------*/

// Adds zoom and rotation controls to map
map.addControl(new mapboxgl.NavigationControl());

// Add fullscreen option to map
map.addControl(new mapboxgl.FullscreenControl());



/*--------------------------------------------------------------------
ADDING LAYERS TO MAP
--------------------------------------------------------------------*/

// This function loads the data layers of the map from the specified sources
map.on('load',() => {
    
    map.resize();   // This allowed me to change the size of the map
    
    // This adds the GeoJSON file as a source called mymappeddata
    map.addSource('wedding',{
        type:'geojson',
        data: 'https://neesteph.github.io/Lab1/wedding.geojson'
        // 'https://neesteph.github.io/Lab1/mymappeddata.geojson'
    });

    // This adds the "Name" layer from the GeoJSON file so that each point feature is labelled by the venue name
    map.addLayer({
        'id': 'name',
        'type': 'symbol',
        'source': 'wedding',
        'layout': {
            'text-field': ['get', 'Name'],
            'text-variable-anchor': ['bottom'],
            'text-radial-offset': 0.5,
            'text-justify': 'auto',
            'text-allow-overlap': true
        }
    });

    // This changes the sybmols to a wedding ring icon, given by the image link below
    map.loadImage('https://uxwing.com/wp-content/themes/uxwing/download/relationship-love/wedding-rings-icon.png',
    (error, image) => {
        if (error) throw error;
        map.addImage('rings-icon', image, { 'sdf': true }); 
            /*
                Icon image ID as "rings-icon"
                SDF boolean enables SDF, which helps maintain the quality of the image/icon
            */

        // This adds the venue types layer from the GeoJSON file
        map.addLayer({
            'id':'wedding-venues',
            'type':'symbol',
            'source': 'wedding',
            'layout': {
                'icon-image': 'rings-icon',
                // The size of the icon will be linearly interpolated so that it will change with the zoom level
                'icon-size': [      
                        'interpolate',      // INTERPOLATE creates continuous results by interplating between value pairs (the "stops")
                        ['linear'],         // LINEAR interpolation interpolates linearly between both stops
                        ['zoom'],           // ZOOM changes appearance with zoom level
                        6, 0.06,            // When zoom level is <= 6, icon size will be 0.6px (Stop #1)
                        9, 0.12             // when zoom level is >= 12, icon size will be 0.12px (Stop #2)
                    ],
                'icon-allow-overlap': true
            },
            /* 
                This categorizes the colours of the icons based on venue type 
                by matching the label value to the property value, via the MATCH expression
            */
            'paint':{  
                'icon-color': [
                    'match',
                    ['get', 'Venue Type'],  // GET expression gets the values from the 'Venue Type' property
                    'Hotel',
                    '#9F7EEC',
                    'Warehouse',
                    '#F7A240',
                    'Historical',
                    '#F8C8DC',
                    'Outdoor',
                    '#38AD3A',
                    'Restaurant',
                    '#FF4242',
                    'Golf Club',
                    '#72C5EE',
                    'Banquet Hall',
                    '#F9EA4E',
                    'Art Gallery and Museum',
                    '#16E9D1',
                    'Mansion',
                    '#2E2AF8',
                    '#000000'
                ]
            }
        });
    });

    // The next two functions adds a census tract layer GeoJSON file from Mapbox
    map.addSource('torontoct', {
        'type': 'vector',
        'url': 'mapbox://stephnee.8twvqlwx'
    });

    map.addLayer({
        'id': 'ct',
        'type': 'fill',
        'source': 'torontoct',
        'paint': {
            'fill-color': '#888888',
            'fill-opacity': 0.4,
            'fill-outline-color': 'black',
        },
        'source-layer': 'torontoct-30zg4i'
    });
});



/*--------------------------------------------------------------------
ADD INTERACTIVITY BASED ON HTML EVENT
--------------------------------------------------------------------*/

const geocoder = new MapboxGeocoder ({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: "ca"
});

// Positions the geocoder on the map based on the geocoder div in the html code
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

// This event listener allows the map to go back to its initial extent when the button is clicked on
document.getElementById('extentbtn').addEventListener('click', () => {
    map.flyTo({
        center: [-79.34702, 43.65107],
        zoom: 8,
        essential: true
    });
});

// Mouse changes from cursor to pointer when hovering over an icon
map.on('mouseenter', 'wedding-venues', () => {
    map.getCanvas().style.cursor = 'pointer';   
});

// Mouse changes from pointer to cursor when not hovering over an icon
map.on('mouseleave', 'wedding-venues', () => {
    map.getCanvas().style.cursor = '';
});

map.on('click', 'wedding-venues', (e) => {
    /*
        Parameter (e) gives all the information and properties related to the event
        In the variable, parameter e will give access to the features, and thus the properties of those features 
        In this case, I want the Name property of the features 
    */
    let venueAddress = e.features[0].properties.Address;
    let venueName = e.features[0].properties.Name;
    /* 
        LOG method will send a message that will appear in the console
        In this case, clicking on an icon will make the name and address of the venue appear in the console
    */
    console.log(venueAddress);

    new mapboxgl.Popup()        // This function displays a pop-up when an icon is clicked on
        .setLngLat(e.lngLat)    // Pop-up will appear according to the long/lat coordinates of the click
        .setHTML(venueName + "<br>" + venueAddress)    // The information that will appear in the pop-up container
        .addTo(map);

});

// Change display of legend based on check box
let legendCheck = document.getElementById('legendCheck');

// Boolean statement for display of legend based on check box
legendCheck.addEventListener('click', () => {
    if (legendCheck.checked) {
        legendCheck.checked = true;
        legend.style.display = 'block';
    }
    else {
        legend.style.display = "none";
        legendCheck.checked = false;
    }
});
``


/*--------------------------------------------------------------------
CREATE LEGEND IN JAVASCRIPT
--------------------------------------------------------------------*/

// Declare an array variable storing all of the venue types listed in the legend
const legendLabels = [
    'Hotel',
    'Warehouse',
    'Historical',
    'Outdoor',
    'Restaurant',
    'Golf Club',
    'Banquet Hall',
    'Art Gallery & Museum',
    'Mansion'
];

// Declare an array variable storing the colours of each venue type in the legend
const legendColours = [
    '#9f7eec',
    '#f7a240',
    '#f8c8dc',
    '#38ad3a',
    '#ff4242',
    '#72c5ee',
    '#f9ea4e',
    '#16e9d1',
    '#2e2af8',
];

//Declare legend variable using legend div tag
const legend = document.getElementById('legend');

/*
    Loop through each label in the legendLabels array
    After each loop/label, i will increase by 1 (starting at 0)
    For each loop, an item, key, and value is created for the label
*/
legendLabels.forEach((label, i) => {
    const color = legendColours[i];

    const item = document.createElement('div');     // An ITEM is a row for each label in the legend
    const key = document.createElement('span');     // A KEY is a coloured circle for each label in the legend

    key.className = 'legend-key';           // The shape and style properties of each key will follow the legend-key class in CSS 
    key.style.backgroundColor = color;      // The colour for each key is retreived from the legendColours array

    const value = document.createElement('span');   // Declare a value variable to each row in the legend
    value.innerHTML = `${label}`;                   // Assign text to the value variable based on the labels in the legend

    item.appendChild(key);      // Add a key to each row in the legend
    item.appendChild(value);    // Add the value to each row in the legend

    legend.appendChild(item);   // Add a row to the legend
});
