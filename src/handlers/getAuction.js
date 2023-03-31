const AWS = require('aws-sdk')
const middy = require('@middy/core')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const httpEventNormalizer = require('@middy/http-event-normalizer')
const httpErrorHandler = require('@middy/http-error-handler')
const createError = require('http-errors')

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuction(event, context) {

  let auction;
  const { id } = event.pathParameters;
  try{
    const result = await dynamodb.get(
      {
        TableName: 'AuctionsTable',
        Key: { id }
      }
    ).promise();

    auction = result.Item;

  }catch(error){
    console.log('error getting auction dynamo', error);
    throw new createError.InternalServerError(error)
  }

  if(!auction){
    throw new createError.NotFound(`Auction with ID "${id}" not found!`)
  }

  return {
    statusCode: 200,
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(auction),
  };
}

exports.handler = middy(getAuction)
.use(httpJsonBodyParser())
.use(httpEventNormalizer())
.use(httpErrorHandler())


