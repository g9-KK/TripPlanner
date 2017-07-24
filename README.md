# Trip Planner

A back-end service that returns the shortest driving distance for travelling all specified locations.

## Getting Started

Trip Planner is built on Docker container(black-boxed). Please follow the following steps to install Trip Planner.

### Installing

Use Docker compose to set up Trip Planner. 

```
docker-compose build
```

Note: If you use a proxy under the network, please set the environment variable $http_proxy as your proxy.


### Start Up

In order to start Trip Planner, you need to run the following command.

```
docker-compose up
```

### How to use

Use the following POST and GET requests to get the shortest driving distance for travelling all specified locations.

Trip Planner service is available on http://localhost:8111.

- [POST `/route`: Submit start point and drop-off locations](#submit-start-point-and-drop-off-locations)
- [GET `/route/<TOKEN>`: Get shortest driving route](#get-shortest-driving-route)

### Submit start point and drop-off locations

Method:  
 - `POST`

URL path:  
 - `/route`

Input body:  

```json
{
	"path":		[
				["ROUTE_START_LATITUDE", "ROUTE_START_LONGITUDE"],
				["DROPOFF_LATITUDE_#1", "DROPOFF_LONGITUDE_#1"],
				...
			]
}
```

Response body:  
 - `HTTP code 200`  

```json
{ "token": "TOKEN" }
```

or

```json
{ "error": "ERROR_DESCRIPTION" }
```

---

Input body example:

```json
{
	"path":		[
				[
					["22.372081", "114.107877"],
					["22.284419", "114.159510"],
					["22.326442", "114.167811"]
				]
			]
}
```

Response example:

```json
{ "token": "9d3503e0-7236-4e47-a62f-8b01b5646c16" }
```

### Get shortest driving route
Get shortest driving route for submitted locations (sequence of `[lat, lon]` values starting from start location resulting in shortest path)

Method:  
- `GET`

URL path:  
- `/route/<TOKEN>`

Response body:  
- HTTP 200  

```json
{
	"status": "success",
	"path": [
		["ROUTE_START_LATITUDE", "ROUTE_START_LONGITUDE"],
		["DROPOFF_LATITUDE_#1", "DROPOFF_LONGITUDE_#1"],
		...
	],
	"total_distance": DRIVING_DISTANCE_IN_METERS,
	"total_time": ESTIMATED_DRIVING_TIME_IN_SECONDS
}
```  
or  

```json
{
	"status": "in progress"
}
```  
or  

```json
{
	"status": "failure",
	"error": "ERROR_DESCRIPTION"
}
```

---

URL example:  
 - `/route/9d3503e0-7236-4e47-a62f-8b01b5646c16`

Response example:  
```json
{
	"status": "success",
	"path": [
		["22.372081", "114.107877"],
		["22.326442", "114.167811"],
		["22.284419", "114.159510"]
	],
	"total_distance": 20000,
	"total_time": 1800
}
```

## Author

Karl Kong


## Acknowledgments

* Lalamove-challenge-backend : https://github.com/lalamove/challenge/blob/master/backend.md
