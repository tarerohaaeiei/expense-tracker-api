const Expense = require('../models/Expense');

exports.getExpenses = async (req, res) => {
  const { startDate, endDate, category } = req.query;
  const query = { user: req.userId };

  if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  if (category) {
    query.category = category;
  }

  try {
    const expenses = await Expense.find(query);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};


exports.addExpense = async (req, res) => {
  const { title, amount, date, category, notes } = req.body;
  try {
    const expense = new Expense({
      title,
      amount,
      date,
      category,
      notes,
      user: req.userId,
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};


exports.updateExpense = async (req, res) => {
  const { title, amount, date, category, notes } = req.body;
  const expenseId = req.params.id; 
  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ msg: 'Expense not found' });

    if (title) expense.title = title;
    if (amount) expense.amount = amount;
    if (date) expense.date = date;
    if (category) expense.category = category;
    if (notes) expense.notes = notes;

    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};


exports.deleteExpense = async (req, res) => {
  const expenseId = req.params.id; 
  try {
    const expense = await Expense.findByIdAndDelete(expenseId);
    if (!expense) return res.status(404).json({ msg: 'Expense not found' });

    res.json({ msg: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
