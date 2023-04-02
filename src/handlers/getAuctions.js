const AWS = require('aws-sdk')
const commonMiddleware = require('../lib/commonMiddleware');
const createError = require('http-errors')
const validator = require('@middy/validator')
const { transpileSchema }  = require('@middy/validator/transpile')
const dynamodb = new AWS.DynamoDB.DocumentClient();
const getAuctionsSchema = require('../lib/schemas/getAuctionsSchema')

async function getAuctions(event, context) {
  const {status} = event.queryStringParameters;
  let auctions;

  const params ={
    TableName: 'AuctionsTable',
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeValues: {
      ':status': status,
    },
    ExpressionAttributeNames:{
      '#status': 'status',
    }
  }

  try{
    const result = await dynamodb.query(params).promise();
    auctions = result.Items;
  }catch(error){
    console.log('error scanning dynamo', error);
    throw new createError.InternalServerError(error)
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json", 
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(auctions),
  };
}

exports.handler = commonMiddleware(getAuctions).use(
  validator({
    eventSchema: transpileSchema(getAuctionsSchema),
    ajvOptions: {
      useDefaults: true,
      strict: false,
    },
  })
);


