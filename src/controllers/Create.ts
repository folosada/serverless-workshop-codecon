import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { customAlphabet } from 'nanoid';
import { initializeDB, saveUrl } from '../repository/Repository';
import { URL } from '../model/URL';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 6);

initializeDB();

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {

    const requestBody = event.body ? JSON.parse(event.body) : '';
    if (!requestBody || !requestBody.url) {
        return {
            statusCode: 400,
            body: JSON.stringify({message: 'The URL is a mandatory field!'})
        }
    }
    let linkId = requestBody.linkId;
    if (!linkId) {
        linkId = nanoid();
    }

    const record: URL = {
        linkId: linkId,
        url: requestBody.url,
        clicks: 0
    }

    await saveUrl(record);

    return {
        statusCode: 200,
        body: JSON.stringify({linkId: linkId})
    };
}