import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import '../CSS/planhouse.css';
import '../CSS/monitor.css';
import Header from './Header';

const numRows = 30;
const numCols = 30;


function Monitor() {
  const { id, name, sirname, address } = useParams();
  const sessionData = sessionStorage.getItem("UserSession");
  const [gridData, setGridData] = useState({})
  const [location, setLocation] = useState(null);
  const [roomList, setRoomList] = useState(null);
  const [currentLocationColor, setCurrentLocationColor] = useState(null);
  const [grid, setGrid] = useState(() => {
    return Array.from({ length: numRows }, () => Array.from({ length: numCols }, () => 0));
  });

useEffect(() => {
    var userId = JSON.parse(sessionData)

    const fetchHousePlan = async () => {
      try{
        const response = await fetch(`/api/house/show?name=${encodeURIComponent(name)}&sirname=${encodeURIComponent(sirname)}&address=${encodeURIComponent(address)}&userId=${encodeURIComponent(userId['user_id'])}`);
        const data = await response.json();
    
        if (data.rooms) {
          const roomObjects = data.rooms.filter(obj => obj.hasOwnProperty('roomId') && obj.hasOwnProperty('roomColor')&& obj.hasOwnProperty('roomName')).map(obj => ({ roomId: obj.roomId, roomColor: obj.roomColor, roomName: obj.roomName }));
          setRoomList(roomObjects);
        }
    
        if (data.housePlan) {
          setGridData(data.housePlan);
        }
      }
      catch (error){
        console.error(error);
      }
    };

    const fetchLocation = async () => {
        try{
          const response = await fetch(`/api/monitor/elder/${id}/location`);
          const locationData = await response.json();
          setLocation(locationData);
        }
        catch(error){
          console.error(error);
        }
    };

    fetchHousePlan().then(() => {
      const interval = setInterval(() => {
        fetchLocation();
      }, 1000);

      return () => clearInterval(interval);
    })
    .catch((error) => console.error(error));


}, []);
useEffect(() => {
    if(gridData.grid != undefined)
    {
        setGrid(gridData.grid);
    }

}, [gridData]);

useEffect(() => {
  console.log(gridData.grid);

}, [gridData]);
useEffect(() => {
  if(roomList !== null){
    roomList.forEach(element => {
      if(element.roomName === location.location)
      {
        setCurrentLocationColor(element.roomColor);
      }
    });
  }
}, [location]);

  return (
    <div className='background-planner'>
      <Header />
      <div className='house-location-container'>
        <div className='address-rooms'>

        <div className='monitor-address'>
        <h1>Monitoring {name} {sirname}</h1>
        <h2>Address: {address}</h2>
        {location && <h3>Current Location: {location.location}</h3>}
        </div>
        <div className='monitor-rooms'>
          <div className='user-housecheck-rooms'>
                {Array.isArray(roomList) && roomList.map((room, index) => (
                  <div key={index} style={{backgroundColor: room.roomColor}}>
                    <h3>{room.roomId+1} {room.roomName}</h3>
                  </div>
                ))}
              </div>
        </div>
        </div>
            <div className="grid">
              {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="grid-row">
                  {row.map((cell, cellIndex) => (
                    <div
                      key={cellIndex}
                      className={`grid-cell${cell ? ' cell-filled' : ''}${cell === currentLocationColor ? ' grid-cell-glow' : ''}`}
                      style={cell && cell !== currentLocationColor ? { backgroundColor: cell } : {}}
                    ></div>
                  ))}
                </div>
              ))}
            </div>
      </div>
    </div>
  );
}

export default Monitor;