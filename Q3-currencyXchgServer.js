const http = require('http');

const url = require('url');

const APIKEY='33fcd007be1394227b5bbab29cdfd4e2';       //**your API key***
const options = {
    host: 'apilayer.net',
    port: 80,
    path: `/api/live?access_key=${APIKEY}&currencies=AUD,CAD&source=USD&format=1`,
    method: 'GET'
};

var quotes = {};

const req = http.request(options, (res) => {
    res.on('data', (data) => {
        var jsonObj = JSON.parse(data); // convert from string to json object
        //console.log(jsonObj);
        if (res.statusCode == 200 && jsonObj.hasOwnProperty('quotes')) {
            quotes = jsonObj.quotes;
            console.log(quotes);
        } else {
            console.log(`Request failed. HTTP response code = ${res.statusCode}`);
        }
    });
});

req.on('error', (error) => {
    console.log(`Problem with request: ${error.message}`);
});

req.end();

const server = http.createServer((req, res) => {
	let timestamp = new Date().toISOString();
    console.log(`Incoming request ${req.method}, ${req.url} received at ${timestamp}`);

    var parsedURL = url.parse(req.url,true); // true to get query as object 

    switch(parsedURL.pathname) {
        case '/':
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('<html>');
            res.write('<form action="/convert">');
            res.write('Amount in USD:');
            res.write('<input type="number" name="amount" min="1" value="1">');
            res.write('<br>');
            res.write('Target currency: ');
            res.write('<select name="target">');
            res.write('<option value="USDAUD">AUD</option>');
            res.write('<option value="USDCAD">CAD</option>');
            res.write('</select>');
            res.write('<br><br>')
            res.write('<input type="submit" value="Convert">');
            res.write('</form>')
            res.end('</html>');
            break;
        case '/convert':
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('<html><h3>');
            res.write('<h3>')
            res.write(`USD ${parsedURL.query.amount} = ${parsedURL.query.target.substring(3,6)} ${parsedURL.query.amount * quotes[parsedURL.query.target]}`);
            res.write('</h3>');
            res.write('<a href="/">Try again</a>')
            res.end('</html>');
            break;
        default:
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end(`${parsedURL.pathname} - Unknown request!`);
    }
});

server.listen(process.env.PORT || 8099);