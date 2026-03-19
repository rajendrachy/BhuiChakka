// Simple sendEmail utility (placeholder version)
const sendEmail = async (options) => {
  // This is a placeholder - in production, use real email service
  console.log('📧 Email sent to:', options.email);
  console.log('Subject:', options.subject);
  console.log('Message:', options.message);
  
  // Simulate successful email sending
  return { success: true, messageId: 'placeholder-' + Date.now() };
};

module.exports = sendEmail;
