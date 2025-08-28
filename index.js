// API Configuration
const API_CONFIG = {
  BASE: "https://fsa-puppy-bowl.herokuapp.com/api",
  COHORT: "/2803-MAWEAVER",
  RESOURCE: "/players",
};

const API_URL = API_CONFIG.BASE + API_CONFIG.COHORT;

let players = [];
let selectedPlayer = null;

async function fetchPlayers() {
  try {
    const response = await fetch(`${API_URL}${API_CONFIG.RESOURCE}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    players = result.data.players;
    return players;
  } catch (error) {
    console.error("Error fetching players:", error);
    displayError("Failed to load players. Please try again later.");
    return [];
  }
}

async function fetchSinglePlayer(playerId) {
  try {
    const response = await fetch(
      `${API_URL}${API_CONFIG.RESOURCE}/${playerId}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    selectedPlayer = result.data.player;
    return selectedPlayer;
  } catch (error) {
    console.error(`Error fetching player #${playerId}:`, error);
    displayError("Failed to load player details. Please try again.");
    return null;
  }
}

async function addNewPlayer(playerObj) {
  try {
    const response = await fetch(`${API_URL}${API_CONFIG.RESOURCE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playerObj),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // Refresh the player list after adding
    await renderPlayerList();
    return result;
  } catch (error) {
    console.error("Error adding player:", error);
    displayError("Failed to add player. Please try again.");
    return null;
  }
}

async function removePlayer(playerId) {
  try {
    const response = await fetch(
      `${API_URL}${API_CONFIG.RESOURCE}/${playerId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // Refresh the player list after removal
    await renderPlayerList();
    return result;
  } catch (error) {
    console.error(`Error removing player #${playerId}:`, error);
    displayError("Failed to remove player. Please try again.");
    return null;
  }
}

// UI Components
function createPlayerListItem(player) {
  const listItem = document.createElement("li");
  listItem.className = "player-item";

  const link = document.createElement("a");
  link.href = "#";
  link.textContent = player.name;
  link.addEventListener("click", (e) => {
    e.preventDefault();
    renderSelectedPlayer(player.id);
  });

  const removeButton = document.createElement("button");
  removeButton.className = "button remove-btn";
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", async () => {
    if (confirm(`Are you sure you want to remove ${player.name}?`)) {
      await removePlayer(player.id);
    }
  });

  listItem.appendChild(link);
  listItem.appendChild(removeButton);
  return listItem;
}

function createPlayerDetails(player) {
  const detailsDiv = document.createElement("div");
  detailsDiv.className = "player-details";

  detailsDiv.innerHTML = `
        <h2>${player.name}</h2>
        <img src="${player.imageUrl}" alt="${
    player.name
  }" onerror="this.src='https://via.placeholder.com/300x200?text=Puppy+Image'"/>
        <p><strong>Breed:</strong> ${player.breed || "Unknown"}</p>
        <p><strong>Status:</strong> ${player.status || "Active"}</p>
        <p><strong>Team:</strong> ${player.teamId || "Unassigned"}</p>
    `;

  return detailsDiv;
}

function displayError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  errorDiv.style.cssText =
    "background-color: #ffebee; color: #c62828; padding: 10px; border-radius: 4px; margin: 10px 0; border: 1px solid #ffcdd2;";

  // Remove any existing error messages
  const existingErrors = document.querySelectorAll(".error-message");
  existingErrors.forEach((error) => error.remove());

  const mainContent = document.querySelector(".main-content");
  mainContent.insertBefore(errorDiv, mainContent.firstChild);

  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
}

async function renderPlayerList() {
  const playerListSection = document.getElementById("player-list");
  playerListSection.innerHTML = "<h2>Players</h2>";

  try {
    const players = await fetchPlayers();

    if (players.length === 0) {
      playerListSection.innerHTML += "<p>No players found.</p>";
      return;
    }

    const playerList = document.createElement("ul");
    playerList.className = "player-list";

    players.forEach((player) => {
      const listItem = createPlayerListItem(player);
      playerList.appendChild(listItem);
    });

    playerListSection.appendChild(playerList);
  } catch (error) {
    console.error("Error rendering player list:", error);
    playerListSection.innerHTML += "<p>Failed to load players.</p>";
  }
}

async function renderSelectedPlayer(playerId) {
  const selectedPlayerSection = document.getElementById("selected-player");
  selectedPlayerSection.innerHTML = "<h2>Selected Player</h2>";

  try {
    const player = await fetchSinglePlayer(playerId);

    if (player) {
      const playerDetails = createPlayerDetails(player);
      selectedPlayerSection.appendChild(playerDetails);
    } else {
      selectedPlayerSection.innerHTML +=
        "<p>No player selected or player not found.</p>";
    }
  } catch (error) {
    console.error("Error rendering selected player:", error);
    selectedPlayerSection.innerHTML += "<p>Failed to load player details.</p>";
  }
}

// Initialize Application
async function initializeApp() {
  try {
    await renderPlayerList();
    console.log("Puppy Bowl application initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize application:", error);
    displayError("Failed to initialize application. Please refresh the page.");
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", initializeApp);

// Export functions for potential future use
window.PuppyBowl = {
  fetchPlayers,
  fetchSinglePlayer,
  addNewPlayer,
  removePlayer,
  renderPlayerList,
  renderSelectedPlayer,
};
