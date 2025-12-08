import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  private getEmailTemplate(title: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .info-table td { padding: 12px; border-bottom: 1px solid #eeeeee; }
          .info-table td:first-child { font-weight: bold; color: #555; width: 40%; }
          .info-table td:last-child { color: #333; }
          .amount { font-size: 28px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
          .status { display: inline-block; padding: 6px 12px; border-radius: 4px; font-weight: bold; }
          .status-pending { background-color: #fff3cd; color: #856404; }
          .details-box { background-color: #f8f9fa; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .details-box h3 { margin: 0 0 15px 0; color: #667eea; font-size: 18px; }
          .details-box table { width: 100%; }
          .details-box td { padding: 8px 0; }
          .details-box td:first-child { font-weight: bold; color: #555; width: 45%; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eeeeee; }
          .footer p { margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p><strong>Gaming Platform</strong></p>
            <p>This is an automated notification. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Gaming Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendDepositNotification(depositData: any) {
    const userType = depositData.playerId ? 'Player' : 'Agent';
    const userName = depositData.player?.username || depositData.agent?.username || 'Unknown';
    const userPhone = depositData.player?.phone || depositData.agent?.phone || 'N/A';

    const transferDetails = depositData.transferDetails || {};
    let depositDetailsHtml = '';
    
    if (depositData.transferType === 'UPI_TRANSFER') {
      depositDetailsHtml = `
        <div class="details-box">
          <h3>💳 Deposit Information</h3>
          <table>
            <tr>
              <td>UPI ID</td>
              <td>${transferDetails.upiId || 'N/A'}</td>
            </tr>
            <tr>
              <td>UPI App</td>
              <td>${transferDetails.upiAppName || 'N/A'}</td>
            </tr>
            <tr>
              <td>Transaction ID</td>
              <td>${transferDetails.transactionId || 'N/A'}</td>
            </tr>
            <tr>
              <td>Screenshot</td>
              <td>${depositData.screenshot ? 'Uploaded' : 'Not uploaded'}</td>
            </tr>
          </table>
        </div>
      `;
    } else if (depositData.transferType === 'BANK_TRANSFER') {
      depositDetailsHtml = `
        <div class="details-box">
          <h3>🏦 Deposit Information</h3>
          <table>
            <tr>
              <td>Account Number</td>
              <td>${transferDetails.accountNumber || 'N/A'}</td>
            </tr>
            <tr>
              <td>IFSC Code</td>
              <td>${transferDetails.ifscCode || 'N/A'}</td>
            </tr>
            <tr>
              <td>Bank Name</td>
              <td>${transferDetails.bankName || 'N/A'}</td>
            </tr>
            <tr>
              <td>Transaction Slip</td>
              <td>${depositData.transactionSlip ? 'Uploaded' : 'Not uploaded'}</td>
            </tr>
          </table>
        </div>
      `;
    }

    const content = `
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">A new deposit request has been received.</p>
      <div class="amount">₹${depositData.amount}</div>
      <table class="info-table">
        <tr>
          <td>User Type</td>
          <td>${userType}</td>
        </tr>
        <tr>
          <td>Name</td>
          <td>${userName}</td>
        </tr>
        <tr>
          <td>Phone</td>
          <td>${userPhone}</td>
        </tr>
      </table>
      ${depositDetailsHtml}
      <table class="info-table">
        <tr>
          <td>Status</td>
          <td><span class="status status-pending">${depositData.status}</span></td>
        </tr>
        <tr>
          <td>Date & Time</td>
          <td>${new Date(depositData.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
        </tr>
      </table>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `🔔 New Deposit Request - ${userName}`,
      html: this.getEmailTemplate('💰 New Deposit Request', content),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send deposit email:', error);
    }
  }

  async sendWithdrawNotification(withdrawData: any) {
    const userType = withdrawData.playerId ? 'Player' : 'Agent';
    const userName = withdrawData.player?.username || withdrawData.agent?.username || 'Unknown';
    const userPhone = withdrawData.player?.phone || withdrawData.agent?.phone || 'N/A';

    const transferDetails = withdrawData.transferDetails || {};
    let withdrawDetailsHtml = '';
    
    if (withdrawData.transferType === 'UPI_TRANSFER') {
      withdrawDetailsHtml = `
        <div class="details-box">
          <h3>💳 Withdrawal Information</h3>
          <table>
            <tr>
              <td>UPI ID</td>
              <td>${transferDetails.upiId || 'N/A'}</td>
            </tr>
            <tr>
              <td>UPI App</td>
              <td>${transferDetails.upiAppName || 'N/A'}</td>
            </tr>
          </table>
        </div>
      `;
    } else if (withdrawData.transferType === 'BANK_TRANSFER') {
      withdrawDetailsHtml = `
        <div class="details-box">
          <h3>🏦 Withdrawal Information</h3>
          <table>
            <tr>
              <td>Account Number</td>
              <td>${transferDetails.accountNumber || 'N/A'}</td>
            </tr>
            <tr>
              <td>IFSC Code</td>
              <td>${transferDetails.ifscCode || 'N/A'}</td>
            </tr>
            <tr>
              <td>Bank Name</td>
              <td>${transferDetails.bankName || 'N/A'}</td>
            </tr>
            <tr>
              <td>Account Holder</td>
              <td>${transferDetails.accountHolderName || 'N/A'}</td>
            </tr>
          </table>
        </div>
      `;
    }

    const content = `
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">A new withdrawal request has been received.</p>
      <div class="amount">₹${withdrawData.amount}</div>
      <table class="info-table">
        <tr>
          <td>User Type</td>
          <td>${userType}</td>
        </tr>
        <tr>
          <td>Name</td>
          <td>${userName}</td>
        </tr>
        <tr>
          <td>Phone</td>
          <td>${userPhone}</td>
        </tr>
      </table>
      ${withdrawDetailsHtml}
      <table class="info-table">
        <tr>
          <td>Status</td>
          <td><span class="status status-pending">${withdrawData.status}</span></td>
        </tr>
        <tr>
          <td>Date & Time</td>
          <td>${new Date(withdrawData.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
        </tr>
      </table>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `🔔 New Withdrawal Request - ${userName}`,
      html: this.getEmailTemplate('💸 New Withdrawal Request', content),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send withdrawal email:', error);
    }
  }
}
