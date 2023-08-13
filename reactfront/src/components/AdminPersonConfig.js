import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';

function AdminPersonConfig() {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const navigate  = useNavigate();

  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/admin/person/config/${id}`);
        if (response.ok) {
          const data = await response.json();
          setName(data.name);
          setSurname(data.surname);
          setPassword(data.password);
          setEmail(data.email);
          setPhone(data.phone);
        } else {
          throw new Error('Failed to fetch person data');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();


    const formData = {
      name,
      surname,
      password,
      email,
      phone,
    };

    try {
      const response = await fetch(`/api/admin/person/config/submit/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Form data submitted successfully');
        navigate('/adminmain');
        
      } else {
        throw new Error('Failed to submit form data');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="main-background">
       <Header />
      <div className="settings-container">
        <div className="settings-form">
          <h1>AdminPersonConfig</h1>
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
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="column-group">
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="input-group">
              <div className="column-group">
                <label>Phone:</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminPersonConfig;