const AWS = require('aws-sdk')
const middy = require('@middy/core')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const httpEventNormalizer = require('@middy/http-event-normalizer')
const httpErrorHandler = require('@middy/http-error-handler')
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

exports.handler = middy(getAuctions)
.use(httpJsonBodyParser())
.use(httpEventNormalizer())
.use(httpErrorHandler())


