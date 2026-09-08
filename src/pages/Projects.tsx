import { useEffect, useState } from "react";
import api from "../services/api";

interface Project {
  _id: string;
  name: string;
  description: string;
}

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setError("");

        const response = await api.get("/api/projects");

        setProjects(response.data.projects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setError("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleCreateProject = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!name.trim() || !description.trim()) {
      setError("Project name and description are required.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await api.post("/api/projects", {
        name: name.trim(),
        description: description.trim(),
      });

      setProjects((currentProjects) => [
        response.data.project,
        ...currentProjects,
      ]);

      setName("");
      setDescription("");
    } catch (error) {
      console.error("Failed to create project:", error);
      setError("Failed to create project.");
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (project: Project) => {
    setEditingProject(project);
    setEditName(project.name);
    setEditDescription(project.description);
    setError("");
  };

  const cancelEditing = () => {
    setEditingProject(null);
    setEditName("");
    setEditDescription("");
  };

  const handleEditProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingProject) return;

    if (!editName.trim() || !editDescription.trim()) {
      setError("Project name and description are required.");
      return;
    }

    try {
      setUpdating(true);
      setError("");

      const response = await api.put(`/api/projects/${editingProject._id}`, {
        name: editName.trim(),
        description: editDescription.trim(),
      });

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project._id === editingProject._id ? response.data.project : project,
        ),
      );

      cancelEditing();
    } catch (error) {
      console.error("Failed to update project:", error);
      setError("Failed to update project.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/api/projects/${projectId}`);

      setProjects((currentProjects) =>
        currentProjects.filter((project) => project._id !== projectId),
      );

      if (editingProject?._id === projectId) {
        cancelEditing();
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      setError("Failed to delete project.");
    }
  };

  if (loading) {
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
      <div className="mb-8">
        <p className="mb-1 text-sm font-medium text-indigo-600">Workspace</p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Projects
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create and manage your team projects.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Create / Edit Project */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            {editingProject ? "Edit Project" : "Create New Project"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {editingProject
              ? "Update your project information."
              : "Set up a workspace for your team."}
          </p>
        </div>

        <form
          onSubmit={editingProject ? handleEditProject : handleCreateProject}
          className="space-y-5"
        >
          {/* Project Name */}
          <div>
            <label
              htmlFor="project-name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Project Name
            </label>

            <input
              id="project-name"
              type="text"
              placeholder="e.g. Website Redesign"
              value={editingProject ? editName : name}
              onChange={(event) =>
                editingProject
                  ? setEditName(event.target.value)
                  : setName(event.target.value)
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="project-description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="project-description"
              placeholder="Describe what this project is about..."
              value={editingProject ? editDescription : description}
              onChange={(event) =>
                editingProject
                  ? setEditDescription(event.target.value)
                  : setDescription(event.target.value)
              }
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={creating || updating}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating
                ? "Creating..."
                : updating
                ? "Saving..."
                : editingProject
                ? "Save Changes"
                : "Create Project"}
            </button>

            {editingProject && (
              <button
                type="button"
                onClick={cancelEditing}
                disabled={updating}
                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Project List Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Your Projects</h2>

        <p className="mt-1 text-sm text-slate-500">
          {projects.length} {projects.length === 1 ? "project" : "projects"} in
          your workspace
        </p>
      </div>

      {/* Projects */}
      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
            ▣
          </div>

          <h3 className="font-semibold text-slate-800">No projects yet</h3>

          <p className="mt-1 text-sm text-slate-500">
            Create your first project using the form above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project._id}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              {/* Card Header */}
              <div className="mb-5 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
                  {project.name.charAt(0).toUpperCase()}
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  Active
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  {project.name}
                </h3>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                  {project.description}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-2 border-t border-slate-100 pt-4">
                <button
                  onClick={() => startEditing(project)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteProject(project._id)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;
