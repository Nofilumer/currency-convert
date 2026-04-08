const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const apikey = process.env.FREECURRENCY_API_KEY;
    if (!apikey) return res.status(500).json({ error: 'FREECURRENCY_API_KEY not set' });

    const { base_currency, currencies } = req.query;
    const params = { apikey };
    if (base_currency) params.base_currency = base_currency;
    if (currencies) params.currencies = currencies;

    const resp = await axios.get('https://api.freecurrencyapi.com/v1/latest', { params });
    return res.status(resp.status).json(resp.data);
  } catch (err) {
    console.error(err.message || err);
    res.status(502).json({ error: 'Bad gateway', details: err.message });
  }
};
