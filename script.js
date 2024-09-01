//TODO: Look into replacing arrays with object constructors? Might be more efficient.
const line = document.getElementById("line");
const hoverPoint = document.getElementById("hoverPoint");
const point_data = document.getElementById("point_data");
const lineContainer = document.getElementById("lineContainer");
const submit_button = document.getElementById("submit_button");
const titleInput = document.getElementById("titleInput");
const description_data = document.getElementById("description_data");
const mouseXYposition = document.getElementById("mouseXYposition");
const dataConnectionLine = document.getElementById("dataConnectionLine");
const hoverPointInnerCircle = document.getElementById("hoverPointInnerCircle");
const flex_horizontal_points = document.getElementById("flex_horizontal_points");
const placedPointDisplay = document.getElementById("placedPointDisplay");
const pointTitle = document.getElementById("pointTitle");
const pointDescription = document.getElementById("pointDescription");
const landingPage = document.getElementById("landingPage");
const landingCircle = document.getElementById("landingCircle");
const backgroundImage = document.getElementById("backgroundImage");

let isKeyboardPlottingActive = false;

const dataStore = JSON.parse(localStorage.getItem('dataLocalStorage')) || []; // imports from local storage, otherwise creates empty array

description_data.addEventListener('input', e => parseTextToDate(e.target.value));
const dateOutputText = document.getElementById('dateOutputText');
const dateOutputTimecode = document.getElementById('dateOutputTimecode');
function parseTextToDate(input) {
    let dateString = input.trim();
    const currentYear = new Date().getFullYear();
    if (/[A-Za-z]+$/.test(dateString)) {
        dateString = `${dateString} 1, ${currentYear}`;
    } else if (/[A-Za-z]+\s\b([1-9]|1[0-9]|2[0-9]|3[0-1])\b$/.test(dateString)) {
        dateString = `${dateString}, ${currentYear}`;
    }
    const convertToDate = new Date(dateString);
    dateOutputText.innerHTML = convertToDate;
    dateOutputTimecode.innerHTML = Date.parse(convertToDate);
    return Date.parse(convertToDate);
}

let idCount = 1;
renderPointsFromLocalStorage();
function renderPointsFromLocalStorage() {
    dataStore.forEach(element => {
        placePointOnLine(element.title, element.description)
        idCount++;
    });
}

//TODO: When clicking on timeline between 2 points, make it so that its somehow quicker to select date?
//TODO: Sort points ordered by date
submit_button.onclick = submitData;
function submitData() {
    if (titleInput.value === '' && description_data.value === '') {
        inactiveStylingActivate();
    } else {
        let objPointData = {}
        objPointData.id = dataStore.length + 1;
        objPointData.title = titleInput.value;
        objPointData.description = description_data.value;
        dataStore.push(objPointData); // stores into array
        localStorage.setItem('dataLocalStorage', JSON.stringify(dataStore)); // serializes the array and stores in local storage
        
        placePointOnLine(objPointData.title, objPointData.description);
        inactiveStylingActivate();
        
        // console.log(localStorage); // for logging purposes
        // console.log(JSON.stringify(dataStore)); // for logging purposes
        console.log('Point data stored: ' + JSON.stringify(objPointData)); // for logging purposes
    }
}

let mousex;
let mousey;
document.addEventListener('mousemove', function getMousePosition(event) {
    mousex = event.pageX;
    mousey = event.pageY;
    const positionText= "X: " + mousex + ", Y: " + mousey;
    mouseXYposition.innerText = positionText;
    if (clickedOnLine == false) {
        hoverPoint.style.left = mousex + "px"; // move point with mouse
    }
});

let saveTransitionBehavior;
let point_dataMaxAllowablePosition
window.addEventListener('resize', initializePointData)
initializePointData();
function initializePointData() { // Temporarily exposes point_data to store offsetWidth
    console.log('Initialized point_data');
    saveTransitionBehavior = point_data.style.transitionBehavior;
    point_data.style.transitionBehavior = 'initial'
    point_data.classList.remove('isHidden');
    point_dataMaxAllowablePosition = line.offsetWidth + line.offsetLeft - point_data.offsetWidth;
    point_data.classList.add('isHidden');
}

landingCircle.onclick = enterHorizon;
function enterHorizon() {
    console.log('Executed enterHorizon()');
    landingPage.classList.add('isHidden');
    lineContainer.classList.remove('isHidden');
    backgroundImage.classList.add('backgroundImage-postEffects');
    initializePointData();
}

