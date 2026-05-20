import React from 'react';
import NavigationBar from './Components/NavigationBar';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import './App.css';
import Bienvenue from './Components/Bienvenue';
import Footer from './Components/Footer';
import Voiture from './Components/Voiture';
import VoitureListe from './Components/VoitureListe';
import Login from './Components/Login';
import PrivateRoute from './Components/PrivateRoute';

function App() {
  const marginTop = { marginTop: "20px" };

  return (
    <Router>
      <NavigationBar />
      <Container>
        <Row>
          <Col lg={12} style={marginTop}>
            <Switch>
              <Route path="/login" exact component={Login} />
              <PrivateRoute path="/voitures" exact component={VoitureListe} />
              <PrivateRoute path="/add" exact component={Voiture} />
              <PrivateRoute path="/edit/:id" exact component={Voiture} />
              <Route path="/" exact component={Bienvenue} />
              <Redirect to="/login" />
            </Switch>
          </Col>
        </Row>
      </Container>
      <Footer />
    </Router>
  );
}

export default App;
