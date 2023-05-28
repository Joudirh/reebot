import bot from './assets/bot.svg';
import user from './assets/user.svg'

const app = document.getElementById('app');
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');


let responses = [];



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

//detailsContainer.addEventListener('change', updateetapesMsgList);
const requestionSelect = document.getElementById("requestionSelect");
requestionSelect.addEventListener('change', updateetapesMsgList);

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
  //console.log(msgList);
  // Afficher ou vider msgOutput
  if (msgList.length === 0) {
    msgOutput.value = "";
  } else {
    msgOutput.value = msgList.join(" ") + " Donne-moi une solution précise sous forme de phrases courtes et numérotées.";
  }





}

function updateetapesMsgList() {

  // msgOutput.style.height = msgOutput.scrollHeight + 'px'; // Ajustez la hauteur en fonction du contenu

  //   if (requestionSelect.value !== "-1") {
  //     msgOutput.value = `Comment ${requestionSelect.textContent.charAt(0).toLowerCase()}${requestionSelect.textContent.slice(1)} ?`; // Ajouter "Comment" et convertir la première lettre en minuscule
  //   }

  const selectedPhrase = requestionSelect.options[requestionSelect.selectedIndex].textContent;
  const firstLetter = selectedPhrase.charAt(0).toLowerCase();
  const remainingText = selectedPhrase.slice(1);
  const formattedPhrase = `Comment ${firstLetter}${remainingText} ?`;
  
  msgOutput.style.height = msgOutput.scrollHeight + 'px'; // Ajustez la hauteur en fonction du contenu

  if (requestionSelect.value !== "-1") {
    msgOutput.value = formattedPhrase;
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
  //const response = await fetch('http://localhost:5000', {
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

    ///////////////// Ajouter les réponses 
    responses.push(parsedData);
    displayResponses();
    //console.log(responses);
    /////////////////

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

///----------

var CountPhrases = 0;
var CountReponse = 0;
var currentResponse = [];
var tabLongReponse = [];

// Fonction pour afficher les réponses stockées dans la console du navigateur
function displayResponses() {
    //console.log(responses);
      // responses contient la reponse de chatgpt sous forme d'une liste de phrases non formatées
    const cleanResponses = responses.map(response => {
      // Supprimer le retour à la ligne "\n"
      const cleanedResponse = response.replace(/\n/g, '');
      // Supprimer chaque numéro suivi directement par un point et un espace, mais ne pas supprimer les lettres suivies par des chiffres, un point et un espace
      const withoutNumbers = cleanedResponse.replace(/\b(\d+)\.\s(?!([A-Za-z]+\d*\.\s))/g, '');
      // Diviser la réponse en phrases terminées par un point
      const phrases = withoutNumbers.split('.').filter(phrase => phrase.trim() !== '');
      return phrases;
    });

    // result contient la reponse de chatgpt sous forme d'une liste de phrases formatées
    const result = cleanResponses.flat().map(phrase => phrase.trim());

    CountReponse += 1;

    let lastCountPhrases = CountPhrases;
    CountPhrases = result.length;

    const currentResponse = result.slice(lastCountPhrases, CountPhrases);

    tabLongReponse.push(currentResponse.length);

    // Récupérer l'élément select du sélecteur "requestion"
    const etapesSelect = document.getElementById("etapesSelect");
    
    // // Supprimer toutes les options actuelles du sélecteur "etapes"
    // while (etapesSelect.firstChild && etapesSelect.firstChild.value !== "-1") {
    //   etapesSelect.removeChild(etapesSelect.firstChild);
    // }

    const options = etapesSelect.querySelectorAll('option');
    for (let i = 1; i < options.length; i++) {
      etapesSelect.removeChild(options[i]);
    }

   
     // Ajouter les nouvelles options basées sur le nombre de réponses de chatgpt
    for (let i = 0; i < CountReponse; i++) {
      const option = document.createElement("option");
      option.value = i.toString();
      option.textContent = (i + 1).toString();
      etapesSelect.appendChild(option);
    }

    // Écouter l'événement de changement du sélecteur "etapes"
    //etapesSelect.addEventListener('change', updateRequestionOptions(currentResponse));
    etapesSelect.addEventListener('change', function() {
      updateRequestionOptions(tabLongReponse, result);
    });
    
    //updateRequestionOptions();
}


// Fonction pour mettre à jour les options du sélecteur "requestion" en fonction de l'étape sélectionnée
function updateRequestionOptions(tabLongReponse, result) {
  const etapesSelect = document.getElementById("etapesSelect");
  const requestionSelect = document.getElementById("requestionSelect");

  const selectedEtapeIndex = parseInt(etapesSelect.value);
  //console.log(selectedEtapeIndex);

  // Supprimer toutes les options actuelles du sélecteur "requestion"
  const options = requestionSelect.querySelectorAll('option');
    for (let i = 1; i < options.length; i++) {
      requestionSelect.removeChild(options[i]);
    }

  // Vérifier si l'étape sélectionnée est valide
  if (selectedEtapeIndex >= 0) {
    let nbrPhrasePrecedent = 0;

    for (let i = 0; i < selectedEtapeIndex; i++){
      nbrPhrasePrecedent = nbrPhrasePrecedent + tabLongReponse[i];
    }

    const selectedEtapeResult = result.slice(nbrPhrasePrecedent, nbrPhrasePrecedent + tabLongReponse[selectedEtapeIndex]);
    console.log(selectedEtapeResult);

    for (let i = 0; i < selectedEtapeResult.length; i++) {
      const option = document.createElement("option");
      option.value = i.toString();
      option.textContent = selectedEtapeResult[i];
      requestionSelect.appendChild(option);
    }
  }
}

// Appeler la fonction displayResponses pour afficher les réponses initiales
//displayResponses();

