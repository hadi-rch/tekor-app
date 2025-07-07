import api from '../api/axiosConfig';

export const startTestAttempt = async (packageId) => {
  try {
    const response = await api.post(`/api/v1/test-attempts/start/${packageId}`);
    return response.data;
  } catch (error) {
    console.error('Error starting test attempt:', error);
    throw error;
  }
};

export const getTestAttemptDetails = async (attemptId) => {
  try {
    const response = await api.get(`/api/v1/test-attempts/${attemptId}/details`);
    return response.data;
  } catch (error) {
    console.error('Error getting test attempt details:', error);
    throw error;
  }
};

export const submitAnswer = async (attemptId, questionId, optionId, remainingTimeInSeconds) => {
  try {
    const response = await api.post(`/api/v1/test-attempts/${attemptId}/answer`, {
      questionId,
      optionId,
      remainingTimeInSeconds,
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting answer:', error);
    throw error;
  }
};
