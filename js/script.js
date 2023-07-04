const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const api_key = "b3a61e63a6b54285afb134026232503";
const url = `https://api.weatherapi.com/v1/current.json?key=${api_key}&q=`;

let currentLocation = "Kortrijk";
let increment = 0;

const wave = {
    y: canvas.height * 2.5,
    length: 0.01,
    amplitude: 100,
    frequency: 0.01,
    cloud: 0
};

const strokeColor = {
    h: 300,
    s: 100,
    l: 50
};

const backgroundColor = {
    r: 0,
    g: 0,
    b: 0,
    a: 0.3
};

const temperatureToHue = (temp) => {
    const minTemp = -30;
    const maxTemp = 30;
    const minHue = 240;
    const maxHue = 0;
    // formula finds the hue by scaling the temperature between its min and max to fit within the hue range, which helps visualize the temperature as a color.
    const hue = (temp - minTemp) / (maxTemp - minTemp) * (maxHue - minHue) + minHue;
    return hue;
};

const sliders = [
    { id: "amplitude-slider", property: "amplitude" },
    { id: "frequency-slider", property: "frequency" },
    { id: "length-slider", property: "length" },
    { id: "cloud-slider", property: "cloud" }
];

const cities = {
    'oymyakon': 'Oymyakon',
    'vostok': 'Vostok',
    'brussels': 'Brussels',
    'sydney': 'Sydney',
    'mexico-city': 'Mexico City',
    'lagos': 'Lagos'
};

const ButtonSwitches = () => {
    Object.keys(cities).forEach((city) => {
        document.querySelector(`#${city}`).addEventListener("click", () => {
            currentLocation = cities[city];
            fetchAndUpdate();
            // Update slider values based on the fetched weather data by setting the value property of each slider element
            valueSliders('set');
        });
    });
};

// value slider input is retrieved
const valueSliders = (inputType = 'get') => {
    sliders.forEach(({ id, property }) => {
        const slider = document.querySelector(`#${id}`);
        // // If inputType is 'get', add an event listener to the slider that updates the corresponding wave property when the slider value changes
        if (inputType === 'get')
            slider.addEventListener("input", () => {
                wave[property] = parseFloat(slider.value);
            });
        else
            slider.value = wave[property]
    });
};

const fetchAndUpdate = async () => {
    try {
        // JS api that returns a promise
        const response = await fetch(url + `${currentLocation}&aqi=`);
        //now the resolved item can be used as a regular JavaScript object
        const data = await response.json();
        // destructures the data.current, now I can just use the temp_c (instead of data.current.temp_c)
        const { wind_kph, temp_c, humidity, cloud } = data.current;
        wave.amplitude = temp_c * 10;
        wave.frequency = wind_kph / 300;
        wave.length = humidity / 1000;
        wave.cloud = cloud / 20;
    } catch (error) {
        console.error(error);
    }
};

const animate = () => {
    requestAnimationFrame(animate);
    c.fillStyle = `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`;
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.beginPath();
    for (let i = 0; i < canvas.width; i++) {
        c.lineTo(i, wave.y + Math.sin(i * wave.length + increment) * wave.amplitude);
    }
    const hue = temperatureToHue(wave.amplitude / 10);
    c.strokeStyle = `hsl(${hue}, ${strokeColor.s}%, ${strokeColor.l}%)`;

    const blurValue = wave.cloud;
    c.filter = `blur(${blurValue}px)`;

    c.lineWidth = 10;
    c.stroke();
    increment += wave.frequency;
};

const init = async () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    ButtonSwitches();
    // Set up event listeners for sliders to handle user input.
    valueSliders('get');
    // Fetch weather data and update wave properties
    await fetchAndUpdate();
    // Update slider values based on fetched weather data.
    valueSliders('set');
    animate();
};
init();
