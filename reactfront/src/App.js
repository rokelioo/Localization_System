import React from 'react'
import Home from './components/Home';
import Login from './components/Login';
import Main from './components/Main';
import AddPerson from './components/AddPerson';
import PlanHouse from './components/PlanHouse';
import Monitor from './components/Monitor';
import Register from './components/Register';
import AdminMain from './components/AdminMain';
import AdminProtected from './components/AdminProtected';
import UserSettings from './components/UserSettings';
import ConfigurePerson from './components/ConfigurePerson';
import AdminHouseCheck from './components/AdminHouseCheck';
import Statistics from './components/Statistics';
import AddLocation from './components/AddLocation';
import AdminPersonConfig from './components/AdminPersonConfig';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'

function App() {

  return (
    <Router>
      <Routes>
        <Route exact path='/' element={<Home/>}>
        </Route>
        <Route exact path='/login' element={<Login/>}>
        </Route>
        <Route exact path='/register' element={<Register/>}>
        </Route>
        <Route exact path='/main' element={<Main/>}>
        </Route>
        <Route exact path='/adminmain' element={<AdminProtected WrappedComponent={AdminMain} />} >
        </Route>
        <Route exact path='/addperson' element={<AddPerson/>}>
        </Route>
        <Route exact path='/planner' element={<PlanHouse/>}>
        </Route>
        <Route exact path='/settings' element={<UserSettings/>}>
        </Route>
        <Route exact path='/statistics' element={<Statistics/>}>
        </Route>
        <Route exact path='/add-location' element={<AddLocation/>}>
        </Route>
        <Route exact path='/admin-person-config/:id/' element={<AdminPersonConfig/>}>
        </Route>
        <Route exact path='/house-plans/:id/:name/:surname' element={<AdminHouseCheck/>}>
        </Route>
        <Route path="/elder-config/:id/:name/:sirname/:address/:uuid" element={<ConfigurePerson />}> 
        </Route>
        <Route path="/monitor/:id/:name/:sirname/:address" element={<Monitor />}> 
        </Route>
      </Routes>
    </Router>
  )
}

export default App