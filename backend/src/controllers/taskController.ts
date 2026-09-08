import type { Request, Response } from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";

export const createTask = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const { title, description, priority, projectId, assignedTo } = req.body;

    if (!title || !description || !projectId) {
      res.status(400).json({
        message: "Title, description and projectId are required",
      });
      return;
    }

    const project = await Project.findOne({
      _id: projectId,
      members: req.userId,
    });

    if (!project) {
      res.status(404).json({
        message: "Project not found or you are not a member",
      });
      return;
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || "Medium",
      project: projectId,
      assignedTo: assignedTo || undefined,
      createdBy: req.userId,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const { projectId } = req.query;

    if (!projectId || typeof projectId !== "string") {
      res.status(400).json({
        message: "projectId is required",
      });
      return;
    }

    const project = await Project.findOne({
      _id: projectId,
      members: req.userId,
    });

    if (!project) {
      res.status(404).json({
        message: "Project not found or you are not a member",
      });
      return;
    }

    const tasks = await Task.find({
      project: projectId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const { title, description, status, priority, assignedTo } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.userId,
    });

    if (!task) {
      res.status(404).json({
        message: "Task not found or you are not the creator",
      });
      return;
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    await task.save();

    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId,
    });

    if (!task) {
      res.status(404).json({
        message: "Task not found or you are not the creator",
      });
      return;
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
