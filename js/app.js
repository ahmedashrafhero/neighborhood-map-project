// Data of Locations to make marker 
var locations = [{
        name: "Cairo Tower",
        category: "tower",
        lat:  30.045915,
        lng:  31.224287 ,
		details: "is a free-standing concrete tower located in Cairo, Egypt. At 187 m (614 ft), it has been 		  the tallest structure in Egypt and North Africa for about 50 years",
       
    },
    {
        name: "Orman Garden",
        category: "Botanical Garden",
        lat: 30.028107,
        lng: 31.213381,
		details: "The Orman Garden is one of the most famous Botanical gardens in Egypt. It is located at 			Giza, in Cairo. It dates back to 1875 and the reign of Khedive Isma'il Pasha who 		       established the garden on a larger site than it presently occupies as part of the 			Palace of the Khedive.",
       
    },
    {
        name: "Giza zoo",
        category: "zoo",
        lat:  30.021402,
        lng: 31.211508,
		details: "is a zoological garden in Giza, Egypt. It is one of the few green areas in 					 thecity, and includes Giza's largest park. The zoo covers about 80 acres (32 ha)",
        
    },
    {
        name: "Manial Palace",
        category: "Palace",
        lat: 30.026318,
        lng: 31.229065,
		details:" is a former Ottoman dynasty era palace and grounds on Rhoda Island on the Nile. It is located in the Sharia Al-Saray area in the El-Manial district of southern Cairo, Egypt. The palace and estate has been preserved as an Antiquities Council directed historic house museum and estate",
       
    },
    {
       name: "Egyption Museum ",
        category: "Museum",
        lat:30.047647,
        lng: 31.233618,
		details:"The Museum of Egyptian Antiquities, known commonly as the Egyptian Museum or Museum of Cairo, in Cairo, Egypt, is home to an extensive collection of ancient Egyptian antiquities. It has 120,000 items",
        
    },
];


//  open window contain Location name 
function generateWindowContent(location) {
    return ('<div class="windowcont">'+ '<h3>'+ location.name + '</h3>'+ 
			'<p>'+location.details+'</p>'+'</div>');
    
}


var map;


var isMapLoaded = false;


// funcation make handler help to  set markers on map and animate it 
function makeHandler(marker, i) {
    return function() {
        if (!isMapLoaded) {
            return;
        }
        infoWindow.setContent(generateWindowContent(locations[i]));
        infoWindow.open(map, marker);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1000);
        viewModel.loadData(locations[i]);

    };
}

//call back function init map conatin zoom and initalize map 
function initMap() {
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        mapTypeId: 'roadmap',
        zoom: 13
    };

    // Display a map on the page 
    map = new google.maps.Map(document.getElementById("map"), mapOptions);


    setMarkers(locations);

    function setMarkers() {
        // loop to get all five locations and their position to set them and handle bounces of markers
        for (i = 0; i < locations.length; i++) {
            var location = locations[i];
            var position = new google.maps.LatLng(location.lat, location.lng);
            bounds.extend(position);
            var marker = new google.maps.Marker({
                position: position,
                map: map,
                animation: google.maps.Animation.DROP,
           
                title: location.name,
                id: i
            });

            location.marker = marker;

            map.fitBounds(bounds);

            google.maps.event.addListener(marker, 'click', makeHandler(marker, i));

        }

        infoWindow = new google.maps.InfoWindow();

      
        var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
            this.setZoom(13);
            google.maps.event.removeListener(boundsListener);
        });

    }

    
    isMapLoaded = true;

}

// controller of map 
var ViewModel = function() {
    var self = this;

    self.locations = ko.observableArray(locations);
    self.query = ko.observable('');
    self.wikiLinks = ko.observableArray([]);
    self.visibleLists = ko.observable(false);

   

   /*  filter locations according to the name which user input */
    self.searchResults = ko.computed(function() {
        var q = self.query().toLowerCase();

        var filteredLocations = self.locations().filter(function(location) {
            return location.name.toLowerCase().indexOf(q) >= 0;
        });

       
         // set each marker's visibility to false, then loop through the filteredLocations
         // set each marker's visibility to true if it meets the specifications of filteredLocations
         
        if (isMapLoaded) {
            for (var i = 0; i < locations.length; i++) {
                locations[i].marker.setVisible(false);
            }
            for (i = 0; i < filteredLocations.length; i++) {
                filteredLocations[i].marker.setVisible(true);
            }
        }

        return filteredLocations;

    });

    //Clicking a location on the list displays  about the location 
    self.clickLocation = function(location) {
        if (!isMapLoaded) {
            return;
        }
        infoWindow.setContent(generateWindowContent(location));
        infoWindow.open(map, location.marker);
        location.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            location.marker.setAnimation(null);
        }, 1000);
        self.loadData(location);
    };

    self.loadData = function(location) {
        

        // clear out old data before new request
        self.wikiLinks([]);

        var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + location.category +
            '&format=json&callback=wikiCallback';

        // if the wikipedia links fail to load after 8 seconds the user will get the message 'failed to get wikipedia resources'.
        var wikiRequestTimeout = setTimeout(function() {
            self.wikiLinks.push("failed to get wikipedia resources");
        }, 8000);

        $.ajax({
            url: wikiUrl,
            dataType: "jsonp",
            success: function(response) {
                self.wikiLinks([]);
                var articleList = response[1];
                for (var i = 0; i < articleList.length; i++) {
                    articleStr = articleList[i];
                    var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                    self.wikiLinks.push('<a href="' + url + '">' + articleStr + '</a>');
                }
                clearTimeout(wikiRequestTimeout);
            }
        });
        return false;
    };
};

var viewModel = new ViewModel();
ko.applyBindings(viewModel);

function maperror() {
    alert("Google Maps has failed to load. Please check your internet connection and try again.");
}

