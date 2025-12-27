import { Router } from "express";
import { getEmployees, 
    getEmployeeById, 
    createEmployee, 
    updateEmployee , 
    getEmployeeStats} from "../controllers/employee.controller.js";
const router = Router();

router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.post("/", createEmployee);
router.patch("/:id", updateEmployee);
router.get("/stats", getEmployeeStats);

export default router;