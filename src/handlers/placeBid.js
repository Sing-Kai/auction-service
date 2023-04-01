const AWS = require('aws-sdk')
const commonMiddleware = require('../lib/commonMiddleware');
const createError = require('http-errors')
const { getAuctionById } = require('./getAuction')
const dynamodb = new AWS.DynamoDB.DocumentClient();
const validator = require('@middy/validator')
const {transpileSchema} = require('@middy/validator/transpile')
const placeBidSchema = require('../lib/schemas/placeBidSchema')

async function placeBid(event, context) {

  const { id } = event.pathParameters;
  const { amount } = event.body;
  const {email} = event.requestContext.authorizer;

  const auction = await getAuctionById(id);

  //bidder identity validation
  if(email === auction.seller){
    throw new createError.Forbidden(`You cannot bid on your own auctions!`);
  }

  //prevent double bidding
  if(email === auction.highestBid.bidder){
    throw new createError.Forbidden(`You are currently the highest bidder and can't bid again`);
  }

  //auction status validation
  if(auction.status !== 'OPEN'){
    throw new createError.Forbidden(`You can not bid on a closed auction`);
  }

  //auction amount validation
  if (amount <= auction.highestBid.amount){
    throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}`);
  }

  const params = {
    TableName: 'AuctionsTable',
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
    ExpressionAttributeValues: {
      ':amount': amount,
      ':bidder': email,
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

exports.handler = commonMiddleware(placeBid).use(
  validator({
    eventSchema: transpileSchema(placeBidSchema),
    ajvOptions: {
      strict: false,
    },
  })
);

