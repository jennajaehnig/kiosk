const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const ejs = require('ejs');

const app = express();
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.json())


const port = 3001;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'kiosk',
  password: '',
  port: 5432,
});

const credentials = {
  user: "postgres",
  host: "localhost",
  database: "kiosk",
  password: "",
  port: 5432,
};

async function registerStudent(student) {
  const text = `
    INSERT INTO students (first_name, last_name, check_in_time)
    VALUES ($1, $2, $3)
    RETURNING id
  `;
  const values = [student.first_name, student.last_name, student.check_in_time];
  return pool.query(text, values);
}

async function getStudent(studentId) {
  const text = `SELECT * FROM students WHERE id = $1`;
  const values = [studentId];
  return pool.query(text, values);
}
  
async function updateStudentName(studentId, first_name, last_name) {
  const text = `UPDATE students SET first_name = $2, last_name = $3, WHERE id = $1`;
  const values = [studentId, first_name, last_name];
  return pool.query(text, values);
}
  
async function removeStudent(studentId) {
  const text = `DELETE FROM students WHERE id = $1`;
  const values = [studentId];
  return pool.query(text, values);
}

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

app.get('/index', (req, res) => {
  pool.query('SELECT * FROM students', (error, results) => {
    if (error) {
      throw error;
    }
    const students = results.rows;
    res.render('index', { students });
  });
});

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/students', (req, res) => {
    registerStudent(req.body).then(data => res.json(data));
});

app.get('/students', (req, res) => {
    getStudent().then(data => res.json(data));
});

app.put('/students', (req, res) => {
    updateStudentName().then(data => res.json(data));
});

app.delete('/students', (req, res) => {
    removeStudent().then(data => res.json(data));
});

app.get('/table', (req, res) =>{
  pool.query('SELECT * FROM students ORDER BY check_in_time DESC', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
    } else {
      res.json(results.rows);
    }
  });
});

