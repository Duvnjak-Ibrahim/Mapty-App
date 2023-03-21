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

}
class Running extends Workout{
    constructor(coords,distance,duration,cadence){
        super(coords,distance,duration)
        this.cadence = cadence
        this.calcPace()
    }
    calcPace(){
        this.pace = this.duration / this.distance
        return this.pace
    }
}
class Cycling extends Workout{
    constructor(coords,distance,duration,elevation){
        super(coords,distance,duration)
        this.elevation = elevation
        this.calcSpeed()
    }
    calcSpeed(){
        this.speed = this.distance / (this.duration / 60)
        return this.speed
    }
}


class App {
    #map;
    #mapEvent;
    constructor(){
        this._getPosition()

        form.addEventListener("submit",this._newWorkout.bind(this))
        
        inputType.addEventListener("change",this._toggleElevationField)
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
            
           

            this.#map.on("click",this._showForm.bind(this))
    
    }
    _showForm(mapE){
        this.#mapEvent = mapE;
        form.classList.remove("hidden")
        inputDistance.focus()

    }
    _toggleElevationField(){
        inputCadence.parentElement.classList.toggle("form__row--hidden")
        inputElevation.parentElement.classList.toggle("form__row--hidden")
    }
    _newWorkout(e){
        e.preventDefault()
        
        inputCadence.value = inputDistance.value =
         inputDuration.value = inputElevation.value =""
         console.log(this.mapEvent);
                // they neeeeed to have same name if u want to destructure object
                const {lat,lng} = this.#mapEvent.latlng
                // console.log(latitude,longitude);
                L.marker([lat,lng])
                .addTo(this.#map)
                .bindPopup(L.popup({
                    minWidth:100,
                    maxWidth:300,
                    autoClose:false,
                    closeOnClick:false,
                    className:"running-popup",
                }))
                .setPopupContent("workout")
                .openPopup();
    }
}

const app = new App()



// form.addEventListener("submit",function(e){
//     e.preventDefault()

//     inputCadence.value = inputDistance.value =
//      inputDuration.value = inputElevation.value =""
//      console.log(mapEvent0);
//             // they neeeeed to have same name if u want to destructure object
//             const {lat,lng} = mapEvent0.latlng
//             // console.log(latitude,longitude);
//             L.marker([lat,lng])
//             .addTo(map)
//             .bindPopup(L.popup({
//                 minWidth:100,
//                 maxWidth:300,
//                 autoClose:false,
//                 closeOnClick:false,
//                 className:"running-popup",
//             }))
//             .setPopupContent("workout")
//             .openPopup();
// })

// inputType.addEventListener("change",function(){
//     inputCadence.parentElement.classList.toggle("form__row--hidden")
//     inputElevation.parentElement.classList.toggle("form__row--hidden")
// })