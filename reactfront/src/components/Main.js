import React, {useEffect, useState} from 'react'
import "../CSS/main.css";
import Header from './Header';
import { Link } from 'react-router-dom';

function Main() {
  const [elderData, setElderData] = useState(null);
  const sessionData = sessionStorage.getItem("UserSession");
  const [locationList, setLocationList] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedElder, setSelectedElder] = useState(null);

  useEffect(()=>{
    
    const userId = JSON.parse(sessionData);

    const fetchElderList = async () => {
      try {
        const response = await fetch(`/api/elder/${userId['user_id']}/list`);
        const elders = await response.json();
        setElderData(elders);
        console.log(elders);
        return elders;
      } catch (error) {
        console.error(error);
      }
    };

      const fetchLocation = async (elders) => {
        let list =[];

        for (const [index, elder] of elders.entries()) {
          try {

            const response = await fetch(`/api/monitor/elder/${elder.id}/location`);
            const locationData = await response.json();
            list[index] = locationData.location;
          } catch (error) {
            console.error(error);
          }
        }
        setLocationList(list);
      };
    
      fetchElderList()
  .then((elders) => {
    if (Array.isArray(elders) && elders.length > 0) {
      const interval = setInterval(() => {
        fetchLocation(elders);
      }, 1000);

      return () => clearInterval(interval);
    }
  })
  .catch((error) => console.error(error));

  }, [])


  const  handleDeleteButtonClick = (elder) =>{
        setShowDialog(true);
        setSelectedElder(elder);
  }
  const handleMonitor = (id, name, sirname, address) => {
    return `/monitor/${id}/${name}/${sirname}/${address}`;
  };
  const handleConfigureClick = (id, name, sirname, address, uuid) => {
    return `/elder-config/${id}/${name}/${sirname}/${address}/${uuid}`;
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedElder(null);
}

const confirmDelete = () => {
    deleteElder(selectedElder);
    closeDialog();
}

const deleteElder = async (elder) => {
  try {
      const response = await fetch('/api/elder/delete', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(elder)
      });

      if (!response.ok) {
          throw new Error('Error deleting elder');
      }

      const result = await response.json();
      console.log('Elder deleted:', result);

      setElderData((prevState) =>
       prevState.map((item) =>
       item.id === elder.id ? { ...item, hidden: !item.hidden } : item
       )
      );
  } catch (error) {
      console.error('Error deleting elder:', error);
  }
}

  const ElderDetails = ({ id, name, sirname, address, uuid, location, onClickMonitor }) => {
    return (
      <div className="elder-details">
        <h2>{name} {sirname}</h2>
        <Link className='monitor-button' to={onClickMonitor(id, name, sirname, address)}> Monitor </Link>
        <h3>{address}</h3>
        <h3>{location}</h3>
        <div className="configuration-body">
            <Link className='Button-configure' to={handleConfigureClick(id, name, sirname, address, uuid)}>
              <img src="/images/configure.jpg" alt="configure" />
            </Link>
                <button className='Button-configure' onClick={() => handleDeleteButtonClick({id, name, sirname})}>
                    <img src="/images/del.jpg" alt="delete"></img>
                </button>
        </div>
      </div>
    );
  };

  return (
    <div className="main-background">
    <Header />
      <div className='main-component'>
      {elderData && elderData.length > 0 ? (
      elderData.map((person, index) => (
        !person.hidden && (
          <ElderDetails
            key={index}
            id={person.id}
            name={person.name}
            sirname={person.sirname}
            address={person.address}
            uuid={person.uuid}
            location={locationList[index]}
            onClickMonitor={handleMonitor}
            hidden={person.hidden}
          />
        )
      ))
    ) : (
      <h1>No elder data available.</h1>
    )}
        {showDialog && (
          <div className="dialog">
            <div className="dialog-content">
            <h3>
                Are you sure you want to delete {' '}
                {selectedElder && `${selectedElder.name} ${selectedElder.sirname}`}?
            </h3>
              <button className="confirm" onClick={confirmDelete}>Confirm</button>
              <button className="decline" onClick={closeDialog}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>

  )
}

export default Main
