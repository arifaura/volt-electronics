export const login = async (email, password) => {
  if (email === 'test@example.com' && password === 'password123') {
    await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return { token: 'fake-token', user: { id: 1, name: 'Test User' } };
  }
  throw new Error('Invalid credentials');
};

export const register = async (userData) => {
  await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return { success: true, user: { id: 1, name: 'Test User' } };
};

export const fetchUserData = async () => {
  return { id: 1, name: 'Test User' };
}; 