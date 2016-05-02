function init(thisCase, officerCaseList) {
    // Basic options for a simple Google Map
    // For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    var mapOptions = {
        // How zoomed in you want the map to start at (always required)
        zoom: 11,

        // The latitude and longitude to center the map (always required)
        center: new google.maps.LatLng(41.8781, -87.6298), // Chicago

        // How you would like to style the map. 
        // This is where you would paste any style found on Snazzy Maps.
        styles: [{"featureType":"all","elementType":"all","stylers":[{"hue":"#ff0000"},{"saturation":-100},{"lightness":-30}]},{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#353535"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#656565"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#939393"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#505050"}]},{"featureType":"poi","elementType":"geometry.stroke","stylers":[{"color":"#808080"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#454545"}]},{"featureType":"transit","elementType":"labels","stylers":[{"hue":"#000000"},{"saturation":100},{"lightness":-40},{"invert_lightness":true},{"gamma":1.5}]}]
    };

    // Get the HTML DOM element that will contain your map 
    // We are using a div with id="map" seen below in the <body>
    var mapElement = document.getElementById('map');

    // Create the Google Map using our element and options defined above
    var map = new google.maps.Map(mapElement, mapOptions);

    // Let's also add a marker while we're at it

    if (!officerCaseList) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng( thisCase.latitude, thisCase.longitude),
            map: map,
            title: thisCase.case_number
        });

        var infowindow = new google.maps.InfoWindow({
            content: "holding..."
        });

        marker.addListener('click', function() {
            infowindow.setContent('<div id="content">'+ this.title +'</div>');
            infowindow.open(map, this);
        });

        map.setCenter(marker.position);
    } else if (officerCaseList) {

        var latlng = []; 
        var infowindow = null;

        for (var i=0; i<officerCaseList.length; i++){
            var thisCase = officerCaseList[i];
            var lat = thisCase.latitude;
            var lon = thisCase.longitude;

            if ( !isNaN(lat) && !isNaN(lon) ) {
                var coords = new google.maps.LatLng(thisCase.latitude, thisCase.longitude);
                latlng.push(coords);

                var marker = new google.maps.Marker({
                    position: coords,
                    map: map,
                    title: thisCase.case_number
                });

                infowindow = new google.maps.InfoWindow({
                    content: "holding..."
                });

                marker.addListener('click', function() {
                    infowindow.setContent('<div id="content">'+ this.title +'</div>');
                    infowindow.open(map, this);
                });
            }
            
        };

        // if an officer has more than one case, zoom map to show all markers
        if (officerCaseList.length > 1){
            var latlngbounds = new google.maps.LatLngBounds();
            for (var i = 0; i < latlng.length; i++) {
                latlngbounds.extend(latlng[i]);
            }
            map.fitBounds(latlngbounds);
        } else {
            map.setCenter(latlng[0]);
        }

    }
    
}