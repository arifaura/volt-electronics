export default function Register() {
  return (
    <div>
      <label htmlFor="username">Username</label>
      <input id="username" type="text" />
      <label htmlFor="email">Email</label>
      <input id="email" type="email" />
      <label htmlFor="password">Password</label>
      <input id="password" type="password" />
      <label htmlFor="confirmPassword">Confirm Password</label>
      <input id="confirmPassword" type="password" />
      <button>Register</button>
      <div>Passwords do not match</div>
    </div>
  );
} 