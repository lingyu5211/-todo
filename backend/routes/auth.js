const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { JWT_SECRET } = require('../middleware/auth')

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
}

function userToResponse(user, token) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    email: user.email,
    motto: user.motto,
    avatar: user.avatar,
    totalFocusDays: user.totalFocusDays,
    consecutiveFocusDays: user.consecutiveFocusDays,
    token,
  }
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' })
    }
    const user = await User.findOne({ where: { username } })
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }
    const token = generateToken(user)
    res.json(userToResponse(user, token))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' })
    }
    const existing = await User.findOne({ where: { username } })
    if (existing) {
      return res.status(409).json({ error: '用户名已存在' })
    }
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({
      username,
      password: hashed,
      name: name || username,
      email: email || '',
    })
    const token = generateToken(user)
    res.status(201).json(userToResponse(user, token))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  res.json({ success: true })
})

module.exports = router
