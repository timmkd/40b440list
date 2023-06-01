import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  List,
  ListItem,
  Checkbox,
  IconButton,
  Card,
  ListItemDecorator,
  ListItemContent,
  Input,
  FormLabel,
  FormControl,
} from "@mui/joy";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Add } from "@mui/icons-material";

interface Task {
  text: string;
  completed: boolean;
  subTasks: SubTask[];
}

interface SubTask {
  text: string;
  completed: boolean;
}

function getTaskCount(tasks: Task[]) {
  let count: number = 0;
  tasks.forEach((task) => {
    // don't count if there are sub tasks
    if (task.subTasks.length) {
      task.subTasks.forEach((subtask) => count++);
    } else {
      count++;
    }
  });
  return count;
}

function getCompletedCount(tasks: Task[]) {
  let count: number = 0;
  tasks.forEach((task) => {
    // don't count if there are sub tasks
    if (task.subTasks.length) {
      task.subTasks.forEach((subtask) => subtask.completed && count++);
    } else {
      task.completed && count++;
    }
  });
  return count;
}

function TheList(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [completedCount, setCompletedCount] = useState(0);

  const handleAddTask = (): void => {
    if (taskInput.trim()) {
      setTasks([...tasks, { text: taskInput, completed: false, subTasks: [] }]);
      setTaskInput("");
    }
  };

  const handleEditTask = (
    index: number,
    isSubTask = false,
    parentIndex: number | null = null
  ): void => {
    const newText = prompt("Enter new task name");
    if (newText && newText.trim()) {
      const newTasks = [...tasks];
      if (isSubTask) {
        newTasks[parentIndex!].subTasks[index].text = newText;
      } else {
        newTasks[index].text = newText;
      }
      setTasks(newTasks);
    }
  };

  const handleDeleteTask = (
    index: number,
    isSubTask = false,
    parentIndex: number | null = null
  ): void => {
    const newTasks = [...tasks];
    if (isSubTask) {
      const subTask = newTasks[parentIndex!].subTasks[index];
      if (subTask.completed) {
        setCompletedCount(completedCount - 1);
      }
      newTasks[parentIndex!].subTasks.splice(index, 1);
    } else {
      if (newTasks[index].completed) {
        setCompletedCount(completedCount - 1);
      }
      newTasks.splice(index, 1);
    }
    setTasks(newTasks);
  };

  const handleAddSubTask = (index: number): void => {
    const subTaskText = prompt("Enter subtask name");
    if (subTaskText && subTaskText.trim()) {
      const newTasks = [...tasks];
      newTasks[index].subTasks.push({ text: subTaskText, completed: false });
      setTasks(newTasks);
    }
  };

  const handleToggleTask = (index: number): void => {
    const newTasks = [...tasks];
    const task = newTasks[index];
    task.completed = !task.completed;
    setTasks(newTasks);
  };

  const handleToggleSubTask = (parentIndex: number, index: number): void => {
    const newTasks = [...tasks];
    const subTask = newTasks[parentIndex].subTasks[index];
    subTask.completed = !subTask.completed;
    setTasks(newTasks);

    if (subTask.completed) {
      setCompletedCount(completedCount + 1);
    } else {
      setCompletedCount(completedCount - 1);
    }
  };

  // Export tasks as a JSON file
  const handleExportTasks = (): void => {
    const tasksData = JSON.stringify(tasks, null, 2);
    const blob = new Blob([tasksData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tasks.json";
    link.click();
  };
  // Import tasks from a JSON file
  const handleImportTasks = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const importedTasks = JSON.parse(e.target?.result as string) as Task[];
        setTasks(importedTasks);
      };
      reader.readAsText(file);
    }
  };

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks) as Task[]);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  return (
    <Container sx={{ marginBottom: "400px" }}>
      <Card
        sx={{
          p: 3,
          backgroundColor: "background.paper",
          position: "fixed",
          bottom: (theme) => theme.spacing(4),
          left: (theme) => theme.spacing(4),
          zIndex: 4,
        }}
      >
        <Typography level="h6" component="h2" gutterBottom>
          In list: {getTaskCount(tasks)}
        </Typography>
        <Typography level="h6" component="h2" gutterBottom>
          Completed tasks: {getCompletedCount(tasks)}
        </Typography>
      </Card>
      <Box sx={{ my: 4 }}>
        <Typography level="h4" component="h1" gutterBottom>
          To-Do List
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <FormControl>
            <FormLabel>Task</FormLabel>
            <Input
              // label="Task"
              value={taskInput}
              onChange={(e: {
                target: { value: React.SetStateAction<string> };
              }) => setTaskInput(e.target.value)}
              onKeyPress={(e: { key: string; preventDefault: () => void }) => {
                if (e.key === "Enter") {
                  handleAddTask();
                  e.preventDefault();
                }
              }}
            />
          </FormControl>
          <Button variant="soft" onClick={handleAddTask}>
            Add Task
          </Button>
        </Box>

        <List variant="outlined">
          {tasks.map((task, index) => (
            <>
              <ListItem key={index}>
                <ListItemDecorator>
                  <Checkbox
                    onChange={() => handleToggleTask(index)}
                    checked={task.completed}
                    disabled={task.subTasks.length > 0}
                    sx={{ mr: 2 }}
                  />
                </ListItemDecorator>
                <ListItemContent>{task.text}</ListItemContent>
                <IconButton
                  variant="plain"
                  aria-label="delete"
                  onClick={() => handleAddSubTask(index)}
                >
                  <Add />
                </IconButton>
                <IconButton
                  variant="plain"
                  aria-label="edit"
                  onClick={() => handleEditTask(index)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  variant="plain"
                  aria-label="delete"
                  onClick={() => handleDeleteTask(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
              {task.subTasks.map((subTask, subIndex) => (
                <ListItem key={subIndex} style={{ marginLeft: "2rem" }}>
                  <Checkbox
                    onChange={() => handleToggleSubTask(index, subIndex)}
                    checked={subTask.completed}
                    sx={{ mr: 2 }}
                  />
                  <ListItemContent>{subTask.text}</ListItemContent>
                  <IconButton
                    variant="plain"
                    aria-label="edit"
                    onClick={() => handleEditTask(subIndex, true, index)}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    variant="plain"
                    aria-label="delete"
                    onClick={() => handleDeleteTask(subIndex, true, index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </>
          ))}
        </List>
      </Box>
      <div>
        <Button variant="solid" onClick={handleExportTasks}>
          Export Tasks
        </Button>
        <input type="file" accept=".json" onChange={handleImportTasks} />
      </div>
    </Container>
  );
}

export default TheList;
