import { Router } from "express";
import { IdentityController } from "../controller/identityController";

const router = Router();
const identityController = new IdentityController();

router.post("/identify", identityController.identify);

export default router;