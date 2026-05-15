const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/db');
const { OAuth2Client } = require('google-auth-library');

// We use the client ID from environment variables or a placeholder for development
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id || user.user_id || user.USER_ID,
            role: user.role || user.ROLE,
            center_id: user.center_id || user.CENTER_ID || null
        },
        process.env.JWT_SECRET || 'supersecretkey_arogyawatch_2026',
        { expiresIn: '1d' }
    );
};

// 1. Traditional Registration (with Dynamic Fields)
exports.register = async (req, res) => {
    console.log('Registration request received:', req.body);
    try {
        const { full_name, email, mobile_number, username, password, role, center_name, designation, employee_id, joining_date, organization_name } = req.body;

        if (!full_name || !email || !password || !role) {
            return res.status(400).json({ message: 'Missing required basic fields.' });
        }

        // Logic check matching DB constraints
        if (role === 'STAFF' && !center_name) {
            return res.status(400).json({ message: 'Center is required for PHC Staff.' });
        }
        if (role === 'ADMIN' && center_name) {
            return res.status(400).json({ message: 'Admins cannot be assigned to a specific center.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Use email as username if username is blank
        const finalUsername = username || email.split('@')[0];

        // Ensure Admin center_id is null, for others map center_name to an ID (mocking mapping here)
        const centerId = role === 'ADMIN' ? null : (center_name === 'PHC_Dist_A' ? 1 : (center_name === 'PHC_Rural_B' ? 2 : null));

        const sql = `
            INSERT INTO users (full_name, email, mobile, username, password_hash, role, center_id, designation, employee_id, organization_name)
            VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10)
            RETURNING id INTO :11
        `;
        const binds = [full_name, email, mobile_number || null, finalUsername, hashedPassword, role, centerId, designation || null, employee_id || null, organization_name || null];
        binds.push({ type: require('oracledb').NUMBER, dir: require('oracledb').BIND_OUT });

        let newUserId;
        try {
            if (!process.env.DB_CONNECTION_STRING) {
                newUserId = Math.floor(Math.random() * 1000) + 1;
            } else {
                const result = await executeQuery(sql, binds);
                // For an 11-parameter array, the RETURNING value is at index 10
                newUserId = Array.isArray(result.outBinds) ? result.outBinds[10] : result.outBinds['11'];
                if (Array.isArray(newUserId)) newUserId = newUserId[0];
            }
        } catch (dbErr) {
            console.warn("Registration failed:", dbErr.message);
            throw dbErr;
        }

        const newUserResponse = {
            id: newUserId, username: finalUsername, full_name, email, role, center_id: centerId, designation
        };

        const token = generateToken(newUserResponse);
        res.status(201).json({ message: 'User registered successfully', token, user: newUserResponse });

    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Server error during registration: ' + err.message });
    }
};

// 2. Traditional Login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        let user;
        try {
            if (!process.env.DB_CONNECTION_STRING) {
                if (password && password.length > 3) {
                    user = {
                        id: Math.floor(Math.random() * 100),
                        username: username,
                        role: username.toLowerCase().includes('admin') ? 'ADMIN' : 'STAFF',
                        password_hash: await bcrypt.hash(password, 10),
                        full_name: 'Simulated User'
                    };
                }
            } else {
                const result = await executeQuery(`SELECT * FROM users WHERE username = :1 OR email = :2`, [username, username]);
                if (result.rows && result.rows.length > 0) {
                    user = result.rows[0];
                }
            }
        } catch (dbErr) {
            console.error("Login DB Error:", dbErr);
            return res.status(500).json({ message: 'Database error during login: ' + dbErr.message });
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.PASSWORD_HASH || user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);
        res.json({
            token,
            user: {
                id: user.id || user.user_id || user.USER_ID,
                username: user.username || user.USERNAME,
                role: user.role || user.ROLE,
                full_name: user.full_name || user.FULL_NAME,
                center_id: user.center_id || user.CENTER_ID
            }
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// 3. Google OAuth Login/Registration
exports.googleLogin = async (req, res) => {
    try {
        const { credential, role, center_name, designation, employee_id, organization_name } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const googleId = payload['sub'];
        const email = payload['email'];
        const name = payload['name'];

        let user;
        try {
            if (!process.env.DB_CONNECTION_STRING) {
                user = { id: 101, username: name, full_name: name, email, role: role || 'STAFF', google_id: googleId };
            } else {
                const result = await executeQuery(`SELECT * FROM users WHERE google_id = :1 OR email = :2`, [googleId, email]);
                if (result.rows && result.rows.length > 0) {
                    user = result.rows[0];
                } else {
                    const requestedRole = role || 'VIEWER';
                    const centerId = requestedRole === 'ADMIN' ? null : (center_name === 'PHC_Dist_A' ? 1 : 2);
                    const sql = `
                        INSERT INTO users (full_name, email, google_id, role, center_id, designation, employee_id, organization_name)
                        VALUES (:1, :2, :3, :4, :5, :6, :7, :8)
                        RETURNING id INTO :9
                     `;
                    const binds = [name, email, googleId, requestedRole, centerId, designation || null, employee_id || null, organization_name || null];
                    binds.push({ type: require('oracledb').NUMBER, dir: require('oracledb').BIND_OUT });
                    const insertResult = await executeQuery(sql, binds);
                    // For a 9-parameter array, the RETURNING value is at index 8
                    const newIdResult = Array.isArray(insertResult.outBinds) ? insertResult.outBinds[8] : insertResult.outBinds['9'];
                    const newId = Array.isArray(newIdResult) ? newIdResult[0] : newIdResult;
                    user = { id: newId, username: name, email, role: requestedRole, full_name: name };
                }
            }
        } catch (dbErr) {
            console.warn("Google Login failed:", dbErr.message);
            throw dbErr;
        }

        const token = generateToken(user);
        res.json({ token, user: { id: user.id || user.user_id || user.USER_ID, username: user.username || user.USERNAME, role: user.role || user.ROLE, email: user.email || user.EMAIL } });

    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(500).json({ message: 'Error authenticating with Google' });
    }
};
