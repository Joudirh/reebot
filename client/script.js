import bot from './assets/bot.svg';
import user from './assets/user.svg'

const app = document.getElementById('app');
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');





let loadInterval
// Cette fonction en JavaScript efface le contenu d'un élément
// et affiche ensuite des points à intervalles réguliers. 
// Une fois que le contenu de l'élément est rempli de quatre points, il est réinitialisé à vide.
function loader(element){
  element.textContent = ''

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if(element.textContent === '....'){
      element.textContent = '';
    }
  }, 300);
}

// Cette fonction en JavaScript permet d'ajouter du texte à un élément HTML de manière animée.
// Elle prend en paramètre un élément HTML et une chaîne de caractères.
// Elle utilise ensuite un intervalle pour ajouter les caractères de la chaîne l'un après l'autre à l'élément HTML,
// à un rythme défini par le développeur.
// Une fois que tous les caractères ont été ajoutés, l'intervalle est arrêté.

function typeText(element, text){
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length){
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}

// Cette fonction génère un identifiant unique en combinant un timestamp et une chaîne hexadécimale aléatoire.
function generateUniqueId(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);
  return `id-${timestamp}-${hexadecimalString}`;
}

// Cette fonction retourne une chaîne de caractères qui représente un élément HTML.
// Il prend en compte si l'utilisateur est un bot ou un utilisateur,
// la valeur à afficher et un identifiant unique pour le message.

function chatStripe (isAi, value, uniqueId){
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class = "profile">
            <img
              src= ${isAi ? bot : user}
              alt="${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}



let objectif = document.getElementById("text-input");
let msgOutput = document.getElementsByName("prompt")[0];
let dropdownContainer = document.querySelector('.dropdowns');
let dropdowns = dropdownContainer.querySelectorAll('select');

objectif.addEventListener('input', updateMsgList);
dropdownContainer.addEventListener('change', updateMsgList);

//////////////////////

let detailsContainer = document.querySelector('.details');
let detailsdropdowns = detailsContainer.querySelectorAll('select');

detailsContainer.addEventListener('change', updateetapesMsgList);

// Initialiser les sélections des dropdowns
dropdowns.forEach(function(dropdown) {
  dropdown.value = "-1";
});

// Initialiser les sélections des dropdowns
detailsdropdowns.forEach(function(etapesdropdown) {
  etapesdropdown.value = "-1";
});


var msgList = [];
var etapesmsgList = [];

function updateMsgList() {
  let phrases = [];

  //msgOutput.style.height = 'auto';  Réinitialisez la hauteur à auto pour éviter les problèmes de taille
  msgOutput.style.height = msgOutput.scrollHeight + 'px'; // Ajustez la hauteur en fonction du contenu

  if (objectif.value !== "") {
    phrases.push(`Mon projet robotique consiste à ${objectif.value}.`);
  }
  
  dropdowns.forEach(function(dropdown) {
    let value = dropdown.value;
    if (value !== "-1") {
      switch (dropdown.name) {
        case "Interface":
          phrases.push(`Je vais utiliser une carte ${value}.`);
          break;
        case "Capteur":
          phrases.push(`La carte programmable accouplée par un capteur de ${value}.`);
          break;
        case "Actionneur":
          phrases.push(`On y ajoute un actionneur par exemple ${value}.`);
          break;
        case "Composante":
          phrases.push(`Je peux utiliser ${value}.`);
          break;
        case "Probleme":
          phrases.push(`Je crois que le problème soit au niveau ${value}.`);
          break;
      }
    }
  });

  msgList = phrases.length > 0 ? phrases : [];
  console.log(msgList);
  // Afficher ou vider msgOutput
  if (msgList.length === 0) {
    msgOutput.value = "";
  } else {
    msgOutput.value = msgList.join(" ") + " Donne-moi une solution précise sous forme de phrases courtes et numérotées.";
  }





}

function updateetapesMsgList() {
  let detailsphrases = [];

  //msgOutput.style.height = 'auto';  Réinitialisez la hauteur à auto pour éviter les problèmes de taille
  msgOutput.style.height = msgOutput.scrollHeight + 'px'; // Ajustez la hauteur en fonction du contenu

  detailsdropdowns.forEach(function(detailsdropdown) {
    let value = detailsdropdown.value;
    if (value !== "-1") {
      switch (detailsdropdown.name) {
        case "requestion":
          detailsphrases.push(`${value}`);
          break;
        case "etapes":
          detailsphrases.push(`l'étape numéro ${value}.`);
          break;
        
      }
    }
  });

  etapesmsgList = detailsphrases.length > 0 ? detailsphrases : [];
  // Afficher ou vider msgOutput
  console.log(etapesmsgList);
  if (etapesmsgList.length === 0) {
    msgOutput.value = "";
  } else {
    msgOutput.value = etapesmsgList.join(" ");
  }

}

const handleSubmit = async(e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  

  // après le clic , les elements sont initialisés
  form.reset();
  objectif.value = "";
  dropdowns.forEach(function(dropdown) {
    dropdown.value = "-1";
  });

  // bot's chatstripe

  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from server -> bot's response
  const response = await fetch('https://reebot.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }, 
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok){
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else{
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }

 


    



}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup',(e) => {
  if (e.keyCode === 13){
    handleSubmit(e);
  }
})

