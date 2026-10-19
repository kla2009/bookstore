require('dotenv').config();

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const pool = require('./db.js');
const nodemailer = require('nodemailer');

// ==================== ENVIRONMENT CONFIGURATION ====================

const port = Number(process.env.PORT) || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is missing in .env');
}

// ==================== MIDDLEWARE ====================

app.use(cors());
app.use(express.json());

// ==================== EMAIL CONFIGURATION ====================

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error) => {
    if (error) {
        console.error('Email configuration error:', error.message);
    } else {
        console.log('Gmail server is ready');
    }
});

// ==================== JWT AUTHENTICATION ====================

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Access token required'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                message: 'Invalid or expired token'
            });
        }

        req.user = user;

        console.log('Authenticated user:', {
            id: user.id,
            email: user.email,
            role: user.role
        });

        next();
    });
}

// ==================== ROLE AUTHORIZATION ====================

function authorizeRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            console.log('Authorization denied:', {
                userRole: req.user ? req.user.role : undefined,
                allowedRoles
            });

            return res.status(403).json({
                message: 'Forbidden: You do not have permission'
            });
        }

        console.log('Authorization passed:', req.user.role);

        next();
    };
}

// ==================== GET ALL BOOKS ====================

app.get(
    '/api/books',
    authenticateToken,
    authorizeRole('viewer', 'editor', 'admin'),
    async (req, res) => {
        try {
            const [data] = await pool.query(
                'SELECT * FROM books'
            );

            res.status(200).json(data);
        } catch (err) {
            console.error(err.message);

            res.status(500).json({
                error: err.message
            });
        }
    }
);

// ==================== GET BOOK BY ID ====================

app.get(
    '/api/books/:id',
    authenticateToken,
    authorizeRole('viewer', 'editor', 'admin'),
    async (req, res) => {
        try {
            const [data] = await pool.query(
                'SELECT * FROM books WHERE id = ?',
                [req.params.id]
            );

            if (data.length === 0) {
                return res.status(404).json({
                    message: 'Book not found'
                });
            }

            res.status(200).json(data[0]);
        } catch (err) {
            console.error(err.message);

            res.status(500).json({
                error: err.message
            });
        }
    }
);

// ==================== ADD BOOK ====================

app.post(
    '/api/books',
    authenticateToken,
    authorizeRole('editor', 'admin'),
    async (req, res) => {
        try {
            const {
                title,
                author,
                price,
                stock,
                category
            } = req.body;

            const [result] = await pool.query(
                `INSERT INTO books
                (title, author, price, stock, category)
                VALUES (?, ?, ?, ?, ?)`,
                [title, author, price, stock, category]
            );

            res.status(201).json({
                message: 'Book added successfully',
                id: result.insertId
            });
        } catch (err) {
            console.error(err.message);

            res.status(500).json({
                error: err.message
            });
        }
    }
);

// ==================== UPDATE BOOK ====================

app.put(
    '/api/books/:id',
    authenticateToken,
    authorizeRole('editor', 'admin'),
    async (req, res) => {
        try {
            const {
                title,
                author,
                price,
                stock,
                category
            } = req.body;

            const [result] = await pool.query(
                `UPDATE books
                SET title = ?, author = ?, price = ?,
                    stock = ?, category = ?
                WHERE id = ?`,
                [
                    title,
                    author,
                    price,
                    stock,
                    category,
                    req.params.id
                ]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: 'Book not found'
                });
            }

            res.status(200).json({
                message: 'Book updated successfully'
            });
        } catch (err) {
            console.error(err.message);

            res.status(500).json({
                error: err.message
            });
        }
    }
);

// ==================== DELETE BOOK ====================

app.delete(
    '/api/books/:id',
    authenticateToken,
    authorizeRole('admin'),
    async (req, res) => {
        try {
            const [result] = await pool.query(
                'DELETE FROM books WHERE id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: 'Book not found'
                });
            }

            res.status(200).json({
                message: 'Book deleted successfully'
            });
        } catch (err) {
            console.error(err.message);

            res.status(500).json({
                error: err.message
            });
        }
    }
);

// ==================== REGISTER ====================

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'กรุณากรอก Name, Email และ Password'
            });
        }

        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: 'Email นี้ถูกใช้งานแล้ว'
            });
        }

        const verificationToken =
            Math.random().toString(36).substring(2) +
            Date.now().toString(36);

        const hashedPassword = await bcrypt.hash(password, 10);

        // ผู้ใช้ใหม่ใช้ role เริ่มต้นจากฐานข้อมูล
        await pool.query(
            `INSERT INTO users
            (name, email, password, verification_token)
            VALUES (?, ?, ?, ?)`,
            [
                name,
                email,
                hashedPassword,
                verificationToken
            ]
        );

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your email',
            html: `
                <h2>Email Verification</h2>
                <p>กรุณาคลิกลิงก์ด้านล่างเพื่อยืนยันอีเมล</p>
                <a href="http://localhost:${port}/api/verify?token=${verificationToken}">
                    Verify Email
                </a>
            `
        });

        res.status(201).json({
            message: 'สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี'
        });
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            error: err.message
        });
    }
});

// ==================== VERIFY EMAIL ====================

app.get('/api/verify', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                message: 'Verification token is required'
            });
        }

        const [users] = await pool.query(
            'SELECT id FROM users WHERE verification_token = ?',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({
                message: 'Invalid verification token'
            });
        }

        await pool.query(
            `UPDATE users
            SET is_verified = TRUE,
                verification_token = NULL
            WHERE id = ?`,
            [users[0].id]
        );

        res.status(200).json({
            message: 'Email verified successfully'
        });
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            error: err.message
        });
    }
});

// ==================== LOGIN WITH JWT ====================

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'กรุณากรอก Email และ Password'
            });
        }

        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: 'Email หรือ Password ไม่ถูกต้อง'
            });
        }

        const user = users[0];

        const match = await bcrypt.compare(
            password,
            user.password
        );

        if (!match) {
            return res.status(401).json({
                message: 'Email หรือ Password ไม่ถูกต้อง'
            });
        }

        if (!user.is_verified) {
            return res.status(403).json({
                message: 'กรุณายืนยัน Email ก่อน Login'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        res.status(200).json({
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            error: err.message
        });
    }
});

// ==================== USER PROFILE ====================

app.get(
    '/api/profile',
    authenticateToken,
    async (req, res) => {
        try {
            const [users] = await pool.query(
                `SELECT id, name, email
                FROM users
                WHERE id = ?`,
                [req.user.id]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            res.status(200).json(users[0]);
        } catch (err) {
            console.error(err.message);

            res.status(500).json({
                error: err.message
            });
        }
    }
);

// ==================== START SERVER ====================

app.listen(port, () => {
    console.log(`Server has started on port ${port}`);
});