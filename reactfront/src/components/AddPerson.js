import React, { useEffect, useState } from 'react';
import "../CSS/addperson.css";
import { useNavigate  } from 'react-router-dom';
import Header from './Header';

function AddPerson() {
    const navigate  = useNavigate();
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [pendantUUID, setPendantUUID] = useState('');
    const [location, setLocation] = useState([{}]);
    const [s_location, setSLocation] = useState('');
    const sessionData = sessionStorage.getItem("UserSession");
    const [nameError, setNameError] = useState('');
    const [surnameError, setSurnameError] = useState('');
    const [pendantUUIDError, setPendantUUIDError] = useState('');
    const [locationError, setLocationError] = useState('');

    const validateForm = () => {
      let isValid = true;
  
      if (!name) {
        setNameError('Name is required');
        isValid = false;
      } else {
        setNameError('');
      }
  
      if (!surname) {
        setSurnameError('Surname is required');
        isValid = false;
      } else {
        setSurnameError('');
      }
  
      if (!pendantUUID) {
        setPendantUUIDError('Pendant UUID is required');
        isValid = false;
      } else {
        setPendantUUIDError('');
      }
  
      if (!s_location) {
        setLocationError('Address is required');
        isValid = false;
      } else {
        setLocationError('');
      }
  
      return isValid;
    };

    useEffect(()=>{
        async function fetchHouseList() {
            try {
              const userId = JSON.parse(sessionData);
              const response = await fetch(`/api/house/${userId['user_id']}/list`);
              if (response.ok) {
                const location = await response.json();
              
                setLocation(location);
                console.log(location);
              } else {
                throw new Error(`Failed to fetch house list: ${response.statusText}`);
              }
            } catch (error) {
              console.error(`Error fetching house list: ${error.message}`);
            }
          }
        
          fetchHouseList();
      }, [])

      useEffect(() => {
        console.log(s_location);
      }, [s_location]);

    const handleNameChange = (event) => {
      setName(event.target.value);
    };
  
    const handleSurnameChange = (event) => {
      setSurname(event.target.value);
    };
  
    const handlePendantUUIDChange = (event) => {
      setPendantUUID(event.target.value);
    };
  
    const handleLocationChange = (event) => {
        setSLocation(event.target.value);
     
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!validateForm()) {
          return;
        }

        const userId = JSON.parse(sessionData);
        var Add_Person_Send = Object.create(null);
        Add_Person_Send.name = name;
        Add_Person_Send.surname = surname;
        Add_Person_Send.pendantUUID = pendantUUID;
        let text = s_location;
        const myArray = text.split("+");
        Add_Person_Send.location = myArray[1];
        Add_Person_Send.locationId = myArray[0]
        fetch(`/api/elder/${userId['user_id']}/add`,{
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Add_Person_Send)
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
            <h1>Add Person</h1>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" value={name} onChange={handleNameChange} />
                {nameError && <div className="error">{nameError}</div>}
              </div>
              <div>
                <label htmlFor="surname">Surname:</label>
                <input type="text" id="surname" value={surname} onChange={handleSurnameChange} />
                {surnameError && <div className="error">{surnameError}</div>}
              </div>
              <div>
                <label htmlFor="pendant-uuid">Pendant UUID:</label>
                <input type="text" id="pendant-uuid" value={pendantUUID} onChange={handlePendantUUIDChange} />
                {pendantUUIDError && <div className="error">{pendantUUIDError}</div>}
              </div>
              <div>
                  <p>Address:</p>
                  <div>
                  {location.map((house, index) => (
                      <div key={index}>
                      <input type="radio" name="houseLocation" value={`${house.id}+${house.address}`} onChange={handleLocationChange} />
                      <label>{house.address}</label>
                      </div>
                  ))}
                  </div>
                  {locationError && <div className="error">{locationError}</div>}
              </div>
              <button className='AddHouseAddressButton' type="submit">Add Person</button>
            </form>
            </div>
       </div>
    </div>
  )
}

export default AddPerson