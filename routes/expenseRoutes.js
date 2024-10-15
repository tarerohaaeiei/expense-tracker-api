const express = require('express');
const { getExpenses, addExpense,updateExpense,deleteExpense } = require('../controllers/expenseController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', auth, getExpenses);
router.post('/', auth, addExpense);
router.patch('/:id', auth, updateExpense);
router.delete('/:id', auth, deleteExpense);

module.exports = router;
