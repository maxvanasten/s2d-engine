#!/usr/bin/env node

import Express from 'express';

const app = Express();
const port = process.env.PORT;

app.use(Express.static('public'));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});