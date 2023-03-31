const AWS = require('aws-sdk')
const commonMiddleware = require('../lib/commonMiddleware');
const createError = require('http-errors')

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {

  const { id } = event.pathParameters;
  const { amount } = event.body;

  const params = {
    TableName: 'AuctionsTable',
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount',
    ExpressionAttributeValues: {
      ':amount': amount,
    },
    ReturnValues: 'ALL_NEW'
  }

  let updateAuction;

  try{
    const result = await dynamodb.update(params).promise();
    updateAuction = result.Attributes;
  }catch(error){
    console.log('error updating auction', error);
    throw new createError.InternalServerError(error)
  }
  
  return {
    statusCode: 200,
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(updateAuction),
  };
}

exports.handler = commonMiddleware(placeBid)

