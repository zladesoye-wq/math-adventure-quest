"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_1 = require("../controllers/studentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect); // All student routes are protected
router.post('/', studentController_1.createStudent);
router.get('/', studentController_1.getStudents);
router.put('/:id', studentController_1.updateStudent);
router.delete('/:id', studentController_1.deleteStudent);
exports.default = router;
//# sourceMappingURL=studentRoutes.js.map