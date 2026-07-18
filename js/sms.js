// Infobip SMS Service for LuxeBags Admin
const SMS_CONFIG_KEY = 'luxebags_sms_config';

const getSmsConfig = () => {
    try {
        const raw = localStorage.getItem(SMS_CONFIG_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

const saveSmsConfig = (config) => {
    localStorage.setItem(SMS_CONFIG_KEY, JSON.stringify(config));
};

export const sendSMS = async (to, message) => {
    const config = getSmsConfig();

    if (!config.provider) {
        return { success: false, error: 'SMS provider not configured. Please set up SMS settings first.' };
    }

    if (!to) {
        return { success: false, error: 'Recipient phone number is missing.' };
    }

    try {
        switch (config.provider) {
            case 'infobip':
                return await sendInfobipSMS(config, to, message);
            default:
                return { success: false, error: `Unknown SMS provider: ${config.provider}` };
        }
    } catch (error) {
        console.error('SMS send error:', error);
        return { success: false, error: error.message || 'Failed to send SMS' };
    }
};

const sendInfobipSMS = async (config, to, message) => {
    const { apiKey, baseUrl = 'https://d829qr.api.infobip.com', sender } = config;

    if (!apiKey) {
        return { success: false, error: 'Infobip API key missing.' };
    }

    const formattedTo = to.startsWith('+') ? to.slice(1) : to;

    const response = await fetch(`${baseUrl}/sms/3/messages`, {
        method: 'POST',
        headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            messages: [
                {
                    destinations: [{ to: formattedTo }],
                    sender: sender || 'LUXEBAGS',
                    content: { text: message },
                },
            ],
        }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
        return { success: true, data };
    }

    return {
        success: false,
        error: data?.messages?.[0]?.status?.description || data?.error || 'Infobip send failed',
    };
};

export { getSmsConfig, saveSmsConfig };
