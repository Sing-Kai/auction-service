const createError = require('http-errors')
const middy = require('@middy/core')
const httpErrorHandler = require('@middy/http-error-handler')
const validator = require('@middy/validator')
const cors = require('@middy/http-cors')
const {transpileSchema} = require('@middy/validator/transpile')
const {getAuctionById} = require('./getAuction')
const uploadPictureToS3 = require('../lib/uploadPictureToS3');
const setAuctionPictureUrl = require('../lib/setAuctionPictureUrl')
const uploadAuctionPictureSchema = require('../lib/schemas/uploadAuctionPictureSchema')


const uploadAuctionPicture = async (event) => {

  const {id} = event.pathParameters;
  const {email} = event.requestContext.authorizer
  const auction = await getAuctionById(id);

  if(auction.seller !== email){
    throw new createError.Forbidden('You are not the seller of this auction!')
  }

  const base64 = event.body.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');

  let updatedAuction;

  try{
    const pictureUrl = await uploadPictureToS3(auction.id + '.jpg', buffer);
    console.log('uploaded picture to S3 url', pictureUrl);    
    updatedAuction = await setAuctionPictureUrl(id, pictureUrl);
  }catch(error){
    console.error(error)
    throw new createError.InternalServerError(error)
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(updatedAuction)
  }  
}

exports.handler = middy(uploadAuctionPicture)
.use(httpErrorHandler())
.use(validator({
    eventSchema: transpileSchema(uploadAuctionPictureSchema)
  }))
.use(cors())  