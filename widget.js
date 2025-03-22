(function() {
    // Define the HTML template
    const template = `
        <div class="calc-booking-form">
            <form id="calcForm">
                <div class="calc-form-group">
                    <label for="pickup">Pick-up Location</label>
                    <div class="calc-autocomplete-container">
                        <input type="text" id="pickup" class="calc-address-input" required autocomplete="off">
                        <div class="calc-autocomplete-items"></div>
                    </div>
                </div>
                <div class="calc-form-group">
                    <label for="dropoff">Drop-off Location</label>
                    <div class="calc-autocomplete-container">
                        <input type="text" id="dropoff" class="calc-address-input" required autocomplete="off">
                        <div class="calc-autocomplete-items"></div>
                    </div>
                </div>

                <div class="calc-price-display">
                    <p>Estimated Total: <span id="calcPrice">$0.00</span></p>
                </div>
                <button type="submit" class="calc-btn">Reserve Now</button>
            </form>
        </div>
    `;

    // Add Google Fonts
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Add scoped CSS
    const style = document.createElement('style');
    style.textContent = `
        #price-calculator .calc-booking-form {
            background: #fff;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            font-family: 'Montserrat', sans-serif;
            max-width: 500px;
            margin: 0 auto;
        }
        #price-calculator .calc-form-group {
            margin-bottom: 1rem;
            width: 250px;
            height: 50px;
        }
        #price-calculator .calc-form-group {
            margin-bottom: 1rem;
        }
        #price-calculator .calc-form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: bold;
            color: #333;
        }
        #price-calculator .calc-address-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
        }


        #price-calculator .calc-form-group {
            margin-bottom: 1rem;
        }

        #price-calculator .calc-autocomplete-container {
            position: relative;
            width: 100%;
        }
        #price-calculator .calc-autocomplete-items {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            max-height: 200px;
            overflow-y: auto;
            background-color: #fff;
            border-top: none;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0);
            z-index: 1000;
        }
        #price-calculator .calc-autocomplete-items div {
            padding: 0.5rem;
            cursor: pointer;
            background-color: #fff;
            border-bottom: 1px solid #d4d4d4;
            color: #333;
            display: block;
        }
        #price-calculator .calc-autocomplete-items div:hover {
            background-color: #e9e9e9;
        }

        #price-calculator .calc-price-display {
            text-align: center;
            margin: 0.6rem 0;
            color: #333;
        }
        #price-calculator .calc-btn {
            width: 100%;
            padding: 0.75rem;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
        }
        #price-calculator .calc-btn:hover {
            background-color: #218838;
        }
            
    `;
    document.head.appendChild(style);

    // Find and populate the container
    const container = document.getElementById('price-calculator');
    if (!container) {
        console.error('Price calculator container not found');
        return;
    }
    container.innerHTML = template;

    // Select elements and attach functionality
    const calcPickup = document.getElementById('pickup');
    const calcDropoff = document.getElementById('dropoff');
    const calcPrice = document.getElementById('calcPrice');
    const calcForm = document.getElementById('calcForm');

    let calcDistance = 0;

    async function calcGetCoordinates(address) {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=us,ca`);
        const data = await response.json();
        if (data.length > 0) {
            return {
                lat: data[0].lat,
                lon: data[0].lon,
                display_name: data[0].display_name
            };
        }
        throw new Error('Address not found');
    }

    function calcAutocomplete(inp) {
        let currentFocus;
        
        async function fetchSuggestions(val) {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&countrycodes=us,ca`);
            const data = await response.json();
            return data.slice(0, 5).map(item => ({
                display: item.display_name,
                city: item.address.city || item.address.town || item.address.village || '',
                state: item.address.state || ''
            }));
        }

        inp.addEventListener('input', debounce(async function(e) {
            const val = this.value;
            closeAllLists();
            if (!val) return;

            const items = await fetchSuggestions(val);
            const container = this.parentNode.querySelector('.calc-autocomplete-items');
            container.innerHTML = '';

            items.forEach(item => {
                const div = document.createElement('div');
                div.innerHTML = `${item.display}`;
                div.addEventListener('click', function() {
                    inp.value = item.display;
                    closeAllLists();
                });
                container.appendChild(div);
            });
        }, 300));

        function closeAllLists() {
            document.querySelectorAll('.calc-autocomplete-items').forEach(item => item.innerHTML = '');
        }
    }

    async function calcCalculatePrice() {
        const ratePerMile = 2.50;
        const basePrice = 20.00;
        const ratePerMinute = 1.20;

        if (!calcPickup.value || !calcDropoff.value) return;

        try {
            const pickupCoords = await calcGetCoordinates(calcPickup.value);
            const dropoffCoords = await calcGetCoordinates(calcDropoff.value);

            const response = await fetch(`http://router.project-osrm.org/route/v1/driving/${pickupCoords.lon},${pickupCoords.lat};${dropoffCoords.lon},${dropoffCoords.lat}?overview=false`);
            const data = await response.json();

            if (data.routes.length > 0) {
                calcDistance = data.routes[0].distance / 1609.34;
                const durationMinutes = data.routes[0].duration / 60;
                const total = (basePrice + (calcDistance * ratePerMile) + (durationMinutes * ratePerMinute)).toFixed(2);
                calcPrice.textContent = `$${total}`;
            } else {
                throw new Error('Route not found');
            }
        } catch (error) {
            console.error('Error:', error);
            calcPrice.textContent = '$0.00';
            alert(`Error: ${error.message}`);
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Attach event listeners
    const debouncedCalc = debounce(calcCalculatePrice, 300);
    calcPickup.addEventListener('input', debouncedCalc);
    calcDropoff.addEventListener('input', debouncedCalc);

    calcForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Booking confirmed - check your email for details');
    });



    // Initialize
    calcCalculatePrice();
    calcAutocomplete(calcPickup);
    calcAutocomplete(calcDropoff);
})();