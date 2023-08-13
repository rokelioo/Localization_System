
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtected = ({WrappedComponent}) => {
    const userSession = sessionStorage.getItem("UserSession");
    const userData = userSession && JSON.parse(userSession);
    const admin = userData && userData.admin;

    if (admin) {
        console.log("fire");
      return <WrappedComponent />;
    } else {

      return <Navigate to="/main" />;
    }

};

export default AdminProtected;