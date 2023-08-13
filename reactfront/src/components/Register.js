import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/login.css';

function Register() {
  const errors = {
    name: 'Invalid name',
    surname: 'Invalid surname',
    email: 'Invalid email',
    password: 'Invalid password',
    confirmPassword: "Passwords don't match",
    phoneNumber: "Invalid phone number"
  };
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const registerData = document.forms[0];
    var registerSend = Object.create(null);
    registerSend.name = registerData.name.value;
    registerSend.surname = registerData.surname.value;
    registerSend.email = registerData.email.value;
    registerSend.password = registerData.password.value;
    registerSend.confirmPassword = registerData.confirmPassword.value;
    registerSend.phoneNumber = registerData.number.value;
    

    if (registerSend.password !== registerSend.confirmPassword) {
      setErrorMessages({ name: 'confirmPassword', message: errors.confirmPassword });
      return;
    }
    if (!/^[\w.-]+@gmail\.com$/.test(registerSend.email)) {
      setErrorMessages({ name: 'email', message: errors.email });
      return;
    }

    console.log(registerSend);

    fetch('/api/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerSend),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data['success'] === 'OK') {
          console.log(data);
          let obj = {auth: true, user_id: data['id'], admin: 0}
          sessionStorage.setItem("UserSession", JSON.stringify(obj));
          setIsSubmitted(true);
          navigate('/main');
        } else if (data['success'] === 'BAD') {
          console.log('Registration failed');
          setErrorMessages({ name: 'email', message: "Email already exists" });
        }
      });
  };


  const renderErrorMessage = (name) =>
    name === errorMessages.name && <div className="error">{errorMessages.message}</div>;


  const renderForm = (
    <div className="form">
      <form onSubmit={handleSubmit}>
      <div className="input-container">
          {renderErrorMessage('name')}
          <label className="login-label">Name</label>
          <input type="text" name="name" required />
        </div>
        <div className="input-container">
          {renderErrorMessage('surname')}
          <label className="login-label">Surname</label>
          <input type="text" name="surname" required />
        </div>
        <div className="input-container">
          {renderErrorMessage('email')}
          <label className="login-label">Email</label>
          <input type="text" name="email" required />
        </div>
        <div className="input-container">
          {renderErrorMessage('phoneNumber')}
          <label className="login-label">Phone number</label>
          <input type="text" name="number" required />
        </div>
        <div className="input-container">
          {renderErrorMessage('password')}
          <label className="login-label">Password</label>
          <input type="password" name="password" required />
        </div>
        <div className="input-container">
          {renderErrorMessage('confirmPassword')}
          <label className="login-label">Confirm Password</label>
          <input type="password" name="confirmPassword" required />
        </div>
        <div className="button-container">
          <input type="submit" value="Register" />
        </div>
        <a href="/" className="button-to-main">Go to Main Page</a>
      </form>
    </div>
  );

  return (
    <div className="login-background">
      <div className="login-form">
        <div className="title">Sign Up</div>
        {isSubmitted ? <div>User successfully registered</div> : renderForm}
      </div>
    </div>
  );
}

export default Register;
