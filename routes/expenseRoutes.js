const express = require('express');
const { getExpenses, addExpense } = require('../controllers/expenseController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', auth, getExpenses);
router.post('/', auth, addExpense);

module.exports = router;
