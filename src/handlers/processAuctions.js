const createError = require('http-errors');

const getEndedAuctions  = require('../lib/getEndedAuctions');
const closeAuction = require('../lib/closeAuction');

async function processAuctions(event, context){

  try{
    const auctionsToClose = await getEndedAuctions();
    console.log('processing auctions to close', auctionsToClose)
    const closePromises = auctionsToClose.map((auction) => closeAuction(auction))
    await Promise.all(closePromises)

    return {closed: closePromises.length}
  } catch(error) {
    console.log('error closing auctions', error)
    throw new createError.InternalServerError(error)
  }
}

exports.handler = processAuctions;