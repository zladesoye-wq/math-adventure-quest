import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`[server]: Math Adventure Quest Backend running at http://0.0.0.0:${port}`);
});
