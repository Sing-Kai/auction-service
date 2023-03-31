const AWS = require('aws-sdk')

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports = async (auction) =>{

  const params ={
    TableName: 'AuctionsTable',
    Key: {id: auction.id},
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: {
      ':status': 'CLOSED',
    },
    ExpressionAttributeNames:{
      '#status': 'status',
    }
  }

  const result = await dynamodb.update(params).promise();

  return result;
}
