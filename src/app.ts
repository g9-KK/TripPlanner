import * as cookieParser from 'cookie-parser';
import {MorganWrapper} from './MorganWrapper';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import tripPlanner from './routes/tripPlanner';
import { GoogleMapsClient, IGoogleMapsConfigs } from './GoogleMapsClient';
import Database from './Database';
var config = require('./app_configs');

const app: express.Express = express();

// web server routing setup
app.use(helmet());
app.use(helmet.noCache());
app.get('/health', function (req, res) {
  res.send('Health check service. OK.').end();
});

app.use(new MorganWrapper("TripPlanner").logger);
// app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', tripPlanner);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err['status'] = 404;
  next(err);
});

// error handlers
app.use((err: any, req, res, next) => {
  res.status(err['status'] || 500).send({
    message: err.message
  }).end();
});

var configs:IGoogleMapsConfigs = {
  key: config.googleMapsAPIKey,
  stagger_time:       1000, // for elevationPath
  encode_polylines:   false,
  secure:             true, // use https
  proxy:              config.proxy // optional, set a proxy for HTTP requests
};

GoogleMapsClient.setup(configs);
Database.setup();

export default app;