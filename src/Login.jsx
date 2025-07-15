import {Form, FormLayout, TextField, Button, Page, Card, Banner, Icon } from "@shopify/polaris";
import { useState } from "react";
import { ViewIcon, HideIcon } from '@shopify/polaris-icons';
import { useNavigate } from "react-router-dom";

export default function Login() {
   const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

    // Email validation regex (checks for @ and .)
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Password validation (at least 8 characters)
  const isValidPassword = (password) => password.length >= 8;

    const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  
  const handleSubmit = async () => {
    try {
      setError(null);
      const response = await fetch('https://inventory-management-mauve-seven.vercel.app/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
       
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const data = await response.json();
      console.log('API Response:', data);
      setSuccess(data.message);
       // Extract and store the token
      const token = data.token;
      const role = data.role;
      if (token && role) {
        console.log(role)
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', role);
        setTimeout(() =>{
        navigate('/dashboard');
        }, 800);
      } else {
        throw new Error('No token received from server.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      console.error('Error:', err);
    }
  };

  return (
    <>
    <div className="login-page">
    <div>
    <Page title="Login" narrowWidth >
      <Card sectioned background="bg-surface-transparent">
        {error && (
            <Banner status="critical" title="Error">
              {error}
            </Banner>
          )}
          {success && (
            <Banner status="success" title="Success">
              {success}
            </Banner>
          )}
        <Form onSubmit={handleSubmit}>
          <FormLayout>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(value) => setEmail(value)}
              autoComplete="email"
              placeholder="lapresse@jadedpixel.com"
              error={email && !isValidEmail(email) ? 'Email must include @ and .' : null}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(value) => setPassword(value)}
              autoComplete="current-password"
              error={password && !isValidPassword(password) ? 'Password must be at least 8 characters long.' : null}
                    suffix={
                      <span
                        onClick={togglePasswordVisibility}
                        style={{ cursor: 'pointer', backgroundColor:"red" }}
                        role="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <Icon source={showPassword ? HideIcon : ViewIcon} />
                      </span>
                    }
            />
            <Button submit variant="primary" onClick={() => console.log(`Email: ${email}\nPassword: ${password}`)}>
              Log In
            </Button>
          </FormLayout>
        </Form>
      </Card>
    </Page>
    </div>
    </div>
    </>
  );
}
