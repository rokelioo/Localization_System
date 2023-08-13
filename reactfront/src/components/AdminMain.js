import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import "../CSS/main.css";
import "../CSS/dialog.css";
import Header from './Header';
function AdminMain() {
    const [userData, setUserData] = useState([])
    const [showDialog, setShowDialog] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)


    useEffect(()=>{
          fetch(`/api/admin/userlist`)
          .then(response => response.json())
          .then(users => {
            setUserData(users);
            console.log(userData);
          })
          .catch(error => console.error(error));
        
        
      }, [])

      const handleBlockButtonClick = (user) => {
        setShowDialog(true);
        setSelectedUser(user);
    }
    const handleOnClickHousePlan = (pk_id, name, surname) => {
      return `/house-plans/${pk_id}/${name}/${surname}`;
    };
    const handleOnClickPersonConfig = (pk_id) => {
      return `/admin-person-config/${pk_id}`;
    };

      const UserDetails = ({pk_id, name, surname, login, block, onClickHousePlan, onClickPersonConfig}) => {
        return (
          <div className="elder-details">
            <h2>{name} {surname}</h2>
            <Link className='monitor-button' to={onClickHousePlan(pk_id, name, surname)}>Home Plans</Link>
            <h3>{login}</h3>
            <h3>{block ? 'Access Denied' : 'Access Granded'}</h3>
            <div className="configuration-body">
                  <Link className='Button-configure' to={onClickPersonConfig(pk_id)}>
                      <img src="/images/configure.jpg" alt="configure" />
                  </Link>
                <button className='Button-configure' onClick={() => handleBlockButtonClick({pk_id, name, surname, login, block})}>
                    <img src="/images/block.jpg" alt="block"></img>
                </button>
            </div>
          </div>
        );
      };

      const closeDialog = () => {
        setShowDialog(false);
        setSelectedUser(null);
    }

    const confirmBlock = () => {
        blockUser(selectedUser);
        closeDialog();
    }

    const blockUser = async (user) => {
        try {
            const response = await fetch('/api/admin/blockuser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });

            if (!response.ok) {
                throw new Error('Error blocking user');
            }

            const result = await response.json();
            console.log('User blocked:', result);

            setUserData((prevState) =>
             prevState.map((item) =>
             item.pk_id === user.pk_id ? { ...item, block: !item.block } : item
             )
            );
        } catch (error) {
            console.error('Error blocking user:', error);
        }
    }

    useEffect(() => {
        console.log(userData);
    }, [userData]);

  return (
    
    <div className="main-background">
            <Header />
      <div className="main-component">
        {userData && userData.length > 0 ? (
          userData.map((person, index) => (
            <UserDetails
              key={index}
              pk_id={person.pk_id}
              name={person.name}
              surname={person.surname}
              login={person.login.slice(0, 10)}
              block={person.block}
              onClickHousePlan={handleOnClickHousePlan}
              onClickPersonConfig={handleOnClickPersonConfig}
            />
          ))
        ) : (
          <p>No elder data available.</p>
        )}
        {showDialog && (
          <div className="dialog">
            <div className="dialog-content">
            <h3>
                Are you sure you want to {selectedUser && (selectedUser.block ? 'unblock' : 'block')}{' '}
                {selectedUser && `${selectedUser.name} ${selectedUser.surname}`}?
            </h3>
              <button className="confirm" onClick={confirmBlock}>Confirm</button>
              <button className="decline" onClick={closeDialog}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminMain