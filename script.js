'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout{
    date = new Date()
    id = (Date.now() + "").slice(-10)

    constructor(coords,distance,duration){
        this.coords = coords
        this.distance = distance
        this.duration = duration
       
    }
    _stringtype(){
        const months=["Januar","February","March","April","May","June","July",
        "September","October","November","December"]
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]}`

    }
}
class Running extends Workout{
    type="running"
    constructor(coords,distance,duration,cadence){
        super(coords,distance,duration)
        this.cadence = cadence
        this.calcPace()
        this._stringtype()
    }
    calcPace(){
        this.pace = this.duration / this.distance
        return this.pace
    }
}
class Cycling extends Workout{
    type="cycling"
    constructor(coords,distance,duration,elevation){
        super(coords,distance,duration)
        this.elevation = elevation
        this.calcSpeed()
        this._stringtype()
    }
    calcSpeed(){
        this.speed = this.distance / (this.duration / 60)
        return this.speed
    }
}


class App {
    #map;
    #mapEvent;
    #workouts = [];
    constructor(){
        // getpositon
        this._getPosition()
        // get localestorage Data
        this._getLocaleStorage()
        // eventhandlers
        form.addEventListener("submit",this._newWorkout.bind(this))
        inputType.addEventListener("change",this._toggleElevationField)
        containerWorkouts.addEventListener("click",this._moveToPopup.bind(this))
    }
    _getPosition(){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
              
            function () {
              alert('could not get location');
            }
          );
        }
    }
    _loadMap(position){
        
            const longitude = position.coords.longitude;
            const latitude = position.coords.latitude;
            
            const coords = [latitude,longitude]
            this.#map = L.map('map').setView(coords, 15);
            
            
            L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(this.#map);
            
            this.#workouts.forEach(workout =>
                this._renderMarker(workout)
                )

            this.#map.on("click",this._showForm.bind(this))
    
    }
    _showForm(mapE){
        this.#mapEvent = mapE;
        form.classList.remove("hidden")
        inputDistance.focus()

    }
    _hideForm(){
        // inputs emptying
        inputCadence.value = inputDistance.value =
        inputDuration.value = inputElevation.value =""

        form.style.display ="none"
        form.classList.add("hidden")
        setTimeout(() => {
            form.style.display ="grid"
        }, 1000);
        

    }
    
    _toggleElevationField(){
        inputCadence.parentElement.classList.toggle("form__row--hidden")
        inputElevation.parentElement.classList.toggle("form__row--hidden")
    }
    _newWorkout(e){
        e.preventDefault()
        
        // get data 
        const type = inputType.value
        const distance = +inputDistance.value
        const duration = +inputDuration.value
        // they neeeeed to have same name if u want to destructure object
        const {lat,lng} = this.#mapEvent.latlng
        let workout ;
       
        // check data

        // if run runObj
      if(type === "running"){
        const cadence = +inputCadence.value;
        if(!Number.isFinite(distance) ||
        !Number.isFinite(duration) ||
        !Number.isFinite(cadence) || 
        distance  < 1 ||
        duration  < 1 ||
        cadence  < 1 
        // || !allPositive(distance,duration,cadence)
        ){
            return alert("wrong")
        }
         workout = new Running([lat, lng],
            distance,duration,cadence)
            
      }
        // if cycle cylceObj
        if(type === "cycling"){
            const elevation = +inputElevation.value;
            if(!Number.isFinite(distance) ||
            !Number.isFinite(duration) ||
            !Number.isFinite(elevation) || 
            distance  < 1 ||
            duration  < 1 
            ) {
                // console.log(IsValid(distance,duration));
                return alert("wrong")
            }
             workout = new Cycling([lat, lng],
                distance,duration,elevation)
        }
        // add new object to array
        this.#workouts.push(workout)
       
        // render workout as marker
        this._renderMarker(workout)

        // make inputs empty
        this._hideForm()
         
               
        // render workout on list
        this._renderWorkout(workout)

        // set localstorage
        this._setLocalStorage()
       
    }
    _renderMarker(workout){
        L.marker(workout.coords)
                .addTo(this.#map)
                .bindPopup(L.popup({
                    minWidth:100,
                    maxWidth:300,
                    autoClose:false,
                    closeOnClick:false,
                    className:`${workout.type}-popup`,
                }))
                .setPopupContent(`${workout.type === "running"? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`)
                .openPopup();
    }
    
    _renderWorkout(workout){
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${workout.type === "running"? "🏃‍♂️" : "🚴‍♀️"}</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`

    if(workout.type === "running"){
        html+=`<div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`
    }
    if(workout.type === "cycling"){
        html+=`<div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevation}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>`
    }
    form.insertAdjacentHTML("afterend", html)
    }
    _moveToPopup(e){
        const workoutEl = e.target.closest(".workout")
        if(!workoutEl) return;
        const workout = this.#workouts.find(
        work => work.id === workoutEl.dataset.id )

        this.#map.setView(workout.coords,17,{
            animate: true,
            pan:{
                duration:1
            }
        })

    }
    _setLocalStorage(){
        localStorage.setItem("workouts",JSON.stringify(this.#workouts))
    }
    _getLocaleStorage(){
        const data = JSON.parse(localStorage.getItem("workouts"))
        console.log(data);
        if(!data) return
        this.#workouts = data
        this.#workouts.forEach(workout =>
            this._renderWorkout(workout)
            )
    }
    reset(){
        localStorage.removeItem("workouts")
        location.reload()
    }
}

const app = new App()

