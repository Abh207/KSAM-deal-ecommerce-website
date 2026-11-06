import http from 'http';

http.get('http://localhost:5173/products.html', (res) => {
    console.log('HTTP status:', res.statusCode);
}).on('error', (err) => {
    console.error('Error connecting to dev server:', err.message);
});

