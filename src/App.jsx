import React, { useState } from 'react';
import Login from './components/Login.jsx';

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <main className="page">
      {user ? (
        <div className="welcome">
          <h1>Welcome back, {user.email}!</h1>
          <p>You are signed in.</p>
          <button onClick={() => setUser(null)}>Sign out</button>
        </div>
      ) : (
        <Login onSuccess={setUser} />
      )}
    </main>
  );
}
