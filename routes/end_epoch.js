import express from 'express';
const router = express.Router();

router.post('/', (req, res) => {
  res.send('Ending epoch...');
});

export default router;
