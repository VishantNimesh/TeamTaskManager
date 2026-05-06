import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
import Modal from '../components/Modal';
import { toast } from '../components/Toast';
import { getAvatarColor, getInitials } from '../components/Navbar';
import {
  HiPlus,
  HiOutlineFolderOpen,
  HiOutlineUsers,
  HiOutlineClipboardDocumentList,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineChartBar,
} from 'react-icons/hi2';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await projectAPI.getAll();
      setProjects(res.data.data.projects);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    setCreating(true);
    try {
      await projectAPI.create(createForm);
      toast.success('Project created!');
      setShowCreate(false);
      setCreateForm({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const totalProjects = projects.length;
  const totalTasks = projects.reduce((s, p) => s + (p.taskStats?.total || 0), 0);
  const doneTasks = projects.reduce((s, p) => s + (p.taskStats?.done || 0), 0);
  const inProgressTasks = projects.reduce((s, p) => s + (p.taskStats?.['in-progress'] || 0), 0);

  const getProgressPercent = (stats) => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.done / stats.total) * 100);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="dashboard-subtitle">
              Here's an overview of your team projects and tasks
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)} id="create-project-btn">
            <HiPlus size={18} />
            New Project
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card" id="stat-projects">
            <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.12)' }}>
              <HiOutlineFolderOpen size={22} color="#6366f1" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{totalProjects}</span>
              <span className="stat-label">Projects</span>
            </div>
          </div>
          <div className="stat-card" id="stat-tasks">
            <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>
              <HiOutlineClipboardDocumentList size={22} color="#3b82f6" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{totalTasks}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
          </div>
          <div className="stat-card" id="stat-in-progress">
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>
              <HiOutlineClock size={22} color="#f59e0b" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{inProgressTasks}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>
          <div className="stat-card" id="stat-done">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
              <HiOutlineCheckCircle size={22} color="#10b981" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{doneTasks}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>
              <HiOutlineChartBar size={20} />
              Your Projects
            </h2>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No projects yet</h3>
              <p>Create your first project to start managing tasks with your team.</p>
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                <HiPlus size={18} /> Create Project
              </button>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => {
                const progress = getProgressPercent(project.taskStats);
                const circumference = 2 * Math.PI * 18;
                const offset = circumference - (progress / 100) * circumference;

                return (
                  <div key={project._id} className="project-card card"
                    onClick={() => navigate(`/projects/${project._id}`)}
                    id={`project-card-${project._id}`}>
                    <div className="project-card-header">
                      <div>
                        <h3 className="project-card-name">{project.name}</h3>
                        <p className="project-card-desc">{project.description || 'No description'}</p>
                      </div>
                      <div className="progress-ring">
                        <svg width="48" height="48">
                          <circle className="progress-ring-bg" cx="24" cy="24" r="18" fill="none" strokeWidth="4" />
                          <circle className="progress-ring-fill" cx="24" cy="24" r="18" fill="none" strokeWidth="4"
                            strokeDasharray={circumference} strokeDashoffset={offset} />
                        </svg>
                        <span className="progress-ring-text">{progress}%</span>
                      </div>
                    </div>
                    <div className="project-card-stats">
                      <div className="mini-stat">
                        <span className="mini-stat-dot" style={{ background: 'var(--status-todo)' }}></span>
                        <span>{project.taskStats?.todo || 0}</span>
                      </div>
                      <div className="mini-stat">
                        <span className="mini-stat-dot" style={{ background: 'var(--status-in-progress)' }}></span>
                        <span>{project.taskStats?.['in-progress'] || 0}</span>
                      </div>
                      <div className="mini-stat">
                        <span className="mini-stat-dot" style={{ background: 'var(--status-review)' }}></span>
                        <span>{project.taskStats?.review || 0}</span>
                      </div>
                      <div className="mini-stat">
                        <span className="mini-stat-dot" style={{ background: 'var(--status-done)' }}></span>
                        <span>{project.taskStats?.done || 0}</span>
                      </div>
                    </div>
                    <div className="project-card-footer">
                      <div className="avatar-stack">
                        {project.members?.slice(0, 4).map((m, i) => (
                          <div key={i} className="avatar avatar-sm"
                            style={{ background: getAvatarColor(m.user?.name || 'U') }}
                            title={m.user?.name}>
                            {getInitials(m.user?.name || 'U')}
                          </div>
                        ))}
                        {project.members?.length > 4 && (
                          <div className="avatar avatar-sm" style={{ background: 'var(--surface-3)' }}>
                            +{project.members.length - 4}
                          </div>
                        )}
                      </div>
                      <div className="project-card-meta">
                        <HiOutlineUsers size={14} />
                        <span>{project.members?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Project"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={creating || !createForm.name.trim()} id="confirm-create-project">
            {creating ? 'Creating...' : 'Create Project'}
          </button>
        </>}>
        <form onSubmit={handleCreate} id="create-project-form">
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="form-input" placeholder="e.g. Website Redesign" value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} id="project-name-input" autoFocus />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Brief description of the project..." value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} id="project-desc-input" rows={3} />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
