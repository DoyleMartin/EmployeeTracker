import express, { Request, Response } from 'express';
// import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';
import { QueryResult } from 'pg';

await connectToDb();

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// employee route
app.get('/api/employee', (_req: Request, res: Response): void => {
  pool.query('SELECT * FROM employee', (err: any, result: QueryResult): void => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json(result.rows);
    }
  })
});
// department route
app.get('/api/department', (_req: Request, res: Response): void => {
  pool.query('SELECT * FROM department', (err: any, result: QueryResult): void => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json(result.rows);
    }
  })
});
// roles route
app.get('/api/roles', (_req: Request, res: Response): void => {
  pool.query('SELECT * FROM roles', (err: any, result: QueryResult): void => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json(result.rows);
    }
  })
});



app.use((_req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




