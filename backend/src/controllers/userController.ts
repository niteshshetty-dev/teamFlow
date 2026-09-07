import type { Request, Response } from "express";
import User from "../models/User.js";

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      user,
    });
  } catch {
    res.status(500).json({
      message: "Server error",
    });
  }
};
