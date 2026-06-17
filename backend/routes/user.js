const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { authMiddleware } = require('../middleware/auth')

// GET /api/user/info
router.get('/info', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    })
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }
    res.json({
      name: user.name,
      email: user.email,
      motto: user.motto,
      avatar: user.avatar,
      totalFocusDays: user.totalFocusDays,
      consecutiveFocusDays: user.consecutiveFocusDays,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PATCH /api/user/info
router.patch('/info', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }
    const { name, email, motto, avatar } = req.body
    if (name !== undefined) user.name = name
    if (motto !== undefined) user.motto = motto
    if (avatar !== undefined) user.avatar = avatar
    await user.save()
    res.json({
      name: user.name,
      email: user.email,
      motto: user.motto,
      avatar: user.avatar,
      totalFocusDays: user.totalFocusDays,
      consecutiveFocusDays: user.consecutiveFocusDays,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
