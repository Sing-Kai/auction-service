const AWS = require('aws-sdk')
const commonMiddleware = require('../lib/commonMiddleware');
const createError = require('http-errors')

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.getAuctionById = async (id) => {

  let auction;

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

  return auction;
}

async function getAuction(event, context) {

  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);

  return {
    statusCode: 200,
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(auction),
  };
}

exports.handler = commonMiddleware(getAuction)

