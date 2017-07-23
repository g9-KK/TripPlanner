import * as express from 'express';
import * as morgan from 'morgan';
import * as uuid from 'uuid';

export class MorganWrapper {
    protected morganFunction: Function;
    protected appName: string;
    protected excludedPath = ['/health', '/favicon.ico'];

    constructor(appName: string) {
        this.appName = appName;
        morgan.token('app-name', (req: express.Request, res: express.Response) => { return this.appName; });
        morgan.token('request-source', (req: express.Request, res: express.Response) => { return req.headers['x-forwarded-for'] || req.connection.remoteAddress; });
        morgan.token('request-id', (req: express.Request, res: express.Response) => { return req.headers['x-request-id']; });

        this.morganFunction = morgan(':date[iso] :app-name :request-source :method :url :status :request-id :res[content-length] - :response-time ms', {
            skip: (req: express.Request, res: express.Response): boolean => {
                return this.excludedPath.indexOf(req.url) != -1;
            }
        });
    }

    public logger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        let cid: string = req.header('x-request-id');
        if (!cid) {
            cid = uuid.v4();
            req.headers['x-request-id'] = cid;
        }
        return this.morganFunction(req, res, next);
    }
}