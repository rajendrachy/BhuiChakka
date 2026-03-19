import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import axios from 'axios';
import KhaltiCheckout from 'khalti-checkout-web';
import toast from 'react-hot-toast';

const PaymentModal = ({ amount, paymentType, metadata, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);

  const config = {
    publicKey: process.env.REACT_APP_KHALTI_PUBLIC_KEY,
    productIdentity: metadata?.propertyId || 'bhuichakka',
    productName: paymentType.replace('_', ' ').toUpperCase(),
    productUrl: window.location.origin,
    eventHandler: {
      onSuccess(payload) {
        verifyPayment(payload);
      },
      onError(error) {
        toast.error('Payment failed: ' + error);
      },
      onClose() {
        console.log('Widget closed');
      }
    },
    paymentPreference: ['KHALTI', 'EBANKING', 'MOBILE_BANKING', 'CONNECT_IPS'],
    amount: amount * 100 // Convert to paisa
  };

  const initiateKhaltiPayment = () => {
    const checkout = new KhaltiCheckout(config);
    checkout.show({ amount: amount * 100 });
  };

  const verifyPayment = async (payload) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/payments/verify', {
        pidx: payload.pidx,
        amount,
        paymentType,
        metadata
      });

      if (response.data.success) {
        toast.success('Payment successful!');
        onSuccess?.(response.data.data);
        onClose();
      }
    } catch (error) {
      toast.error('Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Complete Payment</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Payment Details:</p>
            <p className="text-2xl font-bold text-gray-900">NPR {amount.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">
              For: {paymentType.replace('_', ' ')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={initiateKhaltiPayment}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <img src="/khalti-logo.png" alt="Khalti" className="h-5" />
                Pay with Khalti
              </>
            )}
          </button>

          <button
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            Pay with eSewa
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          Secure payment powered by Khalti & eSewa
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;

