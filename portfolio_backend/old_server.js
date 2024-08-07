const express = require('express');
const Pool = require('pg').Pool;
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = 3000;

const pool = new Pool({
	user: process.env.USER_NAME,
	host: process.env.HOST_NAME,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	dialect: process.env.DIALECT,
	port: process.env.PORT_NUMBER
});

pool.connect((err, client, release) => {
	if (err) {
		return console.error('Error in connection');
	}
	client.query('SELECT NOW()', (err) => {
		release();
		if (err) {
			return console.error('Error executing query');
		}
		console.log('Connected to database');
	});
});

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use('/static', express.static('static'))

app.use(express.urlencoded({extended: true}))
app.use(express.json());

app.get('/', async (req, res) => {
	res.render('index');
});

app.post('/addTodo', async (req, res) => {
	const { todo, date } = req.body;
	try {
		const result = await pool.query('INSERT INTO todo (todo, date) VALUES ($1, $2) RETURNING *', [
			todo,
			date
		]);
		console.log(result);
        res.redirect('/')
	// eslint-disable-next-line no-unused-vars
	} catch (error) {
		console.log('Error in adding todo');
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

// app.post('/api/users', async (req, res) => {
// 	const { firstName, lastName, email, password, phone } = req.body;
// 	try {
// 		const result = await pool.query(
// 			'INSERT INTO users (firstName, lastName, email, password, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
// 			[firstName, lastName, email, password, phone]
// 		);
// 		res.json(result.rows[0]);
// 	} catch (err) {
// 		console.error(err);
// 		res.status(500).send('Server Error');
// 	}
// });

// // Example route to get data from PostgreSQL
// app.get('/api/data', async (req, res) => {
// 	try {
// 		const result = await pool.query('SELECT * FROM my_table');
// 		res.json(result.rows);
// 	} catch (err) {
// 		console.error(err);
// 		res.status(500).send('Server Error');
// 	}
// });

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
