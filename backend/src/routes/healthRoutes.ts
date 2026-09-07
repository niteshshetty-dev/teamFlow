import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    message: "TeamFlow API is running",
  });
});

export default router;
