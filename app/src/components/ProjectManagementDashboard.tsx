import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  Comment as CommentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  AccountBalance as AccountBalanceIcon,
  Build as BuildIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  startDate: Date;
  endDate: Date;
  budget: number;
  actualCost: number;
  progress: number;
  description: string;
  team: string[];
  documents: Document[];
  tasks: Task[];
  milestones: Milestone[];
  comments: Comment[];
}

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadDate: Date;
}

interface Task {
  id: string;
  name: string;
  status: 'todo' | 'in-progress' | 'completed';
  assignedTo: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  description: string;
  dependencies: string[];
}

interface Milestone {
  id: string;
  name: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  description: string;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  attachments: string[];
}

const ProjectManagementDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'project' | 'task' | 'milestone' | 'document'>('project');
  const [newItem, setNewItem] = useState<any>({});

  // Mock data for demonstration
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Luxury Condo Development',
        status: 'in-progress',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        budget: 5000000,
        actualCost: 2500000,
        progress: 45,
        description: 'New luxury condominium development in downtown area',
        team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
        documents: [
          {
            id: '1',
            name: 'Building Permit',
            type: 'pdf',
            url: '/documents/permit.pdf',
            uploadedBy: 'John Doe',
            uploadDate: new Date('2024-01-15')
          }
        ],
        tasks: [
          {
            id: '1',
            name: 'Foundation Work',
            status: 'completed',
            assignedTo: 'Mike Johnson',
            dueDate: new Date('2024-02-15'),
            priority: 'high',
            description: 'Complete foundation and basement work',
            dependencies: []
          }
        ],
        milestones: [
          {
            id: '1',
            name: 'Ground Breaking',
            dueDate: new Date('2024-01-15'),
            status: 'completed',
            description: 'Official ground breaking ceremony'
          }
        ],
        comments: [
          {
            id: '1',
            text: 'Foundation work completed ahead of schedule',
            author: 'Mike Johnson',
            timestamp: new Date('2024-02-10'),
            attachments: []
          }
        ]
      }
    ];
    setProjects(mockProjects);
  }, []);

  const handleOpenDialog = (type: 'project' | 'task' | 'milestone' | 'document') => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewItem({});
  };

  const handleSaveItem = () => {
    // Implement save logic here
    handleCloseDialog();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'on-hold':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Project Management Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Project Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Projects Overview
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('project')}
              >
                New Project
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Budget</TableCell>
                    <TableCell>Actual Cost</TableCell>
                    <TableCell>Team Size</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={project.status}
                          color={getStatusColor(project.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={project.progress}
                            sx={{ flexGrow: 1 }}
                          />
                          <Typography variant="body2">
                            {project.progress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>${project.budget.toLocaleString()}</TableCell>
                      <TableCell>${project.actualCost.toLocaleString()}</TableCell>
                      <TableCell>{project.team.length}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => setSelectedProject(project)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Selected Project Details */}
        {selectedProject && (
          <>
            {/* Project Timeline */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Project Timeline
                </Typography>
                <Stepper orientation="vertical">
                  {selectedProject.milestones.map((milestone) => (
                    <Step key={milestone.id} active={milestone.status === 'in-progress'} completed={milestone.status === 'completed'}>
                      <StepLabel>
                        <Typography variant="subtitle1">{milestone.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Due: {milestone.dueDate.toLocaleDateString()}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2">{milestone.description}</Typography>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Paper>
            </Grid>

            {/* Tasks and Team */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Tasks
                </Typography>
                <List>
                  {selectedProject.tasks.map((task) => (
                    <ListItem key={task.id}>
                      <ListItemIcon>
                        <CheckCircleIcon color={task.status === 'completed' ? 'success' : 'action'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={task.name}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              Due: {task.dueDate.toLocaleDateString()}
                            </Typography>
                            <Chip
                              label={task.priority}
                              color={getPriorityColor(task.priority)}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('task')}
                  sx={{ mt: 2 }}
                >
                  Add Task
                </Button>
              </Paper>
            </Grid>

            {/* Documents */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Documents
                </Typography>
                <List>
                  {selectedProject.documents.map((doc) => (
                    <ListItem key={doc.id}>
                      <ListItemIcon>
                        <AttachFileIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.name}
                        secondary={`Uploaded by ${doc.uploadedBy} on ${doc.uploadDate.toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('document')}
                  sx={{ mt: 2 }}
                >
                  Upload Document
                </Button>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'project' && 'New Project'}
          {dialogType === 'task' && 'New Task'}
          {dialogType === 'milestone' && 'New Milestone'}
          {dialogType === 'document' && 'Upload Document'}
        </DialogTitle>
        <DialogContent>
          {/* Add form fields based on dialogType */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveItem} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectManagementDashboard; 