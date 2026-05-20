import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import authService from './authService';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;
