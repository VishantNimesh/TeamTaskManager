const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { projectMember, projectAdmin } = require('../middleware/rbac');
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const {
  createTaskValidator,
  updateTaskValidator,
} = require('../validators/taskValidator');

// All routes require authentication
router.use(auth);

// Task routes under project
router.post(
  '/projects/:projectId/tasks',
  projectAdmin,
  createTaskValidator,
  createTask
);
router.get('/projects/:projectId/tasks', projectMember, getTasks);

// Standalone task routes (task ID only)
router.put('/tasks/:id', updateTaskValidator, updateTask);
router.delete('/tasks/:id', deleteTask);

module.exports = router;
