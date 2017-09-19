import { IntentRecognizer, IRecognizeContext, IIntentRecognizerResult, IIntent, IEntity } from 'botbuilder';
import * as ApiAi from 'apiai';

export class ApiAiRecognizer extends IntentRecognizer {

    private app;
    constructor(private secretToken: string) {
        super();
        this.app = ApiAi(secretToken);
    }

    private makeRequest(text, sessionId): Promise<any> {
        return new Promise( (resolve, reject) => {
            const request = this.app.textRequest(text, {
                sessionId: sessionId
            });
            request.on('response', function(response) {
                // console.log(response);
                resolve(response);
            });
            request.on('error', function(error) {
                console.error(error);
                reject(error);
            });
            request.end();
        });
    }
    /** Implements the actual recognition logic. */
    onRecognize(context: IRecognizeContext, callback: (err: Error, result: IIntentRecognizerResult) => void): void {
        const result = { score: 0.0, intent: null, entities: [] };
        if (context && context.message && context.message.text) {
            const utterance = context.message.text;
            this.makeRequest(utterance, context.message.address.user.id + '|' + context.message.address.channelId).then( (data) => {
                result.intent = data.result.metadata.intentName;
                console.log(data.result.parameters);
                // tslint:disable-next-line:forin
                for (const parameter in data.result.parameters) {
                    result.entities.push({type: parameter, entity:  data.result.parameters[parameter] } as IEntity);
                }
                result.score = data.result.score;
                callback(null, result);
            }).catch((error) => {
                callback(error, null);
            });
        } else {
            callback(null, result);
        }
    }

    static recognize(utterance: string, modelUrl: string, callback: (err: Error, intents?: IIntent[], entities?: IEntity[]) => void) {
        console.log('recognize', utterance, modelUrl);
        /*try {
            var uri = url.parse(modelUrl, true);
            uri.query['q'] = utterance || '';
            if (uri.search) {
                delete uri.search;
            }
            request.get(url.format(uri), function (err, res, body) {
                var result;
                try {
                    if (res && res.statusCode === 200) {
                        result = JSON.parse(body);
                        result.intents = result.intents || [];
                        result.entities = result.entities || [];
                        result.compositeEntities = result.compositeEntities || [];
                        if (result.topScoringIntent && result.intents.length == 0) {
                            result.intents.push(result.topScoringIntent);
                        }
                        if (result.intents.length == 1 && typeof result.intents[0].score !== 'number') {
                            result.intents[0].score = 1.0;
                        }
                    }
                    else {
                        err = new Error(body);
                    }
                }
                catch (e) {
                    err = e;
                }
                try {
                    if (!err) {
                        callback(null, result.intents, result.entities, result.compositeEntities);
                    }
                    else {
                        var m = err.toString();
                        callback(err instanceof Error ? err : new Error(m));
                    }
                }
                catch (e) {
                    console.error(e.toString());
                }
            });
        }
        catch (err) {
            callback(err instanceof Error ? err : new Error(err.toString()));
        }*/
    }
}
