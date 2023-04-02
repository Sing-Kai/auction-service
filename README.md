## Auction Service

5 Lambda requests come from API Gateway, public gate that triggers endpoints like traditional Rest API. All of which get authorized before getting executed:
- createAuction: creates an auction
- getAuctions: gets auctions based on status with queryParams
- getAuction: gets auctin by the auction id
- placeBid: users place a bid on the auction 
- updateAuctionPicture: updated to S3 for storage

Final Lambda: ProcessAuction is triggered by AWS 
- checks whether the time is up with the auction 
- closes the auction 
- emails the seller and bidder if they are successful or not

## Getting started

install npm packages
```
npm install
```

deploy to AWS
```
serverless deploy
```
