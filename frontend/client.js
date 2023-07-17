const socket = io('https://socketverso.onrender.com') 

const roomName = 'friends' 
const room = document.getElementById('room') 
const players = {} 

let x = 0 
let y = 0 
const step = 10 
const gameRoomWidth = 500 
const gameRoomHeight = 500 
const playerSize = 50 

function movePlayer() {

  // Your movePlayer() function implementation here
  // Calculate the new position after the key press
  const newX = Math.min(Math.max(x, 0), gameRoomWidth - playerSize) 
  const newY = Math.min(Math.max(y, 0), gameRoomHeight - playerSize) 

  // Update the player's position locally
  x = newX 
  y = newY 

  // Move the player on the screen
  players[socket.id].style.transform = `translate(${x}px, ${y}px)` 

  // Emit the 'updatePosition' event to the server
  socket.emit('updatePosition', {
    x: x,
    y: y,
  }) 
}

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
      y -= step 
      break 
    case 'ArrowDown':
      y += step 
      break 
    case 'ArrowLeft':
      x -= step 
      break 
    case 'ArrowRight':
      x += step 
      break 
    default:
      return 
  }
  movePlayer() 
}) 

socket.on('connect', () => {
  socket.emit('joinRoom', roomName) 
}) 

socket.on('playerInitialPosition', (initialPosition) => {
  const player = document.createElement('div') 
  player.className = 'player' 
  player.style.transform = `translate(${initialPosition.x}px, ${initialPosition.y}px)` 

  // Adicione o nome do player usando o ID do socket como texto dentro do player
  const playerName = document.createElement('span') 
  playerName.textContent = socket.id 
  player.appendChild(playerName) 

  room.appendChild(player) 
  players[socket.id] = player 
}) 

socket.on('currentPlayers', (playersData) => {
  for (const playerData of playersData) {
    if (!players[playerData.id]) {
      const newPlayer = document.createElement('div') 
      newPlayer.className = 'player' 
      newPlayer.id = playerData.id 
      newPlayer.style.transform = `translate(${playerData.position.x}px, ${playerData.position.y}px)` 

      // Adicione o nome do player usando o ID do socket como texto dentro do player
      const playerName = document.createElement('span') 
      playerName.textContent = playerData.id 
      newPlayer.appendChild(playerName) 

      room.appendChild(newPlayer) 
      players[playerData.id] = newPlayer 
    }
  }
}) 

socket.on('playerJoined', (playerData) => {
  if (!players[playerData.id]) {
    const newPlayer = document.createElement('div') 
    newPlayer.className = 'player' 
    newPlayer.id = playerData.id 
    newPlayer.style.transform = `translate(${playerData.position.x}px, ${playerData.position.y}px)` 

    // Adicione o nome do player usando o ID do socket como texto dentro do player
    const playerName = document.createElement('span') 
    playerName.textContent = playerData.id 
    newPlayer.appendChild(playerName) 

    room.appendChild(newPlayer) 
    players[playerData.id] = newPlayer 
  }
}) 

socket.on('playerPositionUpdated', (data) => {
  const updatedPlayer = players[data.playerId] 
  if (updatedPlayer) {
    updatedPlayer.style.transform = `translate(${data.position.x}px, ${data.position.y}px)` 
  }
}) 

socket.on('playerDisconnected', (disconnectedPlayer) => {
  const disconnectedPlayerDiv = players[disconnectedPlayer.id] 
  if (disconnectedPlayerDiv) {
    room.removeChild(disconnectedPlayerDiv) 
    delete players[disconnectedPlayer.id] 
  }
}) 

// Complete a função movePlayer aqui (caso ainda haja algo a ser adicionado)

// Receives the message event from the server
socket.on('message', (data) => {
  console.log(data) 
}) 

// Notify the server when the player disconnects
window.addEventListener('beforeunload', () => {
  socket.disconnect() 
}) 