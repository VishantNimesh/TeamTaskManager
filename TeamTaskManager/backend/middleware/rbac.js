const Project = require('../models/Project');

// Check if user is a member of the project (any role)
const projectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this project.',
      });
    }

    req.project = project;
    req.memberRole = member.role;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error checking project membership.',
    });
  }
};

// Check if user is an admin of the project
const projectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required for this action.',
      });
    }

    req.project = project;
    req.memberRole = member.role;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error checking admin access.',
    });
  }
};

module.exports = { projectMember, projectAdmin };
