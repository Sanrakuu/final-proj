import express from 'express';
import cors from 'cors';

import eggs from './routes/eggs.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use('/eggs', eggs);

app.get('/', (req, res) => {
  res.json().send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});