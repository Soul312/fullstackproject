import React, { Component } from 'react';
import { Card, Form, Col, Row, Button, Alert } from 'react-bootstrap';
import authService from './authService';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      error: ''
    };
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleLogin = (event) => {
    event.preventDefault();
    this.setState({ error: '' });
    authService.login(this.state.username, this.state.password)
      .then(() => {
        this.props.history.push('/voitures');
      })
      .catch(() => {
        this.setState({ error: 'Identifiants invalides. Veuillez reessayer.' });
      });
  };

  render() {
    return (
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <Card className={"border border-dark bg-dark text-white"}>
            <Card.Header>
              <h3>Login</h3>
            </Card.Header>
            <Card.Body>
              {this.state.error && (
                <Alert variant="danger">{this.state.error}</Alert>
              )}
              <Form onSubmit={this.handleLogin}>
                <Form.Group controlId="formUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={this.state.username}
                    onChange={this.handleChange}
                    className={"bg-dark text-white"}
                    placeholder="Enter username"
                  />
                </Form.Group>
                <Form.Group controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={this.state.password}
                    onChange={this.handleChange}
                    className={"bg-dark text-white"}
                    placeholder="Password"
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">
                  Login
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }
}