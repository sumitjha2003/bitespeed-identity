import { Request, Response } from "express";
import { IdentityService } from "../services/identityService";

export class IdentityController {
  private identityService: IdentityService;

  constructor() {
    this.identityService = new IdentityService();
  }

  public identify = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, phoneNumber } = req.body;

      if (!email && !phoneNumber) {
        res.status(400).json({ error: "Either email or phoneNumber must be provided" });
        return;
      }

      const response = await this.identityService.identifyContact(
        email,
        phoneNumber
      );

      res.status(200).json(response);
    } catch (error) {
      console.error("Error in identify:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}