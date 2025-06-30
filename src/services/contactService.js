const e = require('cors');
const ContactModel = require('../models/contactModel');
const emailService = require('./emailService');

  exports.createContactRequest = async (contactData) => {
    try {
      // Create the contact request
      const contact = await ContactModel.create(contactData);
      
      // Send notification email to admin (optional)
      await emailService.notifyAdminOfContact(contact);
      
      return contact;
    } catch (error) {
      throw error;
    }
  }

  exports.getAllContactRequests = async () => {
    try {
      return await ContactModel.findAll();
    } catch (error) {
      throw error;
    }
  }

  exports.getContactRequestById = async (id) => {
    try {
      const contact = await ContactModel.findById(id);
      if (!contact) {
        throw new Error('Contact request not found');
      }
      return contact;
    } catch (error) {
      throw error;
    }
  }

  exports.updateContactStatus = async (id, status) => {
    try {
      const contact = await ContactModel.updateStatus(id, status);
      if (!contact) {
        throw new Error('Contact request not found');
      }
      return contact;
    } catch (error) {
      throw error;
    }
  }

  exports.deleteContactRequest = async (id) => {
    try {
      const contact = await ContactModel.delete(id);
      if (!contact) {
        throw new Error('Contact request not found');
      }
      return contact;
    } catch (error) {
      throw error;
    }
  }

  exports.getContactRequestsByEmail = async (email) => {
    try {
      return await ContactModel.findByEmail(email);
    } catch (error) {
      throw error;
    }
  }

  exports.sendContactNotification = async (contact) => {
    try {
      // You can customize this email template
      const emailData = {
        to: process.env.ADMIN_EMAIL || 'soumya@ibosoninnov.com',
        subject: 'New Contact Request',
        html: `
          <h2>New Contact Request Received</h2>
          <p><strong>Name:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          <p><strong>Company:</strong> ${contact.company || 'Not provided'}</p>
          <p><strong>Services:</strong> ${contact.services.join(', ') || 'Not specified'}</p>
          <p><strong>Date:</strong> ${new Date(contact.created_at).toLocaleString()}</p>
        `
      };
      
      await emailService.sendEmail(emailData);
    } catch (error) {
      // Log error but don't fail the contact creation
      console.error('Failed to send contact notification email:', error);
    }
  }


