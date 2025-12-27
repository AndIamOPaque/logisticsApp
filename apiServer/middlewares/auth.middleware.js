export const protectHardware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ 
      success: false, 
      errors: ['Unauthorized: API key missing.'] 
    });
  }

  if (apiKey !== process.env.SCANNER_API_KEY) {
    return res.status(401).json({ 
      success: false, 
      errors: ['Unauthorized: Invalid API key.'] 
    });
  }
  next();
};