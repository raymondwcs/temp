const http = require('http'); 
const url = require('url');
const qs = require ('querystring');
const principal = 1000000;
const rate = 0.01;
const period = 10;
const compoundingFrequency = 10;

class SimpleInterests {
	constructor(p = principal,r = rate,t = period) { // default parameter values
		this.principal = p;
		this.rate = r;
		this.period = t;
		this.interests = this.principal * this.rate * this.period;
	}

	toString() {
		return(`Interests for $${this.principal} at an annual rate of \
${this.rate *100}% for ${this.period} years = $${this.interests}`);
	}
}

class CompoundInterests {
	constructor(p = principal, r = rate, t = period, n = compoundingFrequency) {
		this.principal = p;
		this.rate = r;
		this.period = t;
		this.frequency = n;
		this.interests = (
			this.principal * (1 + (this.rate / this.frequency))**(this.frequency * this.period)
		) - this.principal;
	}

	toString() {
		return(`Interests for $${this.principal} at an annual rate of \
${this.rate *100}% compounding frequency at ${this.frequency} for ${this.period} years = $${this.interests.toFixed(2)}`);
	}
}

// function handle_incoming_request(req,res) {
const handle_incoming_request = (req, res) => {
	let timestamp = new Date().toISOString();
    console.log(`Incoming request ${req.method}, ${req.url} received at ${timestamp}`);

	var parsedURL = url.parse(req.url,true); // true to get query as object 

	switch(parsedURL.pathname) {
        case '/':
            res.writeHead(200, {"Content-Type" : "text/html"});
			res.write('<html><head><title>Simple Interests</title></head>');
			res.write('<body><form action="/simpleinterests" method="post">');
			res.write('Principal: <input name="p" type="number" min="1" value="10000" /><br></br>');
			res.write('Rate: <input name="r" type="float" min="0" value="0.01"><br></br>');
			res.write('Year: <input name="t" type="number" min="1" value="10" /><br></br>');
			res.write('<br><input type="checkbox" name="format" value="json"> Result shown in JSON format</input>');
			res.write('<input type="submit" value="Calculate">');
			res.end('</form></body></html>');
			break;
		case '/simpleinterests':
		case '/compoundinterests':
			// extract query string parameters
			if (parsedURL.pathname == '/simpleinterests') {
				if (req.method == 'POST') {
					let data = '';  // message body data

					// process data in message body
					req.on('data', (payload) => {
					   data += payload;
					});

					req.on('end', () => {
						let postdata = qs.parse(data);
						var obj = new SimpleInterests(postdata.p, postdata.r,postdata.t); 
						if (postdata.format == 'json') {
							res.writeHead(200, {"Content-Type" : "text/json"}); 
							res.end(JSON.stringify(obj));
						} else {
							res.writeHead(200, {"Content-Type" : "text/html"});
							res.write('<html><h1>');
							res.write(obj.toString());
							res.end('</h1></html>');
						}
					});
				} else {  // GET request
					var obj = new SimpleInterests(parsedURL.query.p, parsedURL.query.r,parsedURL.query.t); 
					if (parsedURL.query.format == 'json') {
						res.writeHead(200, {"Content-Type" : "text/json"}); 
						res.end(JSON.stringify(obj));
					} else {
						res.writeHead(200, {"Content-Type" : "text/html"});
						res.write('<html><h1>');
						res.write(obj.toString());
						res.end('</h1></html>');
					}
				}
			} else {
				var obj = new CompoundInterests(parsedURL.query.p, parsedURL.query.r,parsedURL.query.t,parsedURL.query.n); 
				if (parsedURL.query.format == 'json') {
					res.writeHead(200, {"Content-Type" : "text/json"}); 
					res.end(JSON.stringify(obj));
				} else {
					res.writeHead(200, {"Content-Type" : "text/html"});
					res.write('<html><h1>');
					res.write(obj.toString());
					res.end('</h1></html>');
				}
			}
			break;
		default:
			res.writeHead(404, {"Content-Type": "text/html"});
			res.end(`<html><h1>Unkown Request: ${parsedURL.pathname}!</h1></html> `)
	}
}

const server = http.createServer(handle_incoming_request); 
server.listen(process.env.PORT || 8099);