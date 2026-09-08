import { useEffect, useState } from "react";
import api from "../services/api";

interface Project {
  _id: string;
  name: string;
  description: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "Todo" | "In Progress" | "Done";
  priority: "Low" | "Medium" | "High";
  project: string;
}

function Tasks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setError("");

        const response = await api.get("/api/projects");

        const projectList: Project[] = response.data.projects;

        setProjects(projectList);

        if (projectList.length > 0) {
          setSelectedProject(projectList[0]._id);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
        setError("Failed to load projects.");
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    if (!selectedProject) {
      setTasks([]);
      return;
    }

    const loadTasks = async () => {
      try {
        setLoadingTasks(true);
        setError("");

        const response = await api.get(
          `/api/tasks?projectId=${selectedProject}`,
        );

        setTasks(response.data.tasks);
      } catch (error) {
        console.error("Failed to load tasks:", error);
        setError("Failed to load tasks.");
      } finally {
        setLoadingTasks(false);
      }
    };

    loadTasks();
  }, [selectedProject]);

  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    if (!selectedProject) {
      setError("Please select a project.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await api.post("/api/tasks", {
        title: title.trim(),
        description: description.trim(),
        priority,
        projectId: selectedProject,
      });

      setTasks((currentTasks) => [response.data.task, ...currentTasks]);

      setTitle("");
      setDescription("");
      setPriority("Medium");
    } catch (error) {
      console.error("Failed to create task:", error);
      setError("Failed to create task.");
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    try {
      setError("");

      const response = await api.put(`/api/tasks/${taskId}`, {
        status,
      });

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task._id === taskId ? response.data.task : task,
        ),
      );
    } catch (error) {
      console.error("Failed to update task:", error);
      setError("Failed to update task.");
    }
  };

  const handlePriorityChange = async (
    taskId: string,
    priority: Task["priority"],
  ) => {
    try {
      setError("");

      const response = await api.put(`/api/tasks/${taskId}`, {
        priority,
      });

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task._id === taskId ? response.data.task : task,
        ),
      );
    } catch (error) {
      console.error("Failed to update priority:", error);
      setError("Failed to update priority.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/api/tasks/${taskId}`);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== taskId),
      );
    } catch (error) {
      console.error("Failed to delete task:", error);
      setError("Failed to delete task.");
    }
  };

  const selectedProjectName =
    projects.find((project) => project._id === selectedProject)?.name ||
    "Select a project";

  const todoCount = tasks.filter((task) => task.status === "Todo").length;

  const progressCount = tasks.filter((task) => task.status === "In Progress")
    .length;

  const doneCount = tasks.filter((task) => task.status === "Done").length;

  if (loadingProjects) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="text-sm text-slate-500">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-indigo-600">Workspace</p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Tasks
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Organize, prioritize and track your team's work.
          </p>
        </div>

        <div className="w-full lg:w-72">
          <label
            htmlFor="project-selector"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Current Project
          </label>

          <select
            id="project-selector"
            value={selectedProject}
            onChange={(event) => setSelectedProject(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Tasks</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {tasks.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Todo</p>

          <p className="mt-2 text-2xl font-bold text-slate-700">{todoCount}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">In Progress</p>

          <p className="mt-2 text-2xl font-bold text-amber-600">
            {progressCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Completed</p>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {doneCount}
          </p>
        </div>
      </div>

      {/* Create Task */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Create Task</h2>

          <p className="mt-1 text-sm text-slate-500">
            Add a new task to{" "}
            <span className="font-medium text-slate-700">
              {selectedProjectName}
            </span>
            .
          </p>
        </div>

        <form
          onSubmit={handleCreateTask}
          className="grid grid-cols-1 gap-5 lg:grid-cols-2"
        >
          <div className="lg:col-span-2">
            <label
              htmlFor="task-title"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Task Title
            </label>

            <input
              id="task-title"
              type="text"
              placeholder="e.g. Implement authentication flow"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="task-description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="task-description"
              rows={3}
              placeholder="Describe what needs to be completed..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="task-priority"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Priority
            </label>

            <select
              id="task-priority"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as Task["priority"])
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating || !selectedProject}
              className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Creating..." : "+ Create Task"}
            </button>
          </div>
        </form>
      </div>

      {/* Task List */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {selectedProjectName}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </p>
        </div>

        {loadingTasks ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

            <p className="text-sm text-slate-500">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
              ✓
            </div>

            <h3 className="font-semibold text-slate-800">No tasks yet</h3>

            <p className="mt-1 text-sm text-slate-500">
              Create your first task using the form above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900">
                        {task.title}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          task.priority === "High"
                            ? "bg-red-50 text-red-700"
                            : task.priority === "Medium"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>

                    <p className="max-w-3xl text-sm leading-6 text-slate-500">
                      {task.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={task.status}
                      onChange={(event) =>
                        handleStatusChange(
                          task._id,
                          event.target.value as Task["status"],
                        )
                      }
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold outline-none ${
                        task.status === "Done"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : task.status === "In Progress"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>

                    <select
                      value={task.priority}
                      onChange={(event) =>
                        handlePriorityChange(
                          task._id,
                          event.target.value as Task["priority"],
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:border-indigo-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>

                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tasks;
