const AWS = require('aws-sdk')
const commonMiddleware = require('../lib/commonMiddleware');
const createError = require('http-errors')

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {

  let auctions;

  try{
    const result = await dynamodb.scan(
      {
        TableName: 'AuctionsTable'
      }
    ).promise();

    auctions = result.Items;

  }catch(error){
    console.log('error scanning dynamo', error);
    throw new createError.InternalServerError(error)
  }

  return {
    statusCode: 200,
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(auctions),
  };
}

exports.handler = commonMiddleware(getAuctions)


