import mongoose from 'mongoose';
import app from './app.mjs';
import config from '../config.mjs';

/*******************************************************************************
 * Database
 ******************************************************************************/

const uri = config.DATABASE_URI.replace(
  '<PASSWORD>',
  config.DATABASE_PASSWORD
).replace('<DATABASE>', config.DATABASE_NAME);

// const uri = config.LOCAL_DATABASE_URI;

mongoose.connect(uri).then(() => {
  console.log('Successfully connected to database...');
});

/*******************************************************************************
 * Server
 ******************************************************************************/

const port = config.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
