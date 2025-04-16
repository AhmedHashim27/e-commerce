/**********************************************
  * FC Barcelona Player Comparison App
 * FC Barcelona Players – Using players.json from GitHub.
 **********************************************/

/* Global Variables */
let players = [];
let currentSortMethod = null;
let searchTerm = "";
let currentPositionFilter = "All";
let currentFavoriteFilter = false;
let currentLaMasiaFilter = false;
let selectedPlayersForComparison = [];

/* Load player data from JSON and set default values */
async function loadPlayerData() {
  try {
    const response = await fetch("players.json");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    players = await response.json();

    // Set defaults for missing properties (assumes 'laMasia' is provided in JSON)
    players = players.map(player => ({
      ...player,
      jerseyNumber: player.jerseyNumber || "00",
      matchesPlayed: player.matchesPlayed || 0,
      assists: player.assists || 0,
      favorite: player.favorite || false
      // 'laMasia' remains as provided in the JSON
    }));

    displayPlayers();
    setupEventListeners();
  } catch (error) {
    console.error("Error loading player data:", error);
  }
}

/* Display filtered and sorted player cards on the page */
function displayPlayers() {
  const cardContainer = document.getElementById("card-container");
  cardContainer.innerHTML = "";

  // Filter players by search term and position
  let filtered = players.filter(player => {
    const fullName = player.name.toLowerCase();
    const positionMatch = currentPositionFilter === "All" ||
      player.position.toLowerCase() === currentPositionFilter.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) && positionMatch;
  });

  // Apply extra filters if set (using the correct 'laMasia' property)
  if (currentFavoriteFilter) filtered = filtered.filter(player => player.favorite);
  if (currentLaMasiaFilter) filtered = filtered.filter(player => player.laMasia);

  // Sort players if a sort method is specified
  if (currentSortMethod) {
    filtered.sort((a, b) => {
      switch (currentSortMethod) {
        case "name": return a.name.localeCompare(b.name);
        case "rating": return b.rating - a.rating;
        case "matchesPlayed": return b.matchesPlayed - a.matchesPlayed;
        default: return 0;
      }
    });
  }

  // Create and append cards for each player
  filtered.forEach(player => {
    const card = createPlayerCard(player);
    cardContainer.appendChild(card);
  });

  // Update the category header text
  document.getElementById("current-category").textContent =
    currentPositionFilter === "All" ? "ALL PLAYERS" : `${currentPositionFilter.toUpperCase()}S`;
}

/* Create a player card element */
function createPlayerCard(player) {
  const card = document.createElement("div");
  card.className = "player-card";

  const isSelected = selectedPlayersForComparison.some(p => p.name === player.name);

  card.innerHTML = `
    <div class="jersey-number">${player.jerseyNumber}</div>
    <img src="${player.photo}" alt="${player.name} Photo" class="player-img">
    <div class="player-info">
      <div class="player-name">${player.name}</div>
      <div class="player-position">${player.position}</div>
    </div>
    <div class="player-stats">
      <div class="stats-container">
        <div class="stat-item">
          <div class="stat-value">${player.matchesPlayed}</div>
          <div class="stat-label">APPEARANCES</div>
          <div class="stat-season">2024/2025</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${player.goals}</div>
          <div class="stat-label">GOALS</div>
          <div class="stat-season">2024/2025</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${player.assists}</div>
          <div class="stat-label">ASSISTS</div>
          <div class="stat-season">2024/2025</div>
        </div>
      </div>
    </div>
    <span class="favorite-star ${player.favorite ? 'active' : ''}" title="Toggle Favorite">★</span>
    <button class="compare-button ${isSelected ? 'selected' : ''}" title="Compare Player">
      ${isSelected ? 'Selected' : 'Compare'}
    </button>
    ${player.laMasia ? '<div class="la-masia-badge" title="La Masia Graduate"></div>' : ''}
  `;

  // Toggle favorite on star click
  card.querySelector(".favorite-star").addEventListener("click", () => toggleFavorite(player));
  // Toggle comparison selection on Compare button click
  card.querySelector(".compare-button").addEventListener("click", () => togglePlayerComparison(player));

  return card;
}

/* Toggle favorite status for a player and refresh display */
function toggleFavorite(player) {
  player.favorite = !player.favorite;
  displayPlayers();
}

/* Toggle a player for comparison (max 2) and show modal if two are selected */
function togglePlayerComparison(player) {
  const index = selectedPlayersForComparison.findIndex(p => p.name === player.name);
  if (index !== -1) {
    selectedPlayersForComparison.splice(index, 1);
  } else {
    if (selectedPlayersForComparison.length < 2) {
      selectedPlayersForComparison.push(player);
    } else {
      alert("You can only compare up to 2 players at a time. Deselect one first.");
      return;
    }
  }
  displayPlayers();
  if (selectedPlayersForComparison.length === 2) showComparisonModal();
}

