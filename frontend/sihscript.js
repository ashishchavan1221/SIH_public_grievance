document.addEventListener('DOMContentLoaded', (event) => {
    const registerForm = document.querySelector('.registerform');

    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevents the form from submitting normally

            // Get all input values
            const fullName = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email').value.trim();
            const adhar = document.getElementById('adhar').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('password').value.trim();

            // Simple validation to check if fields are not empty
            if (fullName === '' || email === '' || adhar === '' || phone === '' || password === '') {
                alert('Please fill out all fields.');
                return;
            }

            // You can add more specific validation here (e.g., email format, phone number length, etc.)
            // Example: Basic email format check
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Log the data to the console for demonstration
            console.log('Registration Data:');
            console.log('Name:', fullName);
            console.log('Email:', email);
            console.log('Aadhaar Number:', adhar);
            console.log('Phone Number:', phone);
            console.log('Password:', password);

            // In a real application, you would send this data to your backend server
            // for processing and user creation.
            // Example: Using the Fetch API
            /*
            fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullname: fullName,
                    email: email,
                    adhar: adhar,
                    phone: phone,
                    password: password
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Registration successful!');
                    // Redirect to the login page
                    window.location.href = 'login.html';
                } else {
                    alert('Registration failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred during registration.');
            });
            */
            alert('Form submitted successfully!');
            // Optional: You might want to redirect the user to another page after successful submission
            // window.location.href = 'login.html';
        });
    }
});