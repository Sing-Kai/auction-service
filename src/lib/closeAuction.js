const AWS = require('aws-sdk')

const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

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

  await dynamodb.update(params).promise();

  const {title, seller, highestBid} = auction;
  const {amount, bidder} = highestBid;

  if(amount === 0){
    await sqs.sendMessage({
      QueueUrl:process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject:'Sorry! Your item has not been sold',
        recipient:seller,
        body:`You item has been ${title} has beens sold, not one placed a bid :(`,
      })
    }).promise()

    return;
  }

  const notifySeller = sqs.sendMessage({
    QueueUrl:process.env.MAIL_QUEUE_URL,
    MessageBody: JSON.stringify({
      subject:'Your item has been sold',
      recipient:seller,
      body:`Congratulations! You item has been ${title} has been sold for $${amount}`,
    })
  }).promise()

  const notifyBidder = sqs.sendMessage({
    QueueUrl:process.env.MAIL_QUEUE_URL,
    MessageBody: JSON.stringify({
      subject:'You won an auction!',
      recipient:bidder,
      body:`Congratulations! you got won the bid for ${title} for $${amount}`,
    })
  }).promise()

  return Promise.all([notifySeller, notifyBidder])
}
