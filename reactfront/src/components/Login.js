import React, { useState } from 'react'
import { useNavigate  } from 'react-router-dom';
import "../CSS/login.css";

function Login() {

    const errors = {
        uname: "invalid email or password",
        pass: "invalid password",
        block: "Your access is restricted"
      };
    const navigate  = useNavigate();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessages, setErrorMessages] = useState({});
    const handleSubmit = (event) => {

        event.preventDefault();
        const login_Data = document.forms[0];
        var login_Send = Object.create(null);
        login_Send.name = login_Data.uname.value;
        login_Send.pass = login_Data.pass.value;
        
        console.log(login_Send);
    
        fetch('/api/user/login',{
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(login_Send)
        }).then(response => response.json())
        .then(data => {
          if(data["success"] === "OK")
          {
            console.log(data);
            setIsSubmitted(true);
            let obj = {auth: true, user_id: data['id'], admin: data['admin']};
            sessionStorage.setItem("UserSession", JSON.stringify(obj));
            if (data['admin']) {
              navigate('/adminmain'); 
            } else {
              navigate('/main'); 
            }
          }
          else if(data["success"] === "BAD")
          {
            console.log("Neprisijungta");
            setErrorMessages({ name: "uname", message: errors.uname });
          }
          else if(data["success"] === "BLOCK")
          {
            setErrorMessages({ name: "uname", message: errors.block });
          }
        })
        
      };
    
  const renderErrorMessage = (name) =>
  name === errorMessages.name && (
    <div className="error">{errorMessages.message}</div>
  );
      const renderForm = (
        <div className="form">
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              {renderErrorMessage("uname")}
              <label className='login-label'>Email </label>
              <input type="text" name="uname" required />
            </div>
            <div className="input-container">
              <label className='login-label'>Password </label>
              <input type="password" name="pass" required />
            </div>
            <div className="button-container">
              <input type="submit" value="Login"/>
            </div>
            <a href="/" className="button-to-main">Go to Main Page</a>
          </form>
        </div>
      );

  return (
    <div className="login-background">
      <div className="login-form">
        <div className="title">Sign In</div>
        {isSubmitted ? <div>User is successfully logged in</div> : renderForm}
      </div>
    </div>
  )
}

export default Login