import { ShortestInfo } from './TripPlannerService';

export default class Database {

    // TODO:  Currently using memory to save the shortest driving distances for each token.
    //        Use database instead of memory.
    private static minimalDatabase:any;

    // Set up database
    public static setup() {
        Database.minimalDatabase = {};
        console.log("Database has been set up!");
    }

    // Get shortest driving distance from token
    public static getShortest(token: string): Promise<ShortestInfo>{
        return (new Promise<ShortestInfo>((resolve, reject) => {
            if (!token)
                return reject("Token is empty.");

            if (!Database.minimalDatabase)
                return reject("No Database is found.");
            
            if (!(token in Database.minimalDatabase))
                return reject("Token is not found in database.");

            console.log("Retrieving from Database...");
            resolve(Database.minimalDatabase[token]);
        }))
    };

    // Save shortest driving distance and return a token
    public static saveShortest(token: string, shortest: ShortestInfo): Promise<null>{
        return (new Promise<null>((resolve, reject) => {
            if (!token)
                return reject("No Token is found");
            
            if (!shortest)
                return reject("Data is empty");

            if (!Database.minimalDatabase)
                return reject("No Database is found.");
            
            console.log("Saving to Database...");
            Database.minimalDatabase[token] = shortest;

            resolve();
        }))
    };

}