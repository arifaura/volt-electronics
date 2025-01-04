export default function Login() {
  return (
    <div>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" />
      <label htmlFor="password">Password</label>
      <input id="password" type="password" />
      <button>Login</button>
      <div>Logging in</div>
      <div>Invalid credentials</div>
    </div>
  );
} 