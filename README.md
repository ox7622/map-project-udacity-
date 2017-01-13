### Neightbourhood Map

#### Description
The project is based on my usual routine and the info I use daily, like weather and traffic.
#### APIs used:
* Google Maps API for markers, info windows, street view photos and geocoding th address for each marker (+ Traffic layer),
* Weather underground API for weather updates on the default maps location,
* Foursquare API for additional info on the intersting places near the markers and urls provide by 3rd parties.

#### Features:
1. Map is mobile - friendly
2. Map has a simple filter for locations and clear filter button
3. weather updates can be hided as well as the My plces panel
4. Map shows the title, the address of each location, street view static photo provided by Google street view (when available) and top 5 places in Foursquare.
5. Lists are handled by Knockout library
6. APIs requests are made with Jquery's Ajax
7. KnockoutJs is used for handling the floating panel and weather forcast hiding/showing and their icons change.
