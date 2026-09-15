const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7020/api';

/**
 * Translates HTTP status codes and backend error objects into
 * clear, friendly, and understandable messages for the user.
 */
const getFriendlyErrorMessage = (status, customMessage) => {
  // If the server provided a real, meaningful sentence (not a generic technical status)
  if (
    customMessage &&
    typeof customMessage === 'string' &&
    customMessage.trim().length > 0 &&
    !customMessage.toLowerCase().includes('server error') &&
    !customMessage.toLowerCase().includes('internal server')
  ) {
    return customMessage;
  }

  switch (status) {
    case 400:
      return 'Your message could not be processed. Please enter a valid question or rephrase it.';
    case 401:
      return 'Your session has expired or you need to sign in to chat with the AI assistant. Please sign in to your Tazkarti account.';
    case 403:
      return 'You do not have permission to access the AI assistant. Please ensure your Tazkarti account is verified.';
    case 404:
      return 'The AI ChatBot service is currently unavailable. Please try again shortly.';
    case 429:
      return 'You have sent several messages quickly. Please wait a few seconds before trying again.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'The AI service is temporarily experiencing high demand or maintenance. Please try asking again in a moment.';
    default:
      return 'Unable to complete your request right now. Please try again.';
  }
};

/**
 * Service to communicate with the Tazkarti AI ChatBot endpoint.
 *
 * Endpoint: POST https://localhost:7020/api/ChatBot/Ask
 * Request Body: { "Message": string }
 * Response Body: { "isSuccess": boolean, "message": string, "data": string, "errors": any, "statusCode": number }
 */
export const askChatBot = async (message) => {
  const url = `${API_BASE_URL}/ChatBot/Ask`;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const token = localStorage.getItem('tazkarti_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ Message: message }),
    });

    if (!response.ok) {
      let extractedError = '';

      try {
        const errorJson = await response.json();

        if (errorJson?.message) {
          extractedError = errorJson.message;
        } else if (Array.isArray(errorJson?.errors) && errorJson.errors.length > 0) {
          extractedError = errorJson.errors[0];
        } else if (errorJson?.errors && typeof errorJson.errors === 'object') {
          // Flatten dictionary errors (e.g. ModelState: { "Message": ["The Message field is required."] })
          const allErrors = Object.values(errorJson.errors).flat();
          if (allErrors.length > 0) {
            extractedError = allErrors.join(' ');
          }
        } else if (errorJson?.title) {
          extractedError = errorJson.title;
        }
      } catch {
        // Body was not JSON
      }

      const friendlyMsg = getFriendlyErrorMessage(response.status, extractedError);

      return {
        isSuccess: false,
        message: friendlyMsg,
        data: null,
        statusCode: response.status,
      };
    }

    const data = await response.json();

    // Check if the backend responded with isSuccess: false inside the 200 payload
    if (data && data.isSuccess === false) {
      const friendlyMsg = getFriendlyErrorMessage(data.statusCode || 400, data.message || (Array.isArray(data.errors) ? data.errors[0] : null));
      return {
        isSuccess: false,
        message: friendlyMsg,
        data: null,
        statusCode: data.statusCode || 400,
      };
    }

    return data;
  } catch (err) {
    console.warn('[ChatBot Service] Network error:', err);
    return {
      isSuccess: false,
      message: 'Unable to connect to the AI assistant. Please ensure your backend server is running and check your network connection.',
      data: null,
      isNetworkError: true,
    };
  }
};
