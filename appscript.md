


function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById("1TmtOr_QCH8Zbh0SMdZavPgdWOlp7MRSTa4PToFmcMxs").getSheetByName("Enquiries");
    
    const data = {
      timestamp: new Date(),
      enquiryType: e.parameter.enquiryType,
      email: e.parameter.email,
      phone: e.parameter.phone,
      firstName: e.parameter.firstName,
      lastName: e.parameter.lastName,
      dob: e.parameter.dob,
      guardianName: e.parameter.guardianName || "",
      guardianPhone: e.parameter.guardianPhone || "",
      message: e.parameter.message || ""
    };
    
    // Save to sheet
    sheet.appendRow([
      data.timestamp,
      data.enquiryType,
      data.email,
      data.phone,
      data.firstName,
      data.lastName,
      data.dob,
      data.guardianName,
      data.guardianPhone,
      data.message
    ]);
    
    // Send acknowledgment email to enquirer
    sendAcknowledgmentEmail(data);
    
    // Send notification email to admin
    sendNotificationEmail(data);
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", message: "Data saved and emails sent successfully" })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Failed to process enquiry" })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendAcknowledgmentEmail(data) {
  try {
    const subject = "Thank You for Your Enquiry - We'll Be in Touch Soon!";
    const htmlBody = createAcknowledgmentEmailTemplate(data);
    
    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      htmlBody: htmlBody
    });
    
    console.log('Acknowledgment email sent to:', data.email);
  } catch (error) {
    console.error('Error sending acknowledgment email:', error);
  }
}

