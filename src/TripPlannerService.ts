import { ShortestInfo } from './TripPlannerService';
import {GoogleMapsClient, IDistanceMatrixParameters} from './GoogleMapsClient';
import Database from './Database';
import * as uuid from 'uuid';

export interface ShortestInfo{
  path: Array<Array<string>>,
  total_distance: number,
  total_duration: number,
  status: "success"| "in progress" | "failure"
}

export default class TripPlannerService {

  // For post route
  public static calculateRoute(body:any):Promise<string>{
    return (new Promise<string>((resolve, reject) => {

      // Request body is empty
      if (!body || !body.path) 
        return reject("Request body is empty.");
      
      let locations:Array<Array<string>>;
      try {
        locations = JSON.parse(body.path);
      }catch (err){
        return reject("Error in parsing request body\n"+ err);
      }
      
      let start:string;
      let waypoints:Array<string>=[];
      let token: string = uuid.v4();

      if (locations.constructor != Array || locations.length < 2)
        return reject("No start point/ waypoint(s) is/are found.");

      let inProgressShortest:ShortestInfo = {
          path: locations,
          total_distance: null,
          total_duration: null,
          status: "in progress"
      };

      Database.saveShortest(token, inProgressShortest)
      .then(()=>{
        resolve(token);
      })
      .catch((err)=>{
        return reject(err);
      });

      // Asynchronously calculate route and save to Db
      console.log("Asynchronously calculating the shortest driving ditance...");
      
      locations.forEach(function(location, i){
        if (i == 0)
          start = locations[0].join(',');
        else {
          waypoints.push(location.join(','));
        }
      });
      TripPlannerService.calcShortestDrivDistance(start, waypoints)
      .then(data=>{
        let shortest: ShortestInfo = {
          path: locations,
          total_distance: data.distance,
          total_duration: data.duration,
          status: data.status
        }
        Database.saveShortest(token, shortest);
      })
      .catch(err=>{
        let errorShortest: ShortestInfo = {
          path: locations,
          total_distance: null,
          total_duration: null,
          status: "failure"
        }
        Database.saveShortest(token, errorShortest);
      });
    }));
  }

  // For get route from token
  public static getRoute(token:string):Promise<ShortestInfo>{
    return (new Promise<ShortestInfo>((resolve, reject) => {
      Database.getShortest(token)
      .then((shortest)=>{
        resolve(shortest);
      })
      .catch(err => reject(err));
    }));
  }

  // Calculate the shortest driving distance from start to the dropoff locations
  // and that place.
  public static calcShortestDrivDistance(start: string, waypoints: Array<string>):Promise<any>{
    return (new Promise<any>((resolve, reject) => {

        if (!start)
          return reject("Starting location is empty.");

        if (!waypoints || waypoints.length == 0)
          return reject("Waypoint(s) is/are empty.");

        let locationMatrix: Array<string> = [];

        locationMatrix.push(start);
        locationMatrix = locationMatrix.concat(waypoints);

        var params:IDistanceMatrixParameters = {
            origins: locationMatrix.join('|').trim(),
            destinations: locationMatrix.join('|').trim(),
            mode: "DRIVING"
        };
        
        // Get distance matrix for calculation of shortest driving distance in the next step
        GoogleMapsClient.getDistanceMatrix(params)
        .then(res => {
          let passedWaypoints: Array<number> = [];
          let totalDistance: number = 0;
          let totalDuration: number = 0;
          
          // Google map API finishes the processing and returns OK
          if (res.status == "OK") {
            let waypointFrom:Array<any> = res.rows;
            let waypointFromAt : number = 0;
            
            let currentWaypointAt = 0;
            
            // Heuristic shortest path algorithm:
            // Loop through each waypoint and find the shortest path to the next waypoint
            while (waypointFromAt < waypointFrom.length) {
              
              let routes:Array<any> = waypointFrom[currentWaypointAt].elements;

              let shortestDistance: number = Number.MAX_VALUE;
              let shortestDuration: number = Number.MAX_VALUE;
              let shortestWaypoint: number = currentWaypointAt;

              routes.forEach(function(route, waypointToAt) {

                  // Skip if any of the followings meet;
                  // 1. heading to itself
                  // 2. heading to the waypoints that it has been passed by
                  // 3. route result is not valid or no result
                  if (waypointToAt == currentWaypointAt ||
                   passedWaypoints.indexOf(waypointToAt) > -1 ||
                   route.status != "OK") {
                    return;
                  }
                  
                  // Find the shortest driving distance route
                  if (route.distance.value < shortestDistance) {
                    shortestDistance = route.distance.value;
                    shortestDuration = route.duration.value;
                    shortestWaypoint = waypointToAt;
                  }

              });

              // Calculate the total distance and duration for the shortest driving distance
              totalDistance += shortestDistance;
              totalDuration += shortestDuration;
              currentWaypointAt = shortestWaypoint;
              passedWaypoints.push(shortestWaypoint);
              

              waypointFromAt++;
            }
          }
          else {
            return reject("Google Maps API returns invalid response.");
          }

          console.log("Finish calculating the shortest driving distanece.")

          resolve({ distance: totalDistance,
                    duration: totalDuration,
                    status: "success"});
        })
        .catch(err => {
          reject(err);
        });
        }));

  }

};