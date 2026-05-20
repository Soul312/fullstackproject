import React, { Component } from 'react';
import { Card, Form, Col, Row, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare, faSave, faUndo } from '@fortawesome/free-solid-svg-icons';
import MyToast from './myToast';
import authService from './authService';

export default class Voiture extends Component {

  constructor(props) {
    super(props);
    this.state = this.initialState;
    this.voitureChange  = this.voitureChange.bind(this);
    this.submitVoiture  = this.submitVoiture.bind(this);
  }

  // Default (empty) form state
  initialState = {
    id: '',
    marque: '',
    modele: '',
    couleur: '',
    immatricule: '',
    prix: '',
    annee: '',
    show: false
  };

  // If editing, load existing car data on mount
  componentDidMount() {
    const voitureId = this.props.match.params.id;
    if (voitureId) {
      authService.getVoiture(voitureId)
        .then(response => {
          this.setState({
            id:          response.data.id,
            marque:      response.data.marque,
            modele:      response.data.modele,
            couleur:     response.data.couleur,
            immatricule: response.data.immatricule,
            prix:        response.data.prix,
            annee:       response.data.annee
          });
        });
    }
  }

  // Reset form to initial empty state
  resetVoiture = () => {
    this.setState(() => this.initialState);
  };

  // Controlled input handler — updates the field named by event.target.name
  voitureChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  // Form submit — POST (create) or PUT (update)
  submitVoiture = event => {
    event.preventDefault();

    const voiture = {
      marque:      this.state.marque,
      modele:      this.state.modele,
      couleur:     this.state.couleur,
      immatricule: this.state.immatricule,
      annee:       this.state.annee,
      prix:        this.state.prix
    };

    const voitureId = this.state.id;

    if (voitureId) {
      // Update existing car (PUT)
      authService.updateVoiture(voitureId, voiture)
        .then(response => {
          if (response.data != null) {
            this.setState({ show: true });
            setTimeout(() => this.setState({ show: false }), 3000);
          }
        });
    } else {
      // Create new car (POST)
      authService.addVoiture(voiture)
        .then(response => {
          if (response.data != null) {
            this.setState(this.initialState);
            this.setState({ show: true });
            setTimeout(() => this.setState({ show: false }), 3000);
          }
        });
    }
  };

  render() {
    const { marque, modele, couleur, immatricule, prix, annee } = this.state;
    const title = this.state.id ? "Modifier Voiture" : "Ajouter une Voiture";

    return (
      <div>
        {/* Toast notification */}
        <div style={{ display: this.state.show ? "block" : "none" }}>
          <MyToast children={{ show: this.state.show, message: "Voiture enregistrée avec succès.", type: "success" }} />
        </div>

        <Card className={"border border-dark bg-dark text-white"}>
          <Card.Header>
            <FontAwesomeIcon icon={faPlusSquare} /> {title}
          </Card.Header>

          <Form onReset={this.resetVoiture} onSubmit={this.submitVoiture} id="VoitureFormId">
            <Card.Body>
              <Row>
                <Form.Group as={Col} controlId="formGridMarque">
                  <Form.Label>Marque</Form.Label>
                  <Form.Control required name="marque" type="text"
                    value={marque} autoComplete="off"
                    onChange={this.voitureChange}
                    className={"bg-dark text-white"}
                    placeholder="Entrez Marque Voiture" />
                </Form.Group>

                <Form.Group as={Col} controlId="formGridModele">
                  <Form.Label>Modele</Form.Label>
                  <Form.Control required name="modele" type="text"
                    value={modele} autoComplete="off"
                    onChange={this.voitureChange}
                    className={"bg-dark text-white"}
                    placeholder="Entrez Modele Voiture" />
                </Form.Group>

                <Form.Group as={Col} controlId="formGridCouleur">
                  <Form.Label>Couleur</Form.Label>
                  <Form.Control required name="couleur" type="text"
                    value={couleur} autoComplete="off"
                    onChange={this.voitureChange}
                    className={"bg-dark text-white"}
                    placeholder="Entrez Couleur Voiture" />
                </Form.Group>
              </Row>

              <Row>
                <Form.Group as={Col} controlId="formGridImmatricule">
                  <Form.Label>Immatricule</Form.Label>
                  <Form.Control required name="immatricule" type="text"
                    value={immatricule} autoComplete="off"
                    onChange={this.voitureChange}
                    className={"bg-dark text-white"}
                    placeholder="Entrez Immatricule" />
                </Form.Group>

                <Form.Group as={Col} controlId="formGridPrix">
                  <Form.Label>Prix</Form.Label>
                  <Form.Control required name="prix" type="number"
                    value={prix} autoComplete="off"
                    onChange={this.voitureChange}
                    className={"bg-dark text-white"}
                    placeholder="Entrez Prix Voiture" />
                </Form.Group>

                <Form.Group as={Col} controlId="formGridAnnee">
                  <Form.Label>Annee</Form.Label>
                  <Form.Control required name="annee" type="number"
                    value={annee} autoComplete="off"
                    onChange={this.voitureChange}
                    className={"bg-dark text-white"}
                    placeholder="Entrez Annee Voiture" />
                </Form.Group>
              </Row>
            </Card.Body>

            <Card.Footer style={{ textAlign: "right" }}>
              <Button size="sm" variant="success" type="submit">
                <FontAwesomeIcon icon={faSave} /> Submit
              </Button>{' '}
              <Button size="sm" variant="info" type="reset">
                <FontAwesomeIcon icon={faUndo} /> Reset
              </Button>
            </Card.Footer>
          </Form>
        </Card>
      </div>
    );
  }
}
