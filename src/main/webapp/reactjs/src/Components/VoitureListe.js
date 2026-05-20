import React, { Component } from 'react';
import { Card, Table, Button, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import MyToast from './myToast';
import authService from './authService';

export default class VoitureListe extends Component {

  constructor(props) {
    super(props);
    this.state = {
      voitures: [],
      show: false
    };
  }

  // Called after component mounts — fetch cars from API
  componentDidMount() {
    authService.getVoitures()
      .then(response => response.data)
      .then(data => {
        this.setState({ voitures: data });
      });
  }

  // Delete a car by ID
  deleteVoiture = (voitureId) => {
    authService.deleteVoiture(voitureId)
      .then(response => {
        if (response.data != null) {
          this.setState({ show: true });
          setTimeout(() => this.setState({ show: false }), 3000);
          // Remove deleted car from local state (no extra API call needed)
          this.setState({
            voitures: this.state.voitures.filter(v => v.id !== voitureId)
          });
        } else {
          this.setState({ show: false });
        }
      });
  };

  render() {
    return (
      <div>
        {/* Toast notification */}
        <div style={{ display: this.state.show ? "block" : "none" }}>
          <MyToast children={{ show: this.state.show, message: "Voiture supprimée avec succès.", type: "danger" }} />
        </div>

        <Card className={"border border-dark bg-dark text-white"}>
          <Card.Header>
            <FontAwesomeIcon icon={faList} /> Liste des Voitures
          </Card.Header>
          <Card.Body>
            <Table bordered hover striped variant="dark">
              <thead>
                <tr>
                  <th>Marque</th>
                  <th>Modele</th>
                  <th>Couleur</th>
                  <th>Immatricule</th>
                  <th>Annee</th>
                  <th>Prix</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {this.state.voitures.length === 0 ? (
                  <tr align="center">
                    <td colSpan="7">Aucune Voiture n'est disponible</td>
                  </tr>
                ) : (
                  this.state.voitures.map(voiture => (
                    <tr key={voiture.id}>
                      <td>{voiture.marque}</td>
                      <td>{voiture.modele}</td>
                      <td>{voiture.couleur}</td>
                      <td>{voiture.immatricule}</td>
                      <td>{voiture.annee}</td>
                      <td>{voiture.prix}</td>
                      <td>
                        <ButtonGroup>
                          {/* Edit button — navigates to /edit/:id */}
                          <Link to={`/edit/${voiture.id}`} className="btn btn-sm btn-outline-primary">
                            <FontAwesomeIcon icon={faEdit} />
                          </Link>{' '}
                          {/* Delete button */}
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={this.deleteVoiture.bind(this, voiture.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    );
  }
}
