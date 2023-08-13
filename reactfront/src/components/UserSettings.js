import React, { useState, useEffect } from 'react';
import { useNavigate  } from 'react-router-dom';
import "../CSS/settings.css";
import Header from './Header';

function UserSettings() {
  const navigate  = useNavigate();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const sessionData = sessionStorage.getItem("UserSession");

  useEffect(()=>{
    
    var userId = JSON.parse(sessionData)
   

      console.log(userId["user_id"]);
      fetch(`/api/caregiver/${userId["user_id"]}/settings`)
      .then(response => response.json())
      .then(settings => {
        setName(settings.name);
        setSurname(settings.sirname);
        setEmail(settings.email);
        setPhoneNumber(settings.phone);
        
      })
      .catch(error => console.error(error));
    
    
  }, [])



  useEffect(() => {
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match');
    } else {
      setErrorMessage('');
    }
  }, [newPassword, confirmNewPassword]);

  const handleSubmit =  (event) => {
    event.preventDefault();
    const userId = JSON.parse(sessionData).user_id;
    if (errorMessage) {
      alert('Please fix the errors before submitting');
    } else {
      var changeSettings = Object.create(null);
      changeSettings.name = name;
      changeSettings.surname = surname;
      changeSettings.phoneNumber = phoneNumber;
      changeSettings.email = email;
      changeSettings.oldPassword = oldPassword;
      changeSettings.newPassword = newPassword;

      fetch(`/api/caregiver/${userId}/settings-change`,{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changeSettings)
    }).then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log(data.message);
        console.log('New record:', data.record);
        navigate('/main');

      } else {
        console.log("Failed to add a person");

      }
    }).catch(error => {
      console.error('Error:', error);

    });
  };
 
  }

  return (
    <div className='main-background'>
       <Header />
        <div className='settings-container'>
            <div className='settings-form'>
                <h1>UserSettings</h1>
                <form onSubmit={handleSubmit}>
                    <div className='input-group'>
                        <div className='column-group'>
                            <label>Name:</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className='column-group'>
                            <label>Surname:</label>
                            <input type="text" value={surname} onChange={(e) => setSurname(e.target.value)} />
                        </div>
                    </div>
                    <div className='input-group'>
                         <div className='column-group'>
                            <label>Old password:</label>
                            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                         </div>
                         <div className='column-group'>
                            <label>New password:</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </div>
                    </div>
                    <div>
                    <div className='input-group'>
                        <div className='column-group'>
                            <label>Phone number:</label>
                            <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                        </div>
                        <div className='column-group'>
                            <label>Confirm password:</label>
                            <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                        </div>
                    </div>
                    </div>
                    <div className='input-group'>
                        <div className='column-group'>
                            <label>Email:</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className='column-group'>
                            {errorMessage && <p className="error-message">{errorMessage}</p>}
                            <button className='save-settings' type="submit">Save Changes</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
}

export default UserSettings;