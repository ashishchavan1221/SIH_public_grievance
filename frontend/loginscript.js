document.getElementById('loginForm').addEventListener('submit', function(event) {
    // Prevent the form from submitting normally
    event.preventDefault();

    // Get the values from the input fields
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Log the credentials to the console for demonstration
    console.log('Email:', email);
    console.log('Password:', password);

    // In a real application, you would send this data to a server
    // For example:
    // fetch('/api/login', {
    //     method: 'POST',
    //     body: JSON.stringify({ email, password }),
    //     headers: { 'Content-Type': 'application/json' }
    // })
    // .then(response => response.json())
    // .then(data => {
    //     if (data.success) {
    //         alert('Login successful!');
    //     } else {
    //         alert('Login failed. Please check your credentials.');
    //     }
    // });
});