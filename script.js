var locations = [{
    title: 'School 4',
    location: {
        lat: 55.628586,
        lng: 37.855293
    }
}, {
    title: 'Magnit',
    location: {
        lat: 55.623414,
        lng: 37.847645
    }
}, {
    title: 'Post office',
    location: {
        lat: 55.625224,
        lng: 37.854933
    }
}, {
    title: 'Monastry',
    location: {
        lat: 55.622687,
        lng: 37.840826
    }
}, {
    title: 'School 1',
    location: {
        lat: 55.6266881,
        lng: 37.84330100000006
    }
}, {
    title: 'Town Hall',
    location: {
        lat: 55.625676,
        lng: 37.850713
    }
}, {
    title: 'Metro Station',
    location: {
        lat: 55.61386599999999,
        lng: 37.744544
    }
}, {
    title: 'Work',
    location: {
        lat: 55.778464,
        lng: 37.58579
    }
}, {
    title: 'Kremlin',
    location: {
        lat: 55.7520233,
        lng: 37.6174994
    }
}, ];


function Location(data) {
    var self = this;
    this.title = data.title;
    this.location = data.location;

    this.marker = new google.maps.Marker({
        position: data.location,
        map: map,
        title: data.title,
        animation: google.maps.Animation.DROP,
    });
    this.infowindow = new google.maps.InfoWindow({
        maxWidth: 250,
    });


    this.visible = ko.observable(true);


    this.showMarker = ko.computed(function() {
        if (this.visible() === true) {
            this.marker.setMap(map);

        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);




}
//Foursquare
function foursquareAPI(loc) {
    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + loc.latlng + '&client_id=YWV4UK3YYSNH1HRS2AQ4XYXTDI1G4KH0CL3YYQTIBQ3I3JOS&client_secret=JIE2LVJ3BVB3Y5CVI5GCASBFAVFGOJXWST35AXLYDXOTIB5P&v=20161230';


    $.ajax({
            url: foursquareURL,
            dataType: "json",
        })
        .done(function(data) {
            $("#foursquare_title").text("Top 5 Foursquare places:");

            for (var n = 0; n < 5; n++) {
                var venue = data.response.venues[n].name;
                var icon = data.response.venues[n].categories[0].icon.prefix + "bg_32" + data.response.venues[n].categories[0].icon.suffix;
                var urlFs = data.response.venues[n].url;

                $("<li class='foursquare_item'><img class='icon_fs' src='" + icon + "'>").appendTo(".foursquare");

                if (urlFs) {

                    $("<p> " + venue + " - url: " + "<a href='" + urlFs + "'>" + urlFs + "</a></p>").appendTo(".foursquare");


                } else {

                    $("<p> " + venue + "</p>").appendTo(".foursquare");


                }

            }

        })
        .fail(function() {
            alert("Error: something went wrong with Foursquare data. Please check your internet connection.");
        });

}


// weather API
var weatherURL = "https://api.wunderground.com/api/d20c66e529768328/hourly/q/55.6271146,37.8481199.json";

$.ajax({
        url: weatherURL,
        dataType: "jsonp",
    })
    .done(function(data) {

        $("#weather_header").text("Hourly forecast");

        for (var n = 0; n < 17; n = n + 4) {
            var forecast = data.hourly_forecast[n];
            var temp_c = forecast.temp.metric;
            var icon = 'https://icons.wxug.com/i/c/f/' + forecast.icon + '.gif';
            var current_hour = forecast.FCTTIME.civil;
            var feels_like = forecast.feelslike.metric;

            $(".weather_hourly").append('<li class="hours"><p class="current_hour">' + current_hour + '</p><div class="icon_temp"><img class="icon" src="' + icon + '" alt=" weather_icon"><p class="temperature"><b>' + temp_c + '</b></p></div><p>Feels like: <span class="feels_like"><b>' + feels_like + '</b></span></p>' + '</li>');

        }

    })
    .fail(function() {
        alert("Error: something went wrong with Weather update. Please check your internet connection.");
    });




function closeLastOpenedInfoWindo() {
    if (lastOpenedInfoWindow) {
        lastOpenedInfoWindow.close();

    }

}
var map, lastOpenedInfoWindow;

function ViewModel() {
    var self = this;
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 55.6271146,
            lng: 37.8481199
        },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false

    });




    this.valueFilter = ko.observable("");
    this.filterValue = ko.observable("");
    self.locationsList = ko.observableArray([]);
    locations.forEach(function(loc) {
        self.locationsList.push(new Location(loc));
    });

    // filter

    self.filteredItems = ko.computed(function() {
        var filter = self.filterValue().toLowerCase();
        if (!filter) {
            self.locationsList().forEach(function(item) {
                item.visible(true);

            });
            return self.locationsList();
        } else {
            return ko.utils.arrayFilter(self.locationsList(), function(item) {
                var string = item.title.toLowerCase();
                var result = (string.search(filter) >= 0);
                item.visible(result);

                return result;
            });

        }
    }, self);



    self.setClickFunction = function(loc) {
        self.locationsList().forEach(function(loc) {

            google.maps.event.addListener(loc.marker, 'click', function() {

                self.clickFunction(loc);
            });
        });

    };

    self.clickFunction = function(data) {

        closeLastOpenedInfoWindo();

        data.latlng = [data.location.lat, data.location.lng];
        foursquareAPI(data);
        data.contentString = '<div class="infowindow"><br><h3>' + data.title + '</h3><br><span id="marker_address"></span><br><div><h4 id="foursquare_title"></h4><ol class="foursquare"></ol></div></div>';
        if ($(window).width() > 800) {

            map.setZoom(16);
        }


        geoCoder(data);

        data.infowindow.setContent(data.contentString);
        data.infowindow.open(map, data.marker);
        map.setCenter(data.location);



        lastOpenedInfoWindow = data.infowindow;

        self.setMarkerAnimation(data);


    };

    self.setMarkerAnimation = function(loc) {
        loc.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            loc.marker.setAnimation(null);
        }, 700);
    };


    function geoCoder(data) {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            'location': data.location
        }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    var address = results[0].formatted_address;
                    $("#marker_address").text(address);

                } else {
                    window.alert('No results found');
                }
            } else {

                window.alert('Geocoder on ' + data.title + ' failed due to: ' + status);
                console.log(results);
            }
        });
    }


    // clear filter

    self.clearFilter = function() {
        self.valueFilter("");
        self.filterValue("");
    };

    //add google traffic layer  

    var trafficLayer = new google.maps.TrafficLayer();
    self.controlText = ko.observable("Traffic Off");
    self.myVar = ko.observable(false);

    self.trafficOn = function() {
        if (self.controlText() == "Traffic Off") {
            self.controlText("Traffic On");
            trafficLayer.setMap(map);
            self.myVar(true);

        } else if (self.controlText() == "Traffic On") {
            self.controlText("Traffic Off");
            trafficLayer.setMap(null);
            self.myVar(false);

        }
    };




    self.myW = ko.observable("");
    self.myClass = ko.observable("")
    if ($(window).width() < 800) {
        self.myW(1);
        self.myClass(1);
    } else {
        self.myW(0);
        self.myClass(0);
    }
    // Hide/show floating panel

    self.hidePanel = function() {
        if (self.myClass()) {
            self.myClass(false);

        } else {
            self.myClass(true);
        }
    };
    // change icon
    self.changeIcon = ko.pureComputed(function() {
        return self.myClass() > 0 ? "fa fa-chevron-right" : "fa fa-chevron-left";
    }, self);


    // Hide/show weather forecast

    self.hideWeather = function() {
        if (self.myW()) {
            self.myW(false);

        } else {
            self.myW(true);
        }
    };

    // change icon
    self.changeWeatherIcon = ko.pureComputed(function() {
        return self.myW() > 0 ? "fa fa-chevron-down" : "fa fa-chevron-up";
    }, self);

    google.maps.event.addDomListener(window, 'load', function() {

        self.setClickFunction();

    });

}

function startApp() {
    ko.applyBindings(new ViewModel);
}

function errorHandling() {
    alert("Google Maps has failed to load. Please check your internet connection, API settings and try again.");
}