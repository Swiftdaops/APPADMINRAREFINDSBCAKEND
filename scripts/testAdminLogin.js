const axios = require('axios');
require('dotenv').config();

const API_URL = `http://localhost:${process.env.PORT || 5000}/api/admin`;

const testLogin = async () => {
    console.log('--- Testing Admin Login ---');
    console.log(`Attempting login for: ${process.env.DEFAULT_ADMIN_USERNAME}`);

    try {
        const response = await axios.post(`${API_URL}/login`, {
            username: process.env.DEFAULT_ADMIN_USERNAME,
            password: process.env.DEFAULT_ADMIN_PASSWORD
        });

        console.log('\n✅ Login Success!');
        console.log('User Data:', response.data);

        // Check for the Set-Cookie header
        const cookies = response.headers['set-cookie'];
        if (cookies) {
            console.log('\n🍪 Secure Cookie Received:');
            cookies.forEach(c => console.log(` - ${c.split(';')[0]}`));
            console.log('Auth system is working correctly.');
        } else {
            console.log('\n❌ No Cookie received. Check your cors/cookie settings.');
        }

    } catch (error) {
        console.log('\n❌ Login Failed');
        console.log(error.response ? error.response.data : error.message);
    }
};

testLogin();
