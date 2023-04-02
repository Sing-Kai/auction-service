const {v4 : uuid} = require('uuid')
const AWS = require('aws-sdk')
const commonMiddleware = require('../lib/commonMiddleware');
const createError = require('http-errors')
const validator = require('@middy/validator')
const {transpileSchema} = require('@middy/validator/transpile')
const createAuctionsSchema = require('../lib/schemas/createAuctionsSchema')

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {

  const {title} = event.body;
  const {email} = event.requestContext.authorizer;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount:0,
    },
    seller: email,
  }

  try{
    await dynamodb.put({
      TableName: 'AuctionsTable',
      Item: auction,
    }).promise();
  }catch(error){
    console.log('error with putting to dynamo', error);
    throw new createError.InternalServerError(error)
  }

  return {
    statusCode: 201,
    headers: {
      "Content-Type": "application/json", 
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(auction),
  };
}

exports.handler = commonMiddleware(createAuction).use(
  validator({
    eventSchema: transpileSchema(createAuctionsSchema),
    ajvOptions: {
      strict: false,
    },
  })
);

