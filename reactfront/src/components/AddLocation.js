import React, { useEffect, useState } from 'react';
import "../CSS/addperson.css";
import { useNavigate  } from 'react-router-dom';
import Header from './Header';

function AddLocation() {
  const navigate  = useNavigate();
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const sessionData = sessionStorage.getItem("UserSession");

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const handleZipCodeChange = (event) => {
    setZipCode(event.target.value);
  };

  const handleSubmit = (event) => {
      event.preventDefault();
      const userId = JSON.parse(sessionData);
      var Add_Location_Send = Object.create(null);
      Add_Location_Send.address = address;
      Add_Location_Send.zipcode = zipCode;
      fetch(`/api/house/${userId['user_id']}/add`,{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Add_Location_Send)
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



  return (
    <div className='main-background'>
       <Header />
       <div className='settings-container'>
        <div className='login-form'>
          <h1>Add House Address</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="address">Address:</label>
              <input type="text" id="address" value={address} onChange={handleAddressChange} />
            </div>
            <div>
              <label htmlFor="zipcode">Zip Code:</label>
              <input type="text" id="zipcode" value={zipCode} onChange={handleZipCodeChange} />
            </div>
            <button className='AddHouseAddressButton' type="submit">Add House Address</button>
            </form>
          </div>
      </div>
      </div>
  )
}

export default AddLocation