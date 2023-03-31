const getAuctionsSchema =  {
  type: 'object',
  properties: {
    queryStringParameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['OPEN', 'CLOSED'],
          default: 'OPEN',
        },
      },
      default: { status: 'OPEN' },
      required: ['status'],
    },
  },
  required: ['queryStringParameters'],
};

module.exports = getAuctionsSchema