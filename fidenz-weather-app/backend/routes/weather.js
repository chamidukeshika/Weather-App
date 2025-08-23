const express = require('express');
const weatherService = require('../services/weatherService');

const router = express.Router();

// Get weather data for all cities
router.get('/cities', async (req, res) => {
  try {
    const weatherData = await weatherService.getAllWeatherData();
    
    res.status(200).json({
      success: true,
      data: weatherData,
      count: weatherData.length,
      cached: true // This will be determined by the service
    });


  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data',
      message: error.message
    });
  }
});

// Get weather data for a specific city
router.get('/city/:cityId(\\d+)', async (req, res) => {
  try {
    const cityId = req.params.cityId;
    
    // Validate city ID
    if (!cityId || isNaN(cityId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid city ID provided'
      });
    }

    const weatherData = await weatherService.getCityWeatherData(cityId);
    
    res.status(200).json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    console.error(`Error fetching weather data for city ${req.params.cityId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch city weather data',
      message: error.message
    });
  }
});
// Get available city codes
router.get('/cities/codes', (req, res) => {
  try {
    const cityCodes = weatherService.getCityCodes();
    
    res.status(200).json({
      success: true,
      data: cityCodes,
      count: cityCodes.length
    });
  } catch (error) {
    console.error('Error fetching city codes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch city codes',
      message: error.message
    });
  }
});

// Get cache statistics (for debugging)
router.get('/cache/stats', (req, res) => {
  try {
    const stats = weatherService.getCacheStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cache statistics'
    });
  }
});

// Clear cache (for debugging/admin use)
router.delete('/cache', (req, res) => {
  try {
    weatherService.clearCache();
    
    res.status(200).json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

module.exports = router;