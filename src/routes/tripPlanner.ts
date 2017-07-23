import { Router, IRouterMatcher, RequestHandler } from 'express';
import TripPlannerService from "../TripPlannerService";

let tripPlanner: Router = Router();

tripPlanner.post('/route', (req, res, next) => {
    TripPlannerService.calculateRoute(req.body)
    .then((token)=>{
        res.json({token:token}).end();
    })
    .catch((err)=>{
        res.status(500).send(err);
    });
});

tripPlanner.get('/route/:token', (req, res, next) => {
    TripPlannerService.getRoute(req.params.token)
    .then((shortest)=>{
        if (shortest.status == "success")
          res.json(shortest).end();
        else if (shortest.status == "in progress")
          res.json({status: shortest.status}).end();
        else
          res.status(500).send({status: "failure", error: "Fail to get shortest driving distance."});
    })
    .catch((err)=>{
        res.status(500).send({status: "failure", error: err});
    });
});

export default tripPlanner;