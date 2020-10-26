const AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});


/*

Sms param
{
  "Message": "Hello from AWS",
  "PhoneNumber": "+380634385410" 
}
*/

exports.handler = async (event) => {
  let status = {
    status: '200',
    message: 'Request handled properly'
  };
  
  const smsParams = getSmsParamsFromSNS(event) || getSmsParamsFromAPIGateway(event);
  if (smsParams) {
    try{
      await new AWS.SNS({apiVersion: '2010-03-31'}).publish(smsParams).promise();
      console.log('Sms has sent');
    }
    catch(e) {
      console.error('Publish sms error.', e);
      status.status = 500;
      status.message = e;
    }
    
  } else {
    const errorMessage = 'Invalid or empty sms data.'
    console.error(errorMessage);
    status.message = errorMessage;
  }

  return status;  
};

function getSmsParamsFromSNS(event) {
  let smsParams;

  try{
    const rawMessage = event.Records[0].Sns.Message;
    smsParams = JSON.parse(rawMessage);
  }
  catch(e){
    console.warn('Parse sns message error.', e);
  }

  return smsParams;
}

function getSmsParamsFromAPIGateway(event) {
  if(event.hasOwnProperty('Message') && event.hasOwnProperty('PhoneNumber')) {
    return event;
  }
} 