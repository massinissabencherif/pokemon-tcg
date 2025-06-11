// modules/Card.js

export class Card {
  constructor({ id, name, image, types }) {
    this.id = id;
    this.name = name;
    this.image = image;
    this.types = types;
  }

  getPrimaryType() {
    if (!this.types || this.types.length === 0) return 'normal';
    return typeof this.types[0] === 'string'
      ? this.types[0]
      : this.types[0]?.type?.name || 'normal';
  }

  render() {
    const card = document.createElement('div');
    card.classList.add('card');
    card.setAttribute('draggable', 'true');
    card.dataset.id = this.id;

    const img = document.createElement('img');
    img.src = this.image;
    img.alt = this.name;

    const name = document.createElement('h2');
    name.textContent = this.name;

    const type = document.createElement('p');
    type.textContent = `Type: ${this.types.map(t =>
      typeof t === 'string' ? t : t?.type?.name
    ).join(', ')}`;

    card.classList.add(`type-${this.getPrimaryType()}`);
    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(type);

    // DRAG START : envoie les données de la carte au drop
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        id: this.id,
        name: this.name,
        image: this.image,
        types: this.types
      }));
    });

    return card;
  }
}
