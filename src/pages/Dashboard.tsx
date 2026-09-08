import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const projectsResponse = await api.get("/api/projects", config);

        const projectList: Project[] = projectsResponse.data.projects;

        setProjects(projectList);

        const taskResponses = await Promise.all(
          projectList.map((project) =>
            api.get(`/api/tasks?projectId=${project._id}`, config),
          ),
        );

        const allTasks: Task[] = taskResponses.flatMap(
          (response) => response.data.tasks,
        );

        setTasks(allTasks);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter((task) => task.status === "Done").length;

  const inProgressTasks = tasks.filter((task) => task.status === "In Progress")
    .length;

  const todoTasks = tasks.filter((task) => task.status === "Todo").length;

  const highPriorityTasks = tasks.filter((task) => task.priority === "High")
    .length;

  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-indigo-600">Overview</p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your projects and team progress.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/projects")}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            View Projects
          </button>

          <button
            onClick={() => navigate("/tasks")}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Projects */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  Total Projects
                </span>

                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-lg text-indigo-600">
                  ▣
                </span>
              </div>

              <p className="text-3xl font-bold text-slate-900">
                {projects.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">Active workspaces</p>
            </div>

            {/* Tasks */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  Total Tasks
                </span>

                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg text-blue-600">
                  ✓
                </span>
              </div>

              <p className="text-3xl font-bold text-slate-900">{totalTasks}</p>

              <p className="mt-1 text-xs text-slate-500">Across all projects</p>
            </div>

            {/* Completed */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  Completed
                </span>

                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-lg text-emerald-600">
                  ✓
                </span>
              </div>

              <p className="text-3xl font-bold text-slate-900">
                {completedTasks}
              </p>

              <p className="mt-1 text-xs text-slate-500">Tasks completed</p>
            </div>

            {/* In Progress */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  In Progress
                </span>

                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-lg text-amber-600">
                  ↻
                </span>
              </div>

              <p className="text-3xl font-bold text-slate-900">
                {inProgressTasks}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Tasks being worked on
              </p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Progress */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-1">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Task Progress
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Overall project completion
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[12px] border-slate-100">
                  <div
                    className="absolute inset-[-12px] rounded-full border-[12px] border-transparent"
                    style={{
                      borderTopColor: "#4f46e5",
                      transform: `rotate(${
                        completionPercentage * 1.8 - 45
                      }deg)`,
                    }}
                  />

                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {completionPercentage}%
                    </p>

                    <p className="text-[10px] text-slate-400">Complete</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                    <span className="text-slate-500">Todo</span>
                    <span className="font-semibold text-slate-800">
                      {todoTasks}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-500">In Progress</span>
                    <span className="font-semibold text-slate-800">
                      {inProgressTasks}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-500">Done</span>
                    <span className="font-semibold text-slate-800">
                      {completedTasks}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span className="text-slate-500">High Priority</span>
                    <span className="font-semibold text-slate-800">
                      {highPriorityTasks}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Recent Tasks
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest activity across your workspace
                  </p>
                </div>

                <button
                  onClick={() => navigate("/tasks")}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View all →
                </button>
              </div>

              {recentTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No tasks yet
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Create a task to start tracking work.
                  </p>

                  <button
                    onClick={() => navigate("/tasks")}
                    className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Create Task
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentTasks.map((task) => (
                    <div
                      key={task._id}
                      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {task.title}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {task.description}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            task.status === "Done"
                              ? "bg-emerald-50 text-emerald-700"
                              : task.status === "In Progress"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {task.status}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            task.priority === "High"
                              ? "bg-red-50 text-red-700"
                              : task.priority === "Medium"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Jump straight into your workspace.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={() => navigate("/projects")}
                className="group rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                <p className="font-semibold text-slate-800 group-hover:text-indigo-700">
                  + Create Project
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Start a new workspace for your team.
                </p>
              </button>

              <button
                onClick={() => navigate("/tasks")}
                className="group rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                <p className="font-semibold text-slate-800 group-hover:text-indigo-700">
                  + Create Task
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Add work and assign priorities.
                </p>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