clickedOnLine = false;
line.onclick = showPointData;
function showPointData() {
    unfocusedPoint = false;
    if (!isKeyboardPlottingActive) {
        clickedOnLine = true;
        point_data.style.transitionBehavior = saveTransitionBehavior;
        if (mousex < point_dataMaxAllowablePosition) {
            point_data.style.left = mousex + "px";
        } else {
            point_data.style.left = point_dataMaxAllowablePosition + "px";
        }
        dataConnectionLine.classList.remove('isHidden');
        hoverPoint.classList.add('hoverPoint-onClick');
        hoverPoint.style.left = mousex + 'px';
        console.log("Clicked on timeline."); // Log to console
    } else {
        point_data.style.left = 'auto';
        console.log("Displaying pointData."); // Log to console
    }
    point_data.classList.remove('isHidden');
    setTimeout(() => {titleInput.focus()}, 1); // auto focuses to input field after 1 ms
}

function editPoint(elementID) {
    const pointToEdit = document.getElementById(elementID);
    pointToEdit.style.background = 'red';
}

function placePointOnLine(title, description) {
    pointTitle.innerText = title;
    pointDescription.innerText = description;
    
    dataConnectionLine.classList.remove('isHidden');
    placedPointDisplay.classList.remove('isHidden');
    const clonedPoint = hoverPoint.cloneNode(true);
    dataConnectionLine.classList.add('isHidden');
    placedPointDisplay.classList.add('isHidden');
    
    clonedPoint.classList.remove('hoverPoint-onClick');
    clonedPoint.classList.remove('isHidden');
    clonedPoint.classList.add('hoverPoint-onPlace');
    clonedPoint.id = `placedPoint${idCount}`;
    
    clonedPoint.addEventListener('click', e => {
        console.log(`Clicked ${e.target.id}`);
        editPoint(e.target.id)
    })
    flex_horizontal_points.appendChild(clonedPoint);
}

let unfocusedPoint = true;
document.addEventListener('click', function unfocusElement(event) {  
    if (unfocusedPoint === false && !line.contains(event.target) && !point_data.contains(event.target)) {
        inactiveStylingActivate();
        unfocusedPoint = true;
        console.log('Point unfocused!'); // Log to console
    }
});

line.onmouseover = function displayPoint() {
    hoverPoint.classList.remove('isHidden');
}

line.onmouseleave = function onMouseLeave(event) {
    if(clickedOnLine == false) {
        hoverPoint.classList.add('isHidden');
    }
}

window.addEventListener('resize', inactiveStylingActivate)
function inactiveStylingActivate() {
    point_data.classList.add('isHidden');
    dataConnectionLine.classList.add('isHidden');
    hoverPoint.classList.remove('hoverPoint-onClick');
    hoverPoint.classList.add('isHidden');

    clickedOnLine = false;
    isKeyboardPlottingActive = false;

    // Clearing input boxes
    titleInput.value = ""; 
    description_data.value = "";
}

titleInput.addEventListener('keydown', handleInputBoxesSubmit)
description_data.addEventListener('keydown', handleInputBoxesSubmit)
function handleInputBoxesSubmit(event) {
    switch (event.key) {
        case 'Enter':
            console.log("Pressed Enter"); // for logging purposes
            submitData();
            break;
        case 'Escape':
            inactiveStylingActivate();
        default:
            console.log(`"${event.key}" has been pressed.`)
            break;
    }
}

//TODO: Implement interacting and editing points.


//TODO: Implement case that toggles delete mode? Or maybe only when holding down key is better.
window.addEventListener('keydown', (event) => {
    if (!(getComputedStyle(point_data).display == 'flex')) {
        switch (event.key) {
            case 'Tab':
                console.log(`Pressed ${event.key}.`);
                isKeyboardPlottingActive = true;
                showPointData();
                break;
            case '?':
                //TODO: Open settings context menu
                console.log('TODO: Open settings context menu');
                break;
            default:
                break;
        }
    }
})

mouseXYposition.onclick = () => {
    alert(JSON.stringify(dataStore))
    localStorage.clear();
    location.reload();
}

if (dataStore.length > 0) {
    console.log('\'dataStore\' contains data. Entering Horizon.');
    enterHorizon();
}