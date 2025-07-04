const express = require('express');
const router = express.Router();
const { getDashboardInfo } = require('../services/dashboard_services');

router.get('/dashboard', async (req, res) => {
    try {
        const dashboardData = await getDashboardInfo();
        res.status(200).json({
            status: 'success',
            data: dashboardData
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;