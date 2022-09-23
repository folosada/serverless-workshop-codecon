import { AWSError, DynamoDB } from 'aws-sdk';
import { DocumentClient, GetItemInput, GetItemOutput, PutItemInput, PutItemOutput, UpdateItemInput, UpdateItemOutput } from 'aws-sdk/clients/dynamodb';
import { PromiseResult } from 'aws-sdk/lib/request';
import { URL } from '../model/URL';

let _instance: DocumentClient;
const tableName: string = process.env.SERVERLESS_WORKSHOP_TABLE || 'serverless-workshop-table';

export const initializeDB = () => {
    if (!_instance) {
        _instance = process.env.IS_OFFLINE ? new DynamoDB.DocumentClient({
            endpoint: 'http://localhost:8000'
        }) : new DynamoDB.DocumentClient();
    }
}

export const saveUrl = async (record: URL): Promise<PromiseResult<PutItemOutput, AWSError>> => {
    const params: PutItemInput = {
        TableName: tableName,
        Item: {
            linkId: record.linkId,
            url: record.url,
            clicks: record.clicks
        } 
    };
    return _instance.put(params).promise();
}

export const getUrl = async (linkId: string): Promise<URL | null> => {
    const params: GetItemInput = {
        TableName: tableName,
        Key: {
            linkId: linkId
        }
    };
    const result: PromiseResult<GetItemOutput, AWSError> = await _instance.get(params).promise();
    if (result.$response.error) {
        throw new Error(result.$response.error.message);
    }
    if (result.Item && result.Item.linkId) {
        const record: URL = {
            linkId: result.Item.linkId,
            url: result.Item.url,
            clicks: Number(result.Item.clicks)
        }
        return record;
    }
    return Promise.resolve(null);
}

export const updateClicks = async (linkId: string, clicks: Number): Promise<PromiseResult<UpdateItemOutput, AWSError>> => {
    const params: UpdateItemInput = {
        TableName: tableName,
        Key: {
            linkId: linkId
        },
        UpdateExpression: 'set clicks = :clicks',
        ExpressionAttributeValues: {
            ':clicks': clicks 
        }
    }
    return _instance.update(params).promise();
}