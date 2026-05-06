const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { projectMember, projectAdmin } = require('../middleware/rbac');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const {
  createProjectValidator,
  updateProjectValidator,
  addMemberValidator,
} = require('../validators/projectValidator');

// All routes require authentication
router.use(auth);

// Project CRUD
router.post('/', createProjectValidator, createProject);
router.get('/', getProjects);
router.get('/:id', projectMember, getProject);
router.put('/:id', projectAdmin, updateProjectValidator, updateProject);
router.delete('/:id', projectAdmin, deleteProject);

// Member management
router.post('/:id/members', projectAdmin, addMemberValidator, addMember);
router.delete('/:id/members/:userId', projectAdmin, removeMember);

module.exports = router;
