import { LoginPage } from './components/LoginPage';

export function App() {
  const handleLogin = async (creds: { email: string; password: string; remember: boolean }) => {
    // Simulated authentication API call
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Simple demo validation logic
    if (creds.password === 'wrongpassword') {
      throw new Error('Invalid email or password. Please try again.');
    }
  };

  return <LoginPage onSubmit={handleLogin} />;
}

export default App;
