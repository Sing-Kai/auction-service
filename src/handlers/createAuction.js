const {v4 : uuid} = require('uuid')
const AWS = require('aws-sdk')
const commonMiddleware = require('../lib/commonMiddleware');
const createError = require('http-errors')

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {

  const {title} = event.body;
  const now = new Date();

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createAt: now.toISOString(),
    highestBid: {
      amount:0,
    },
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
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(auction),
  };
}

exports.handler = commonMiddleware(createAuction)

