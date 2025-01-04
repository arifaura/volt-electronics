import { expect } from '@jest/globals';
import { fetchUserData, login, register } from '../src/services/api';

describe('API Functions', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('login API call', async () => {
    const mockResponse = { token: 'fake-token', user: { id: 1, name: 'Test User' } };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await login('test@example.com', 'password123');
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/login'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object),
        body: expect.any(String),
      })
    );
  });

  test('register API call', async () => {
    const mockResponse = { success: true, user: { id: 1, name: 'Test User' } };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await register({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
    
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/register'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object),
        body: expect.any(String),
      })
    );
  });
}); 