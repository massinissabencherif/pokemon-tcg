// script.js

const container = document.getElementById('card-container');
const drawButton = document.getElementById('draw-button');
const COOLDOWN_TIME = 5 * 60 * 1000; // 5 minutes en ms
const LAST_DRAW_KEY = 'lastDrawTime';
const LAST_PACK_KEY = 'lastDrawPack';

// Utilitaire : Tirage aléatoire d’un ID de Pokémon
function getRandomPokemonId() {
  return Math.floor(Math.random() * 151) + 1;
}

// Affichage d’un Pokémon dans le DOM
function displayPokemon(data) {
  const card = document.createElement('div');
  card.classList.add('card');

  const img = document.createElement('img');
  img.src = data.sprites?.front_default || data.image;
  img.alt = data.name;

  const name = document.createElement('h2');
  name.textContent = data.name;

  const type = document.createElement('p');
  type.textContent = `Type: ${Array.isArray(data.types) ? data.types.join(', ') : ''}`;

  let primaryType = 'normal';

  if (Array.isArray(data.types)) {
    primaryType = typeof data.types[0] === 'string'
      ? data.types[0]
      : data.types[0]?.type?.name || 'normal';
  }
  
  card.classList.add(`type-${primaryType}`);
  

  card.appendChild(img);
  card.appendChild(name);
  card.appendChild(type);
  container.appendChild(card);
}

// Charge un Pokémon depuis l’API et retourne un objet simplifié
async function loadPokemon(id) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await response.json();

  displayPokemon(data); // affichage
  return {
    id: data.id,
    name: data.name,
    image: data.sprites.front_default,
    types: data.types.map(t => t.type.name),
  };
}

// Tirer un pack de X Pokémon (par défaut 5)
async function loadRandomPack(count = 5) {
  container.innerHTML = '';
  const pack = [];

  for (let i = 0; i < count; i++) {
    const id = getRandomPokemonId();
    const pokemonData = await loadPokemon(id);
    pack.push(pokemonData);
  }

  // Sauvegarde dans localStorage
  localStorage.setItem(LAST_PACK_KEY, JSON.stringify(pack));
  localStorage.setItem(LAST_DRAW_KEY, Date.now().toString());
}

// Vérifie si on peut tirer
function canDraw() {
  const lastDraw = localStorage.getItem(LAST_DRAW_KEY);
  if (!lastDraw) return true;

  const now = Date.now();
  return now - parseInt(lastDraw, 10) >= COOLDOWN_TIME;
}

// Met à jour l'état du bouton et réaffiche le dernier pack si bloqué
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
      container.innerHTML = '';
      const packData = JSON.parse(savedPack);
      packData.forEach(displayPokemon);
    }

    setTimeout(updateButtonState, 1000);
  }
}

// Clic bouton : tirer un nouveau pack
drawButton.addEventListener('click', async () => {
    if (!canDraw()) return;
  
    await loadRandomPack();
  
    // 🔁 délai de 1 seconde avant de mettre à jour le bouton
    setTimeout(updateButtonState, 1000);
  });
  

// Initialisation
updateButtonState();
