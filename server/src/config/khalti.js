const axios = require('axios');

const KHALTI_API_URL = 'https://khalti.com/api/v2';
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

const initiatePayment = async (amount, orderId, orderName, customerInfo) => {
  try {
    const response = await axios.post(
      `${KHALTI_API_URL}/payment/initiate/`,
      {
        return_url: `${process.env.CLIENT_URL}/payment/verify`,
        website_url: process.env.CLIENT_URL,
        amount: amount * 100, // Convert to paisa
        purchase_order_id: orderId,
        purchase_order_name: orderName,
        customer_info: customerInfo
      },
      {
        headers: {
          'Authorization': `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Khalti payment error:', error.response?.data || error.message);
    throw error;
  }
};

const verifyPayment = async (pidx) => {
  try {
    const response = await axios.post(
      `${KHALTI_API_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          'Authorization': `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Khalti verification error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  initiatePayment,
  verifyPayment
};