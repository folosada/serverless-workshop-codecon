import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { initializeDB, getUrl, updateClicks } from '../repository/Repository';
import { URL } from '../model/URL';

initializeDB()
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {

    if (!event.pathParameters || !event.pathParameters.linkId) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Not found' })
        };
    }

    const linkId: string = event.pathParameters.linkId;
    const record: URL | null = await getUrl(linkId);
    if (!record || !record.url) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Not found' })
        };
    }

    record.clicks = (record.clicks || 0)+1;

    await updateClicks(linkId, record.clicks);

    return {
        statusCode: 301,
        body: '',
        headers: {
            Location: record.url
        } 
    }

}