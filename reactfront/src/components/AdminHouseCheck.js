import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import "../CSS/planhouse.css";

const numRows = 30;
const numCols = 30;

export default function AdminHouseCheck() {
  const { id: userId, name: initialName, surname: initialSurname} = useParams();
  const [location, setLocation] = useState([{}]);
  const [s_location, setInitLocation] = useState(null);
  const [houseId, setHouseId] = useState('');
  const [gridData, setGridData] = useState({})
  const [roomData, setRoomData] = useState({})
  const [noPlanMessage, setNoPlanMessage] = useState('');
  const [paintMode, setPaintMode] = useState(false);
  const [grid, setGrid] = useState(() => {
    return Array.from({ length: numRows }, () => Array.from({ length: numCols }, () => 0));
  });
  useEffect(()=>{
    async function fetchHouseList() {
        try {
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

  const PrintPlan = (address) => {
    fetch(`/api/house/show?name=${encodeURIComponent(initialName)}&sirname=${encodeURIComponent(initialSurname)}&address=${encodeURIComponent(address)}&userId=${encodeURIComponent(userId)}`)
      .then(response => response.json())
      .then(sentGrid => {
        setGridData(sentGrid.housePlan);
        setRoomData(sentGrid.rooms);
      })
      .catch(error => console.error(error));
}

  const handleLocationChange = (event) => {
    let text = event.target.value;
    const myArray = text.split("+");
    setInitLocation(myArray[1]);
    setHouseId(myArray[0]);

};
useEffect(() => {
  if (s_location) {
    PrintPlan(s_location);
  }
}, [s_location]);
useEffect(() => {
    if (gridData && gridData['grid'] !== undefined) {
    setGrid( gridData['grid']);
    setNoPlanMessage('');
  } else {
    setNoPlanMessage('The selected address does not contain a house plan.');
  }

}, [gridData]);

useEffect(() => {
  if (noPlanMessage) {
    setGrid(() => Array.from({ length: numRows }, () => Array.from({ length: numCols }, () => 0)));
  }
}, [noPlanMessage]);

const handleCellClick = (rowIndex, cellIndex) => {
  if (paintMode) {
    setGrid((prevGrid) => {
      return prevGrid.map((row, r) =>
        row.map((cell, c) => (r === rowIndex && c === cellIndex ? 'red' : cell))
      );
    });
  }
};
const handleSubmit = async (event) => {
  event.preventDefault();

  const dataToSend = [...roomData];
  
  dataToSend.push({
    grid: grid, 
  });

  try {
    fetch(`/api/admin/planConfig/${userId}/${houseId}/`,{
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend)
  })
  } catch (error) {
    console.error('Error:', error);
  }
};

  return (
    <div className="background-planner">
      <Header />
       <div className='house-location-container'>
          <div className='address-rooms'>
              <div className="admin-address-select">
                {location.map((house, index) => (
                  <div key={index}>
                    <input
                      type="radio"
                      name="houseLocation"
                      value={`${house.id}+${house.address}`}
                      onChange={handleLocationChange}
                    />
                    <label>{house.address}</label>
                  </div>
                ))}
              </div>
              <div className='admin-housecheck-rooms'>
              {Array.isArray(roomData) && roomData.map((room, index) => (
                <div key={index} style={{backgroundColor: room.roomColor}}>
                  <h3>{room.roomId+1} {room.roomName}</h3>
                </div>
              ))}
            </div>
          </div>
      {noPlanMessage && <p className="no-plan-message">{noPlanMessage}</p>}
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className={`grid-cell${cell ? ' cell-filled' : ''}`}
                style={cell ? { backgroundColor: cell } : {}} 
                onClick={() => handleCellClick(rowIndex, cellIndex)}
              ></div>
            ))}
          </div>
        ))}
      </div>
      <div>
    </div>
    <div>
  <button className='AddHouseAddressButton' onClick={() => setPaintMode(!paintMode)}>
    {paintMode ? 'Disable Paint Mode' : 'Enable Paint Mode'}
  </button>
  <button className='AddHouseAddressButton' onClick={handleSubmit}>Submit</button>
</div>
        
</div>



    </div>
    
  )
}
