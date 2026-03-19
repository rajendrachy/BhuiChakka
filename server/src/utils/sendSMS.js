// Simple sendSMS utility (placeholder version)
const sendSMS = async (options) => {
  // This is a placeholder - in production, use real SMS service
  console.log('📱 SMS sent to:', options.to);
  console.log('Message:', options.message);
  
  // Simulate successful SMS sending
  return { success: true, messageId: 'placeholder-' + Date.now() };
};

module.exports = sendSMS;
