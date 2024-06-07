import React from "react";
import io from 'socket.io-client';
import axios from "axios";
import { Navigate } from "react-router-dom";
import ProjectsSpace from "./ProjectsSpace";
import Header from "./Header";
import StageProjects from "./StageProjects";
import StageIformation from "./StageInformation";
import AddRoomFormDialog from "./AddRoomFormDalog";
import UserInProject from "./UsersInProject";


class TestHomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sessionStatus: null,
      redirectToLogin: false,
      user: localStorage.getItem('user'),
      projects: [],
      selectedName: '',
      selectedProject: false,
      userID: null,
      isConnected: false,
      users: [],
      roomCode: null,
      userPermissions: null,
      joinRoomCode: localStorage.getItem('roomCode') || '',
      projectName: null,
      stages: [],
      loading: true,
      currentProjectName: null,
    };
    this.socket = io('http://localhost:5000', {
      query: { token: localStorage.getItem('token') }, // Pass the token as a query parameter
      withCredentials: true
    });
    this.handleStageChange = this.handleStageChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    // Check if the roomCode state has changed
    console.log("Emitting fetch after update");
    if (this.state.roomCode !== prevState.roomCode) {
      // If the roomCode state has changed, emit the 'fetch-user-projects' event
      this.socket.emit('fetch-user-projects', { userID: this.state.userID });
    }
    console.log(this.state.projects);
  }

  componentDidMount() {
    const user = localStorage.getItem("user");
    this.socket.on('join', this.handleJoin);
    if (user) {
      this.setState({ field1Value: user });
    }


    const token = localStorage.getItem('token');
    this.socket = io('http://localhost:5000', {
      query: { token }, // Pass the token as a query parameter
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.setState({ isConnected: true });

      // Emit the 'user-id' event after the socket is connected
      this.socket.emit('user-id');

      const storedRoomCode = localStorage.getItem('roomCode');
      const storedUserID = localStorage.getItem('userID');
      console.log(storedRoomCode);
      console.log(storedUserID);
      if (storedRoomCode && storedUserID) {
        this.setState({ roomCode: storedRoomCode, userID: storedUserID }, () => {
          this.joinRoomWithCode(storedRoomCode);
        });
      }
    });

    this.socket.on('message', (message) => {
      console.log(message);
    });

    this.socket.on('user-joined', (data) => {
      console.log('Received user-joined event from server:', data);

      let parsedData;

      if (typeof data === 'object' && data !== null) {
        parsedData = data;
      } else {
        try {
          parsedData = JSON.parse(data);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          return;
        }
      }

      const user = parsedData.user;

      // Set the user's role based on their permissions level
      if (user.permissions === "1") {
        user.role = 'Teacher';
      } else if (user.permissions === "2") {
        user.role = 'Student';
      }

      console.log('Parsed user data:', user);

      this.setState(prevState => {
        if (!prevState.users.find(u => u.id === user.id)) {
          return { users: [...prevState.users, user] };
        } else {
          return prevState;
        }
      });
    });

    this.socket.on('user-id', (data) => {
      console.log('Received user ID from server:', data.userID);
      this.setState({ userID: data.userID, userPermissions: data.permissions }, () => {
        // Emit the 'fetch-user-projects' event after the state is updated
        this.socket.emit('fetch-user-projects', { userID: this.state.userID });
      });
      console.log('User permissions:', data.permissions);
    });

    this.socket.on('room-users', (data) => {
      console.log('Received room users and room code from server:', data.users, data.roomCode);
      this.setState({ users: data.users, roomCode: data.roomCode });
    });

    this.socket.on('room-created', (data) => {
      console.log('Received room code from server:', data.roomCode);
      this.setState({ roomCode: data.roomCode, joinRoomCode: data.roomCode }, () => {
        // Update the room code in local storage
        localStorage.setItem('roomCode', data.roomCode);
        // Automatically join the room after it is created
        this.joinRoom();
      });
    });

    this.socket.on('join', (data) => {
      console.log('Received join event from server:', data.roomCode, data.projectName);
      this.setState({ roomCode: data.roomCode, currentProjectName: data.projectName });
    });

    this.socket.on('join-response', (data) => {
      console.log('Received join-response event from server:', data.stages);
      this.setState({ stages: data.stages.map(stage => ({
          name: stage.stagename,
          weight: stage.weight,
          completed: stage.completed || false // Treat null as false
        })) });
    });

    this.socket.on('fetch-stages-response', (data) => {
      const stages = data.stages.map(stage => ({
        name: stage.stagename,
        weight: stage.weight,
        completed: stage.completed || false // Treat null as false
      }));
      this.setState({ stages: stages });
    });

    this.socket.on('set-project', (data) => {
      console.log('Received set-project event from server:', data.projectName);
      this.setState({ currentProjectName: data.projectName, stages: data.stages || [] });
    });

    this.socket.on('fetch-user-projects-response', (data) => {
      if (data.success) {
        // Map the projects data to the structure expected by ProjectsSpace
        const projects = data.projects.map(project => ({
          name: project.name,
          roomCode: project.roomCode,
          completeness: project.completeness
        }));
        // Check if the fetched projects are not empty
        if (projects.length > 0) {
          this.setState({ projects: projects, loading: false });
        } else {
          // Handle the case when the fetched projects are empty
          console.error('No projects found for the user');
          this.setState({ loading: false });
        }
      } else {
        console.error('Failed to fetch projects:', data.message);
        this.setState({ loading: false });
      }
    });

    // Set a timeout to automatically set the loading state to false after 5 seconds
    setTimeout(() => {
      this.setState({ loading: false });
    }, 5000);

    this.socket.on('disconnect', (message) => {
      console.log('Disconnected from server');
      this.setState({ isConnected: false });
    });

    window.onbeforeunload = () => {
      this.socket.disconnect();
    };
  }

  createRoom = () => {
    const token = localStorage.getItem('token');
    const projectName = this.state.projectName;

    if (this.socket) {
      console.log('Socket connected, emitting create-room event');
      this.socket.emit('create-room', { token, userID: this.state.userID, projectName });

      this.socket.on('room-created', (data) => {
        console.log('Received room code from server:', data.roomCode);
        this.setState({ roomCode: data.roomCode }, () => {
          // Automatically join the room after it is created
          this.joinRoom();
        });
      });

      this.socket.on('join-response', (data) => {
        console.log('Received join-response event from server:', data.stages);
        this.setState({ stages: data.stages.map(stage => ({
            name: stage.stagename,
            weight: stage.weight,
            completed: stage.completed
          })) });
      });

      this.socket.on('error', (data) => {
        console.log('Received error from server:', data.message);
        // Display the error message to the user
        alert(data.message);
      });
    }
  };

  joinRoom = () => {
    if (this.socket && this.state.joinRoomCode) {
      console.log('Socket connected, emitting join event');
      this.socket.emit('join', { userID: this.state.userID, roomCode: this.state.joinRoomCode });

      // Store the room code in local storage
      localStorage.setItem('roomCode', this.state.joinRoomCode);
      // Update the room code and connection status
      this.setState({ roomCode: this.state.joinRoomCode, isConnected: true });
      this.socket.emit('fetch-user-projects', { userID: this.state.userID });
      this.socket.emit('fetch-stages', localStorage.getItem('roomCode'));
      this.socket.emit('stages-updated');
      if(this.state.projects){
        this.setState({loading : false });
      }else {
        console.log('Loading...');
      }
    }
  };

  joinRoomWithCode = (roomCode) => {
    if (this.socket && this.state.joinRoomCode) {
      console.log('Socket connected, emitting join event');
      this.socket.emit('join', { userID: this.state.userID, roomCode });

      // Store the room code in local storage
      localStorage.setItem('roomCode', roomCode);
      this.setState({roomCode : roomCode});
      // Update the room code and connection status
      this.setState({ roomCode, isConnected: true }, () => {
        // Fetch the updated list of stages
        this.socket.emit('fetch-stages', { roomCode });
      });
      this.socket.emit('fetch-stages', { roomCode });
    }
  };

  calculateProjectProgress = () => {
    const totalWeight = this.state.stages.reduce((total, stage) => total + Number(stage.weight), 0);
    const completedWeight = this.state.stages.reduce((total, stage) => total + (stage.completed ? Number(stage.weight) : 0), 0);

    return (completedWeight / totalWeight) * 100;
  };

  calculateProjectProgressRoom = (roomCode) => {
    console.log(roomCode);
    // Emit a 'fetch-stages' event to the server with the room code
    this.socket.emit('fetch-stages', { roomCode });

    // Listen for the 'fetch-stages-response' event from the server
    this.socket.on('fetch-stages-response', (data) => {
      const stages = data.stages;

      // Calculate the project's completeness based on the stages
      const totalWeight = stages.reduce((total, stage) => total + Number(stage.weight), 0);
      const completedWeight = stages.reduce((total, stage) => total + (stage.completed ? Number(stage.weight) : 0), 0);
      console.log('Project completeness:', (completedWeight / totalWeight) * 100);
      return (completedWeight / totalWeight) * 100;
    });
  };

  submitStages = (stageName, stageImportance) => {
    console.log('Submitting stages socket event.');
    this.setState(prevState => {
      const stages = [...prevState.stages, { name: stageName, weight: stageImportance, completed: false }];
      return { stages };
    }, () => {
      // Emit the 'stages-updated' event to the server with the updated stages
      if (this.socket) {
        this.socket.emit('stages-updated', { roomCode: this.state.roomCode, stages: this.state.stages });
      }
    });
  };

  setProject = () => {
    if (this.socket && this.state.projectName) {
      const confirmChange = window.confirm('Changing the project will delete the current one. Are you sure you want to proceed?');
      if (!confirmChange) {
        return;
      }

      console.log('Socket connected, emitting delete-stages event');
      this.socket.emit('delete-stages', { roomCode: this.state.roomCode });

      console.log('Socket connected, emitting set-project event');
      const stagesToSend = this.state.stages || [];
      this.socket.emit('set-project', { roomCode: this.state.roomCode, projectName: this.state.projectName, stages: stagesToSend });
    }
  };

  componentWillUnmount() {
    // Remove the event listener for window.onbeforeunload
    window.onbeforeunload = null;
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.socket) {
      this.socket.off('join', this.handleJoin);
    }
  }
  handleJoin = (data) => {
    console.log('Received join event from server:', data.roomCode, data.projectName);
    this.setState({ roomCode: data.roomCode, currentProjectName: data.projectName });
  }

  handleSelectProject = (projectName) => {
    this.setState({ selectedName: projectName });
    this.setState({ selectedProject: true});
  };

  handleStageChange = (index) => {
    this.setState(prevState => {
      const stages = [...prevState.stages];
      stages[index].completed = !stages[index].completed;
      return { stages };
    });
  };

  handleAddStage = (name, weight) => {
    this.setState(prevState => {
      const stages = [...prevState.stages, { name, weight, completed: false }];
      return { stages };
    }, () => {
      // Emit the 'stages-updated' event to the server with the updated stages
      if (this.socket) {
        this.socket.emit('stages-updated', { roomCode: this.state.roomCode, stages: this.state.stages });
      }
    });
  };

  handleLogout = async (event) => {
    event.preventDefault();
    console.log("Submit logout request");
    const token = localStorage.getItem("token");
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      const response = await axios.post("http://localhost:5000/api/logout");
      console.log(response.data);
      // Проверяем статус ответа сервера
      if (response.status === 200) {
        console.log("Successfully logged out");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
      } else {
        // Обрабатываем другие статусы ответа сервера
        console.error("Error on logout request: ", response.data);
        alert("Произошла ошибка при выходе. Попробуйте снова.");
      }
    } catch (error) {
      console.error("Error on logout request: ", error);
      // Проверяем статус ответа сервера
      if (error.response && error.response.status === 401) {
        // Если статус 401, выводим сообщение об ошибке
        alert("Неудачная попытка выхода. Token = null");
      } else {
        // Другие ошибки сервера
        alert("Произошла ошибка при выходе. Попробуйте снова.");
      }
    }
  };

  handleCheckSession = async () => {
    const token = localStorage.getItem("token");
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      const response = await axios.get(
          "http://localhost:5000/api/check-session"
      );
      if (response.data.status === "active") {
        this.setState({ sessionStatus: "Активна" });
      } else {
        this.setState({ redirectToLogin: true });
      }
    } catch (error) {
      console.error("Error on session check request: ", error);
      this.setState({ redirectToLogin: true });
    }
  };

  handleSubmit = (inputValue) => {
    if (this.state.userPermissions <= 1) {
      // The user is creating a room
      this.setState({ projectName: inputValue }, this.createRoom);
    } else {
      // The user is joining a room
      this.setState({ joinRoomCode: inputValue }, this.joinRoom);
    }
  };

  handleAddEmptyStage = () => {
    this.setState(prevState => {
      const stages = [...prevState.stages, { name: '', weight: '', completed: false }];
      return { stages };
    });
  };

  render() {
    const { selectedName } = this.state;
    if (this.state.redirectToLogin) {
      return <Navigate to="/TestHomePage" replace />;
    }
    return (
        <div className="full-screen-container">
          <div className="home-container">
            <Header />
            <AddRoomFormDialog
                isOpen={this.state.open}
                onClose={this.handleClose}
                onSubmit={this.handleSubmit}
                userPermissions={this.state.userPermissions}
            />
            <ProjectsSpace
                onSelect={this.handleSelectProject}
                onSubmit={this.handleSubmit}
                userID={this.state.userID}
                userPermissions={this.state.userPermissions}
                projectName={this.state.currentProjectName}
                roomCode={this.state.roomCode}
                projectCompleteness={this.calculateProjectProgress()}
                calculateProjectProgress={this.calculateProjectProgressRoom}
                projects={this.state.projects}
                loading={this.state.loading}
                joinRoomWithCode={this.joinRoomWithCode}
            />
            <StageIformation selectedItem={selectedName} />
            <StageProjects
                nameProject={selectedName}
                selectedProject={this.state.selectedProject}
                projectCode={this.state.roomCode}
                stages={this.state.stages}
                users={this.state.users}
                onAddEmptyStage={this.handleAddEmptyStage}
                onStageChange={this.handleStageChange}
                onAddStage={this.handleAddStage}
                submitStages={this.submitStages}
            />
          </div>
        </div>
    );
  }
}

export default TestHomePage;
