require('dotenv').config(); // Load environment variables from .env file

async function getBalance() {
    const url = 'https://api.flutterwave.com/v3/balances';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`, // Use your Flutterwave secret key
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Account balance:', data);
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}

// Example usage
getBalance();
