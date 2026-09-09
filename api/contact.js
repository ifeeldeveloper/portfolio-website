module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const scriptUrl = process.env.GMAIL_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzDpZVjC8ozIT1HyGAfhlBI-vhPdueGgX5q4bckZHejfLolUvQMS1fYaK2TxJObFKg4zg/exec';

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: payload.name || '',
        email: payload.email || '',
        enquiryType: payload.enquiryType || '',
        message: payload.message || '',
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(502).json({
        status: 'error',
        message: `Apps Script returned ${response.status}: ${responseText || 'Unknown error'}`,
      });
    }

    let result = null;
    try {
      result = JSON.parse(responseText);
    } catch (error) {
      result = { status: 'success' };
    }

    if (result && result.status === 'success') {
      return res.status(200).json({ status: 'success', message: 'Your message has been sent successfully.' });
    }

    return res.status(502).json({
      status: 'error',
      message: result?.message || 'The Apps Script did not confirm the email was sent.',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while sending your message. Please try again.',
    });
  }
};