function sendNotificationEmail(data) {
  try {
    // Replace with your admin email
    const adminEmail = "touchlinedxb@gmail.com";
    
    const subject = `New ${data.enquiryType} Enquiry from ${data.firstName} ${data.lastName}`;
    const htmlBody = createNotificationEmailTemplate(data);
    
    MailApp.sendEmail({
      to: adminEmail,
      subject: subject,
      htmlBody: htmlBody
    });
    
    console.log('Notification email sent to admin:', adminEmail);
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
}

function createAcknowledgmentEmailTemplate(data) {
  const enquiryDate = new Date(data.timestamp).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Your Enquiry</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #06203D;
            background-color: #f8f9fa;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 10px 30px rgba(6, 32, 61, 0.1);
            border-radius: 12px;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #06203D 0%, #BEB071 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 20px;
            font-weight: 500;
            color: #06203D;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .enquiry-details {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 10px;
            padding: 25px;
            margin: 30px 0;
            border-left: 4px solid #BEB071;
        }
        
        .enquiry-details h3 {
            color: #06203D;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .detail-item {
            display: flex;
            margin-bottom: 10px;
            align-items: center;
        }
        
        .detail-label {
            font-weight: 500;
            color: #06203D;
            min-width: 120px;
            font-size: 14px;
        }
        
        .detail-value {
            color: #4a5568;
            font-size: 14px;
            flex: 1;
        }
        
        .next-steps {
            background: linear-gradient(135deg, #BEB071 0%, #d4c579 100%);
            border-radius: 10px;
            padding: 25px;
            margin: 30px 0;
            color: white;
        }
        
        .next-steps h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .next-steps ul {
            list-style: none;
            padding-left: 0;
        }
        
        .next-steps li {
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }
        
        .next-steps li:before {
            content: "✓";
            position: absolute;
            left: 0;
            font-weight: bold;
        }
        
        .footer {
            background: #06203D;
            padding: 30px;
            text-align: center;
            color: white;
        }
        
        .footer p {
            margin-bottom: 10px;
            font-size: 14px;
            opacity: 0.8;
        }
        
        .contact-info {
            font-size: 14px;
            opacity: 0.9;
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header, .content, .footer {
                padding: 25px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .enquiry-details, .next-steps {
                padding: 20px;
            }
            
            .detail-item {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .detail-label {
                min-width: auto;
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Thank You!</h1>
            <p>Your enquiry has been received successfully</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hello ${data.firstName} ${data.lastName},
            </div>
            
            <div class="message">
                Thank you for reaching out to Touchline Sports Academy! We've received your ${data.enquiryType.toLowerCase()} enquiry submitted on ${enquiryDate}. Whether it’s for training, admission, or a football program, our team will review your details and contact you soon with the next steps.

            </div>
            
            <div class="enquiry-details">
                <h3>Your Enquiry Details</h3>
                <div class="detail-item">
                    <span class="detail-label">Enquiry Type:</span>
                    <span class="detail-value">${data.enquiryType}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${data.email}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${data.phone}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Date of Birth:</span>
                    <span class="detail-value">${data.dob}</span>
                </div>
                ${data.guardianName ? `
                <div class="detail-item">
                    <span class="detail-label">Guardian:</span>
                    <span class="detail-value">${data.guardianName}</span>
                </div>
                ` : ''}
                ${data.message ? `
                <div class="detail-item">
                    <span class="detail-label">Message:</span>
                    <span class="detail-value">${data.message}</span>
                </div>
                ` : ''}
            </div>
            
          <div class="next-steps">
    <h3>What Happens Next?</h3>
    <ul>
        <li>Our team will review your enquiry within 24–48 hours.</li>
        <li>Based on your interest — whether it’s for a child, adult training, or corporate sessions — we’ll reach out via WhatsApp or phone.</li>
        <li>We’ll share full details about training schedules, fees, and available batches.</li>
        <li>If needed, we’ll invite you to visit our academy or try out a session before registering.</li>
    </ul>
</div>

<div class="message">
    If your enquiry is urgent or you need quick information, feel free to contact us directly via WhatsApp or call.  
    <br><br>Thank you for reaching out to Touchline Sports Academy — we’re excited to help you or your child get started with football training!
</div>

        </div>
        
        <div class="footer">
            <p><strong>Best regards,</strong></p>
            <p><strong>Your Company Team</strong></p>
            <div class="contact-info">
                <p>📧 touchlinedxb@gmail.com | 📞 +971 58 569 8277</p>
                <p>🌐 www.touchliensport.ae</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

function createNotificationEmailTemplate(data) {
  const enquiryDate = new Date(data.timestamp).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Enquiry Notification</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #06203D;
            background-color: #f8f9fa;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 10px 30px rgba(6, 32, 61, 0.1);
            border-radius: 12px;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #06203D 0%, #BEB071 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .header .alert-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: inline-block;
            margin-top: 10px;
        }
        
        .content {
            padding: 30px;
        }
        
        .enquiry-summary {
            background: linear-gradient(135deg, #BEB071 0%, #d4c579 100%);
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 30px;
            color: white;
            text-align: center;
        }
        
        .enquiry-summary h2 {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .enquiry-summary .type {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .detail-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            border-left: 4px solid #BEB071;
        }
        
        .detail-card h4 {
            color: #06203D;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        
        .detail-card p {
            color: #4a5568;
            font-size: 16px;
            font-weight: 500;
        }
        
        .full-width {
            grid-column: 1 / -1;
        }
        
        .message-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 10px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #dee2e6;
        }
        
        .message-card h4 {
            color: #06203D;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .message-card p {
            color: #4a5568;
            font-size: 15px;
            line-height: 1.6;
            font-style: italic;
        }
        
        .action-buttons {
            text-align: center;
            margin: 30px 0;
        }
        .action-buttons a{
            text-decoration:none;
            color:white;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #06203D 0%, #BEB071 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            font-size: 14px;
            margin: 0 10px;
            transition: all 0.3s ease;
        }
        
        .footer {
            background: #06203D;
            padding: 25px;
            text-align: center;
            color: white;
        }
        
        .timestamp {
            font-size: 12px;
            color: #BEB071;
            opacity: 0.8;
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .details-grid {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            
            .detail-card, .enquiry-summary, .message-card {
                padding: 20px;
            }
            
            .btn {
                display: block;
                margin: 5px 0;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🔔 New Enquiry Alert</h1>
            <div class="alert-badge">Immediate Attention Required</div>
        </div>
        
        <div class="content">
            <div class="enquiry-summary">
                <h2>${data.firstName} ${data.lastName}</h2>
                <div class="type">${data.enquiryType} Enquiry</div>
            </div>
            
            <div class="details-grid">
                <div class="detail-card">
                    <h4>Contact Email</h4>
                    <p>${data.email}</p>
                </div>
                
                <div class="detail-card">
                    <h4>Phone Number</h4>
                    <p>${data.phone}</p>
                </div>
                
                <div class="detail-card">
                    <h4>Date of Birth</h4>
                    <p>${data.dob}</p>
                </div>
                
                <div class="detail-card">
                    <h4>Enquiry Date</h4>
                    <p>${enquiryDate}</p>
                </div>
                
                ${data.guardianName ? `
                <div class="detail-card">
                    <h4>Guardian Name</h4>
                    <p>${data.guardianName}</p>
                </div>
                
                <div class="detail-card">
                    <h4>Guardian Phone</h4>
                    <p>${data.guardianPhone}</p>
                </div>
                ` : ''}
            </div>
            
            ${data.message ? `
            <div class="message-card">
                <h4>💬 Customer Message</h4>
                <p>"${data.message}"</p>
            </div>
            ` : ''}
            
            <div class="action-buttons">
                <a href="mailto:${data.email}" class="btn">📧 Reply to Customer</a>
                <a href="tel:${data.phone}" class="btn">📞 Call Customer</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Admin Notification System</strong></p>
            <div class="timestamp">
                Received: ${enquiryDate}
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

