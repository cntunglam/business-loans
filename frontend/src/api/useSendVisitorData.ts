import axios from 'axios';
import { EmailDataType } from '../context/visitorContext';

function useSendVisitorData() {
  const api = axios.create({
    baseURL: '/api/email',
    timeout: 10000
  });

  const sendVisitorData = async (data: EmailDataType) => {
    try {
      const response = await api.post('/', data);
      return response.data;
    } catch (error) {
      console.error('Error sending visitor data:', error);
      throw error;
    }
  };

  return { sendVisitorData };
}

export default useSendVisitorData;
