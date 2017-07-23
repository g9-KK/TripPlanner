import * as GoogleMapsAPI from 'googlemaps';

export interface IDistanceMatrixParameters {
  origins: string,
  destinations: string,
  mode?: "DRIVING"|"BICYCLING"|"TRANSIT"|"WALKING"
  //TODO: There are more parameters in Google Map API Documentation
}

export interface IGoogleMapsConfigs {
  key: string,
  stagger_time: number,
  encode_polylines: boolean,
  secure: boolean,
  proxy?: string
}

export class GoogleMapsClient {

      private static client:GoogleMapsAPI;

      // Set up google Maps Client
      public static setup(configs:IGoogleMapsConfigs) {
        GoogleMapsClient.client = new GoogleMapsAPI(configs);
        console.log("Google Maps Client has been set up!");
      }
      
      // Get distance matrix from Google Maps API
      public static getDistanceMatrix(params:IDistanceMatrixParameters) {
        return (new Promise<any>((resolve, reject) => {
            
            console.log("Calling Google Maps API to get distance matrix...");

            GoogleMapsClient.client.distance(params, function(err, result){
              if (err) {
                return reject(err);
              }
              resolve(result);
            });
        }));
      }


};