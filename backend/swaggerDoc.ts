//Auth Routes

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "03312502777"
 *               password:
 *                 type: string
 *                 example: "Test@123"
 *     responses:
 *       200:
 *         description: Successful login with token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Access is revoked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Access is revoked
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /auth/forgetPassword:
 *   post:
 *     summary: Request password reset link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset link sent
 *       404:
 *         description: Email not found
 */
 /**
 * @swagger
 * /applications:
 *   get:
 *     summary: Get list of applications
 *     description: Applications listing with pagination
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Applications listing fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     page_size:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       applicationNumber:
 *                         type: string
 *                       applicationStatus:
 *                         type: string
 *                       stepStatus:
 *                         type: object
 *                         properties:
 *                           step1:
 *                             type: string
 *                           step2:
 *                             type: string
 *                           step3:
 *                             type: string
 *                           step4:
 *                             type: string
 *                           step5:
 *                             type: string
 *                           step6:
 *                             type: string
 *                           step7:
 *                             type: string
 *                           step8:
 *                             type: string
 *                           step9:
 *                             type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       profileId:
 *                         type: string
 *                       appliedDate:
 *                         type: string
 *                         format: date-time
 *             example:
 *               success: true
 *               pagination:
 *                 total: 1
 *                 page: 1
 *                 page_size: 25
 *               data:
 *                 - _id: "691f43ec317c7f9993063002"
 *                   applicationNumber: "APP-20251125-364340"
 *                   applicationStatus: "in progress"
 *                   stepStatus:
 *                     step1: "completed"
 *                     step2: "in progress"
 *                     step3: "completed"
 *                     step4: "completed"
 *                     step5: "completed"
 *                     step6: "completed"
 *                     step7: "completed"
 *                     step8: "completed"
 *                     step9: "completed"
 *                   firstName: "Ch"
 *                   lastName: "Shan"
 *                   userId: "691f597e123d03c8fc06949e"
 *                   profileId: "691f59a5123d03c8fc069529"
 *                   appliedDate: "2025-11-25T17:45:20.431Z"
 */
/**
 * @swagger
 * /applications/{application_id}:
 *   get:
 *     summary: Get specific application by ID
 *     description: Get application details
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: application_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 applicantName:
 *                   type: string
 *                 status:
 *                   type: string
 */

/**
 * @swagger
 * /applications/getStep1/{application_id}:
 *   get:
 *     summary: Get Step 1 data of an application
 *     description: Step 1 form details
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: application_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Step 1 details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 age:
 *                   type: integer
 *                 gender:
 *                   type: string
 */
