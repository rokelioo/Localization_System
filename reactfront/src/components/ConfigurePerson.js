import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';

function ConfigurePerson() {
  const { id: elderId, name: initialName, sirname: initialSurname, address: initialLocation, uuid: initialUuid } = useParams();
  const navigate  = useNavigate();
  const [name, setName] = useState(initialName);
  const [surname, setSurname] = useState(initialSurname);
  const [s_location, setInitLocation] = useState(initialLocation);
  const [uuid, setUUID] = useState(initialUuid);
  const sessionData = sessionStorage.getItem("UserSession");
  const [location, setLocation] = useState([{}]);
  const [houseId, setHouseId] = useState('');

  useEffect(()=>{
    console.log(initialUuid);
    async function fetchHouseList() {
        try {
          const userId = JSON.parse(sessionData).user_id;
          const response = await fetch(`/api/house/${userId}/list`);
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
  const handleLocationChange = (event) => {
        let text = event.target.value;
        const myArray = text.split("+");
        setInitLocation(myArray[1]);
        setHouseId(myArray[0]);
 
    };


  const handleSubmit = async  (event) => {
    event.preventDefault();
    const userId = JSON.parse(sessionData).user_id;
    const formData = {
      elderId: elderId,
      name: name,
      surname: surname,
      uuid: uuid,
      location: s_location,
      houseId: houseId,
    };
  console.log(formData);
    try {
      const response = await fetch(`/api/elder/${userId}/configure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        navigate('/main');
      } else {
        throw new Error(`Failed to submit form data: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error submitting form data: ${error.message}`);
    }
  };

  return (
    <div className="main-background">
       <Header />
      <div className="settings-container">
        <div className="settings-form">
          <h1>UserSettings</h1>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="column-group">
                <label>Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="column-group">
                <label>Surname:</label>
                <input type="text" value={surname} onChange={(e) => setSurname(e.target.value)} />
              </div>
            </div>
            <div className="input-group">
              <div className="column-group">
                <label>Pendant UUID:</label>
                <input type="text" value={uuid} onChange={(e) => setUUID(e.target.value)} />
              </div>
            </div>
            <div>
              {location.map((house, index) => (
                <div key={index}>
                  <input
                    type="radio"
                    name="houseLocation"
                    value={`${house.id}+${house.address}`}
                    checked={house.address === s_location}
                    onChange={handleLocationChange}
                  />
                  <label>{house.address}</label>
                </div>
              ))}
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ConfigurePerson;
