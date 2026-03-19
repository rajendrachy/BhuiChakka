const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');

class NotificationService {
  // Send notification to user
  static async sendToUser(userId, notification) {
    try {
      const user = await User.findById(userId);
      
      if (!user) return;

      // Save to database
      user.notifications.push({
        type: notification.type,
        message: notification.message,
        data: notification.data
      });
      await user.save();

      // Send email if enabled
      if (user.notificationPreferences?.email) {
        await sendEmail({
          email: user.email,
          subject: notification.subject || 'Bhuichakka Notification',
          message: notification.message
        });
      }

      // Send SMS if enabled and urgent
      if (user.notificationPreferences?.sms && notification.urgent) {
        await sendSMS({
          to: user.phone,
          message: notification.message
        });
      }

      // Emit socket event
      global.io?.emit(`user-${userId}`, {
        type: 'NOTIFICATION',
        data: notification
      });
    } catch (error) {
      console.error('Notification error:', error);
    }
  }

  // Send dispute update to all parties
  static async sendDisputeUpdate(disputeId, update) {
    try {
      const dispute = await Dispute.findById(disputeId)
        .populate('complainant.user')
        .populate('respondent.user');

      const parties = [dispute.complainant.user, dispute.respondent.user];

      for (const party of parties) {
        if (party) {
          await this.sendToUser(party._id, {
            type: 'DISPUTE_UPDATE',
            subject: `Dispute #${dispute.caseNumber} Update`,
            message: update.message,
            data: { disputeId, ...update.data },
            urgent: update.urgent
          });
        }
      }
    } catch (error) {
      console.error('Dispute notification error:', error);
    }
  }

  // Send document verification notification
  static async sendDocumentVerification(documentId, userId, status) {
    await this.sendToUser(userId, {
      type: 'DOCUMENT_VERIFIED',
      subject: 'Document Verification Update',
      message: `Your document has been ${status === 'verified' ? 'verified' : 'rejected'}`,
      data: { documentId, status },
      urgent: status === 'verified'
    });
  }

  // Send appointment reminder
  static async sendAppointmentReminder(booking) {
    const hoursBefore = 24; // 24 hours before
    
    setTimeout(async () => {
      await this.sendToUser(booking.user, {
        type: 'APPOINTMENT_REMINDER',
        subject: 'Upcoming Appointment Reminder',
        message: `You have an appointment with ${booking.professionalName} tomorrow at ${booking.time}`,
        data: { bookingId: booking._id },
        urgent: true
      });
    }, hoursBefore * 60 * 60 * 1000);
  }
}

module.exports = NotificationService;
