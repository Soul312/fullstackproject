import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { Link, withRouter } from 'react-router-dom';

class NavigationBar extends React.Component {
  handleLogout = () => {
    localStorage.removeItem('jwtToken');
    this.props.history.push('/login');
  };

  render() {
    const isAuthenticated = !!localStorage.getItem('jwtToken');

    return (
      <Navbar bg="dark" variant="dark">
        <Link to={""} className="navbar-brand">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/1/17/Tata_Tamo_Racemo.jpg"
            width="25"
            height="25"
            alt="logo"
          />
        </Link>
        <Nav className="mr-auto">
          {isAuthenticated && (
            <>
              <Link to={"/add"} className="nav-link">Ajouter une Voiture</Link>
              <Link to={"/voitures"} className="nav-link">Liste des Voitures</Link>
            </>
          )}
        </Nav>
        <Nav>
          {isAuthenticated ? (
            <Button variant="outline-info" onClick={this.handleLogout}>Logout</Button>
          ) : (
            <Link to={"/login"} className="nav-link">Login</Link>
          )}
        </Nav>
      </Navbar>
    );
  }
}

export default withRouter(NavigationBar);
