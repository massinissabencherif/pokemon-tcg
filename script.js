// script.js

import { Card } from './modules/Card.js';

const deckZone = document.getElementById('deck-zone');
const handZone = document.getElementById('hand-zone');
const drawButton = document.getElementById('draw-button');
const COOLDOWN_TIME = 5 * 60 * 1000;
const LAST_DRAW_KEY = 'lastDrawTime';
const LAST_PACK_KEY = 'lastDrawPack';

function getRandomPokemonId() {
  return Math.floor(Math.random() * 151) + 1;
}

function displayPokemon(data) {
  const cardObj = new Card(data);
  const domElement = cardObj.render();
  deckZone.appendChild(domElement);
}

async function loadPokemon(id) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await response.json();

  displayPokemon(data);
  return {
    id: data.id,
    name: data.name,
    image: data.sprites.front_default,
    types: data.types.map(t => t.type.name),
  };
}

async function loadRandomPack(count = 5) {
  deckZone.innerHTML = '';
  const pack = [];

  for (let i = 0; i < count; i++) {
    const id = getRandomPokemonId();
    const pokemonData = await loadPokemon(id);
    pack.push(pokemonData);
  }

  localStorage.setItem(LAST_PACK_KEY, JSON.stringify(pack));
  localStorage.setItem(LAST_DRAW_KEY, Date.now().toString());
}

function canDraw() {
  const lastDraw = localStorage.getItem(LAST_DRAW_KEY);
  if (!lastDraw) return true;

  const now = Date.now();
  return now - parseInt(lastDraw, 10) >= COOLDOWN_TIME;
}

function updateButtonState() {
  if (canDraw()) {
    drawButton.disabled = false;
    drawButton.textContent = '🎴 Tirer un nouveau pack';
  } else {
    drawButton.disabled = true;

    const remaining = COOLDOWN_TIME - (Date.now() - localStorage.getItem(LAST_DRAW_KEY));
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    drawButton.textContent = `⏳ Patientez ${minutes}m ${seconds}s`;

    const savedPack = localStorage.getItem(LAST_PACK_KEY);
    if (savedPack) {
      deckZone.innerHTML = '';
      const packData = JSON.parse(savedPack);
      packData.forEach(displayPokemon);
    }

    setTimeout(updateButtonState, 1000);
  }
}

drawButton.addEventListener('click', async () => {
  if (!canDraw()) return;

  await loadRandomPack();
  setTimeout(updateButtonState, 1000);
});

updateButtonState();

// DRAG & DROP entre pioche et main

handZone.addEventListener('dragover', (e) => {
  e.preventDefault();
});

handZone.addEventListener('drop', (e) => {
  e.preventDefault();
  const data = e.dataTransfer.getData('text/plain');
  const cardData = JSON.parse(data);
  const card = new Card(cardData);
  handZone.appendChild(card.render());

  const currentHand = [...handZone.querySelectorAll('.card')];
  if (currentHand.length > 1) {
    const removed = currentHand[0];
    handZone.removeChild(removed);
    deckZone.appendChild(removed);
  }
});
