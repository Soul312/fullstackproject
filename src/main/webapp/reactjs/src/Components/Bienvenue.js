import React from 'react';

export default class Bienvenue extends React.Component {
  render() {
    return (
      <div className="bg-dark text-white p-5 rounded">
        <h1>Bienvenue au Magasin des Voitures</h1>
        <blockquote className="blockquote mb-0">
          <p>Le meilleur de nos voitures est exposé près de chez vous</p>
          <footer className="blockquote-footer text-muted">Master MIOLA</footer>
        </blockquote>
      </div>
    );
  }
}