/* Display the comparison modal with details of the two selected players */
function showComparisonModal() {
  const modal = document.getElementById("compare-modal");
  const container = document.getElementById("comparison-container");
  container.innerHTML = "";

  if (selectedPlayersForComparison.length !== 2) return;

  const [player1, player2] = selectedPlayersForComparison;
  container.innerHTML = `
    <div class="comparison-player">
      <img src="${player1.photo}" alt="${player1.name}" class="comparison-image">
      <div class="comparison-name">${player1.name}</div>
      <div class="comparison-position">${player1.position}</div>
      <div class="comparison-stats">
        <div class="comparison-stat">
          <span>Rating</span>
          <span class="${player1.rating > player2.rating ? 'stat-better' : ''}">${player1.rating}/100</span>
        </div>
        <div class="comparison-stat">
          <span>Appearances</span>
          <span class="${player1.matchesPlayed > player2.matchesPlayed ? 'stat-better' : ''}">${player1.matchesPlayed}</span>
        </div>
        <div class="comparison-stat">
          <span>Goals</span>
          <span class="${player1.goals > player2.goals ? 'stat-better' : ''}">${player1.goals}</span>
        </div>
        <div class="comparison-stat">
          <span>Assists</span>
          <span class="${player1.assists > player2.assists ? 'stat-better' : ''}">${player1.assists}</span>
        </div>
        <div class="comparison-stat">
          <span>La Masia</span>
          <span>${player1.laMasia ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
    <div class="comparison-player">
      <img src="${player2.photo}" alt="${player2.name}" class="comparison-image">
      <div class="comparison-name">${player2.name}</div>
      <div class="comparison-position">${player2.position}</div>
      <div class="comparison-stats">
        <div class="comparison-stat">
          <span>Rating</span>
          <span class="${player2.rating > player1.rating ? 'stat-better' : ''}">${player2.rating}/100</span>
        </div>
        <div class="comparison-stat">
          <span>Appearances</span>
          <span class="${player2.matchesPlayed > player1.matchesPlayed ? 'stat-better' : ''}">${player2.matchesPlayed}</span>
        </div>
        <div class="comparison-stat">
          <span>Goals</span>
          <span class="${player2.goals > player1.goals ? 'stat-better' : ''}">${player2.goals}</span>
        </div>
        <div class="comparison-stat">
          <span>Assists</span>
          <span class="${player2.assists > player1.assists ? 'stat-better' : ''}">${player2.assists}</span>
        </div>
        <div class="comparison-stat">
          <span>La Masia</span>
          <span>${player2.laMasia ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  `;
  modal.style.display = "block";
}

/* Close the comparison modal */
function closeComparisonModal() {
  document.getElementById("compare-modal").style.display = "none";
  selectedPlayersForComparison = [];
  displayPlayers();
}

/* Sorting and searching functions */
function sortBy(method) {
  currentSortMethod = method;
  displayPlayers();
}
function handleSearchInput() {
  searchTerm = document.getElementById("search-input").value;
  displayPlayers();
}
function clearSearch() {
  document.getElementById("search-input").value = "";
  searchTerm = "";
  displayPlayers();
}

/* Filter functions */
function filterFavoriteTeam() {
  currentFavoriteFilter = true;
  currentLaMasiaFilter = false;
  displayPlayers();
}
function filterLaMasiaTeam() {
  currentLaMasiaFilter = true;
  currentFavoriteFilter = false;
  displayPlayers();
}
function clearAllFilters() {
  currentPositionFilter = "All";
  currentFavoriteFilter = false;
  currentLaMasiaFilter = false;
  searchTerm = "";
  currentSortMethod = null;
  document.getElementById("search-input").value = "";
  displayPlayers();
}
function filterByPosition(position) {
  currentPositionFilter = position;
  // Update active state on position links
  document.querySelectorAll('.position-link').forEach(link => {
    link.classList.toggle('active', link.dataset.position === position);
  });
  currentFavoriteFilter = false;
  currentLaMasiaFilter = false;
  displayPlayers();
}

/* Setup event listeners for the UI elements */
function setupEventListeners() {
  document.getElementById("search-input").addEventListener("input", handleSearchInput);
  document.getElementById("clear-search").addEventListener("click", clearSearch);
  document.getElementById("show-favorite-team").addEventListener("click", filterFavoriteTeam);
  document.getElementById("la-masia-filter").addEventListener("click", filterLaMasiaTeam);
  document.getElementById("clear-filters").addEventListener("click", clearAllFilters);
  document.getElementById("clear-favorites").addEventListener("click", () => {
    players.forEach(player => player.favorite = false);
    displayPlayers();
  });
  document.querySelector("#compare-modal .close-modal").addEventListener("click", closeComparisonModal);
  document.getElementById("close-comparison").addEventListener("click", closeComparisonModal);
  document.querySelectorAll('.position-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      filterByPosition(link.dataset.position);
    });
  });
}

/* Initialize the app when the DOM is ready */
document.addEventListener("DOMContentLoaded", loadPlayerData);
