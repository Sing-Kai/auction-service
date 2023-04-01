const AWS = require('aws-sdk')

const dynamodb = new AWS.DynamoDB.DocumentClient();

const setAuctionPictureUrl = async(id, pictureUrl) => {
  const params ={ 
    TableName: 'AuctionsTable',
    Key: { id },
    UpdateExpression: 'set pictureUrl = :pictureUrl',
    ExpressionAttributeValues: {
      ':pictureUrl': pictureUrl,
    },
    ReturnValues: 'ALL_NEW',
  }

  const result = await dynamodb.update(params).promise();
  return result.Attributes;
}

module.exports = setAuctionPictureUrl