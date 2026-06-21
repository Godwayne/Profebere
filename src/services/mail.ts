/**
 * Mail Service
 * Client helper to securely trigger server-side automated user and admin correspondences.
 */

export interface MailRequestPayload {
  to?: string;
  type: 'welcome' | 'purchase' | 'donation' | 'admin_alert';
  metadata?: {
    name?: string;
    amount?: number;
    itemName?: string;
    reference?: string;
    alertTitle?: string;
    alertBody?: string;
    [key: string]: any;
  };
}

export const sendEmailNotification = async (payload: MailRequestPayload): Promise<{ success: boolean; simulated: boolean }> => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Server responded with status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('sendEmailNotification client-side trigger failed:', err);
    return { success: false, simulated: true };
  }
};
