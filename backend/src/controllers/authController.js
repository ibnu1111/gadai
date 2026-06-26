const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Login admin
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, nama: admin.nama },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin.id,
          nama: admin.nama,
          email: admin.email
        }
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// Register first admin (only if no admin exists)
exports.register = async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if any admin exists
    const adminCount = await prisma.admin.count();
    if (adminCount > 0) {
      return res.status(403).json({
        success: false,
        message: 'Registration is only allowed when no admin exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        nama,
        email,
        password: hashedPassword
      }
    });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, nama: admin.nama },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        token,
        admin: {
          id: admin.id,
          nama: admin.nama,
          email: admin.email
        }
      }
    });
  } catch (error) {
    console.error('Error during registration:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

// Get current admin profile
exports.getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.admin.id,
        email: req.admin.email,
        nama: req.admin.nama
      }
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ success: false, message: 'Failed to get profile' });
  }
};
