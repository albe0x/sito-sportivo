const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Secret key for cryptographic signing of Reference IDs
const SIGNING_SECRET = process.env.SIGNING_SECRET || 'sports_secret_2026';

// Helper function to generate unique reference ID signed by backend
function generateReferenceId(userName, date, hour, status) {
  // Take first 3 letters of username (alphanumeric, lowercase)
  const namePart = userName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 3) || 'usr';
  // Date format YYYYMMDD
  const datePart = date.replace(/-/g, '');
  // Start Hour
  const hourPart = hour.toString().padStart(2, '0');
  // Paid status identifier (p = paid, c = cash)
  const statusPart = status === 'paid' ? 'p' : 'c';

  const message = `${namePart}-${datePart}-${hourPart}-${statusPart}`;
  // Create HMAC signature using SHA256 and backend secret key
  const signature = crypto.createHmac('sha256', SIGNING_SECRET).update(message).digest('hex').substring(0, 6);

  return `${message}-${signature}`;
}

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/sports_booking'
});

// Retry logic to connect to the database and migrate schema
async function initDbConnection() {
  let retries = 5;
  while (retries) {
    try {
      await pool.query('SELECT 1');
      console.log('Successfully connected to the database.');
      
      // Dynamic migration: Ensure reference_id column exists
      await pool.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reference_id VARCHAR(100)');
      console.log('Database schema checked/updated successfully.');
      break;
    } catch (err) {
      console.error(`Database connection failed. Retries left: ${retries - 1}`, err);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}
initDbConnection();

// --- 2-Tier Authentication Middleware ---
// Admin Viewer key: viewer123
// Admin Manager key: admin123
function authenticateAdmin(req, res, next) {
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey) {
    return res.status(401).json({ error_en: 'Missing Admin Access Key', error_it: 'Chiave di Accesso Admin Mancante' });
  }

  if (adminKey === 'admin123') {
    req.adminRole = 'manager'; // Can view and alter
    next();
  } else if (adminKey === 'viewer123') {
    req.adminRole = 'viewer'; // Can only view
    next();
  } else {
    return res.status(403).json({ error_en: 'Invalid Admin Access Key', error_it: 'Chiave di Accesso Admin Non Valida' });
  }
}

function restrictToManager(req, res, next) {
  if (req.adminRole !== 'manager') {
    return res.status(403).json({ 
      error_en: 'Insufficient permissions. Level 2 (Manager) is required to alter the DB.', 
      error_it: 'Permessi insufficienti. Il livello 2 (Manager) è richiesto per modificare il DB.' 
    });
  }
  next();
}


// --- Public API ---

// 1. Get all sports areas
app.get('/api/areas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM areas ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server database error' });
  }
});

// 2. Get bookings for a specific date (to check availability)
app.get('/api/bookings', async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Date query parameter is required (YYYY-MM-DD)' });
  }

  try {
    const result = await pool.query(
      `SELECT id, area_id, start_hour, duration_hours FROM bookings 
       WHERE booking_date = $1 AND payment_status IN ('paid', 'cash')`,
      [date]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server database error' });
  }
});

// 3. Create a booking (Includes fake payment verification and cash options)
app.post('/api/bookings', async (req, res) => {
  const { area_id, user_name, user_email, booking_date, start_hour, duration_hours, payment_info, payment_method } = req.body;

  if (!area_id || !user_name || !user_email || !booking_date || !start_hour || !duration_hours) {
    return res.status(400).json({ 
      error_en: 'All fields are required', 
      error_it: 'Tutti i campi sono obbligatori' 
    });
  }

  try {
    // Check if the area exists
    const areaRes = await pool.query('SELECT * FROM areas WHERE id = $1', [area_id]);
    if (areaRes.rows.length === 0) {
      return res.status(404).json({ 
        error_en: 'Sports field not found', 
        error_it: 'Campo sportivo non trovato' 
      });
    }
    const area = areaRes.rows[0];

    // Check if slot is already taken
    const overlapRes = await pool.query(
      `SELECT * FROM bookings 
       WHERE area_id = $1 
         AND booking_date = $2 
         AND start_hour = $3 
         AND payment_status IN ('paid', 'cash')`,
      [area_id, booking_date, start_hour]
    );

    if (overlapRes.rows.length > 0) {
      return res.status(400).json({ 
        error_en: 'This timeslot has already been booked', 
        error_it: 'Questo orario è già stato prenotato' 
      });
    }

    let status = 'paid';

    if (payment_method === 'cash') {
      status = 'cash';
    } else {
      // Mock payment validation: cards ending in "0000" fail
      if (payment_info && payment_info.cardNumber && payment_info.cardNumber.endsWith('0000')) {
        return res.status(402).json({
          error_en: 'Payment declined. Card was rejected.',
          error_it: 'Pagamento rifiutato. Carta respinta.'
        });
      }
    }

    const total_paid = parseFloat(area.price_per_hour) * duration_hours;

    // Generate secure reference ID signed by backend
    const reference_id = generateReferenceId(user_name, booking_date, start_hour, status);

    // Insert booking
    const insertRes = await pool.query(
      `INSERT INTO bookings (area_id, user_name, user_email, booking_date, start_hour, duration_hours, total_paid, payment_status, reference_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [area_id, user_name, user_email, booking_date, start_hour, duration_hours, total_paid, status, reference_id]
    );

    const createdBooking = insertRes.rows[0] || {};
    const bookingReferenceId = createdBooking.reference_id || reference_id;

    res.status(201).json({
      success: true,
      message_en: payment_method === 'cash' 
        ? 'Booking confirmed! Please pay in cash at the venue.' 
        : 'Booking confirmed and payment simulated successfully!',
      message_it: payment_method === 'cash'
        ? 'Prenotazione confermata! Si prega di pagare in contanti sul posto.'
        : 'Prenotazione confermata e pagamento simulato con successo!',
      booking: { ...createdBooking, reference_id: bookingReferenceId },
      reference_id: bookingReferenceId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server database error' });
  }
});


// --- Admin API (Requires authentication via x-admin-key header) ---

// 1. Tier 1 & 2: Get all slots booked in the system and by who
app.get('/api/admin/bookings', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, a.name_en as area_name_en, a.name_it as area_name_it 
      FROM bookings b 
      JOIN areas a ON b.area_id = a.id 
      ORDER BY b.booking_date DESC, b.start_hour DESC
    `);
    res.json({
      role: req.adminRole,
      bookings: result.rows
    });
  } catch (err) {
    console.error(err);
    res.json({
      role: req.adminRole,
      bookings: [],
      error: 'Server database error'
    });
  }
});

// 2. Tier 2: Delete/Cancel a booking (Alters DB)
app.delete('/api/admin/bookings/:id', authenticateAdmin, restrictToManager, async (req, res) => {
  const { id } = req.params;
  try {
    const deleteRes = await pool.query('DELETE FROM bookings WHERE id = $1 RETURNING *', [id]);
    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ 
        error_en: 'Booking not found', 
        error_it: 'Prenotazione non trovata' 
      });
    }
    res.json({ 
      success: true, 
      message_en: 'Booking deleted successfully', 
      message_it: 'Prenotazione eliminata con successo' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server database error' });
  }
});

// 3. Tier 2: Create custom booking manually (Alters DB)
app.post('/api/admin/bookings', authenticateAdmin, restrictToManager, async (req, res) => {
  const { area_id, user_name, user_email, booking_date, start_hour, duration_hours, price } = req.body;

  if (!area_id || !user_name || !user_email || !booking_date || !start_hour) {
    return res.status(400).json({ error_en: 'Required fields missing', error_it: 'Campi obbligatori mancanti' });
  }

  try {
    // Check if slot is already taken
    const overlapRes = await pool.query(
      `SELECT * FROM bookings 
       WHERE area_id = $1 
         AND booking_date = $2 
         AND start_hour = $3 
         AND payment_status = 'paid'`,
      [area_id, booking_date, start_hour]
    );

    if (overlapRes.rows.length > 0) {
      return res.status(400).json({ 
        error_en: 'This timeslot has already been booked', 
        error_it: 'Questo orario è già stato prenotato' 
      });
    }

    let finalPrice = price;
    if (!finalPrice) {
      const areaRes = await pool.query('SELECT price_per_hour FROM areas WHERE id = $1', [area_id]);
      if (areaRes.rows.length === 0) {
        return res.status(404).json({ error_en: 'Field not found', error_it: 'Campo non trovato' });
      }
      finalPrice = parseFloat(areaRes.rows[0].price_per_hour) * (duration_hours || 1);
    }

    // Generate secure reference ID for manual booking (status is paid)
    const reference_id = generateReferenceId(user_name, booking_date, start_hour, 'paid');

    const insertRes = await pool.query(
      `INSERT INTO bookings (area_id, user_name, user_email, booking_date, start_hour, duration_hours, total_paid, payment_status, reference_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'paid', $8) RETURNING *`,
      [area_id, user_name, user_email, booking_date, start_hour, duration_hours || 1, finalPrice, reference_id]
    );

    const createdBooking = insertRes.rows[0] || {};
    const bookingReferenceId = createdBooking.reference_id || reference_id;

    res.status(201).json({ 
      success: true, 
      message_en: 'Booking added manually by Administrator', 
      message_it: 'Prenotazione aggiunta manualmente dall\'Amministratore', 
      booking: { ...createdBooking, reference_id: bookingReferenceId },
      reference_id: bookingReferenceId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server database error' });
  }
});

// 4. Tier 2: Update Field Price / Info (Alters DB)
app.put('/api/admin/areas/:id', authenticateAdmin, restrictToManager, async (req, res) => {
  const { id } = req.params;
  const { price_per_hour, name_en, name_it, description_en, description_it } = req.body;

  try {
    const checkRes = await pool.query('SELECT * FROM areas WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error_en: 'Area not found', error_it: 'Campo non trovato' });
    }

    const current = checkRes.rows[0];
    const newPrice = price_per_hour !== undefined ? price_per_hour : current.price_per_hour;
    const newNameEn = name_en || current.name_en;
    const newNameIt = name_it || current.name_it;
    const newDescEn = description_en || current.description_en;
    const newDescIt = description_it || current.description_it;

    const updateRes = await pool.query(
      `UPDATE areas 
       SET price_per_hour = $1, name_en = $2, name_it = $3, description_en = $4, description_it = $5
       WHERE id = $6 RETURNING *`,
      [newPrice, newNameEn, newNameIt, newDescEn, newDescIt, id]
    );

    res.json({
      success: true,
      message_en: 'Sports field updated successfully',
      message_it: 'Campo sportivo aggiornato con successo',
      area: updateRes.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server database error' });
  }
});

// 5. Tier 2: Reset Database Seed (Alters DB)
app.post('/api/admin/reset-db', authenticateAdmin, restrictToManager, async (req, res) => {
  try {
    // Delete existing bookings and recreate areas
    await pool.query('DELETE FROM bookings');
    await pool.query('DELETE FROM areas');
    
    await pool.query(`
      INSERT INTO areas (id, name_en, name_it, price_per_hour, color_theme, description_en, description_it)
      VALUES 
      ('football', 'Football Field', 'Campo da Calcio', 45.00, 'football', 'Professional 8-a-side artificial turf field with night floodlights.', 'Campo professionale in erba sintetica a 8 giocatori con fari notturni.'),
      ('tennis', 'Tennis Court', 'Campo da Tennis', 20.00, 'tennis', 'Premium clay court with wind shields and professional lines.', 'Campo in terra battuta di alta qualità con barriere antivento.'),
      ('beach-volley', 'Beach Volley Court', 'Campo da Beach Volley', 18.00, 'beach-volley', 'Fine white sand court, perfect for summer matches under the lights.', 'Campo in sabbia bianca finissima, perfetto per partite estive illuminate.'),
      ('basketball', 'Basketball Court', 'Campo da Basket', 15.00, 'basketball', 'Indoor polished hardwood court with adjustable hoops and official sizing.', 'Campo indoor in parquet lucido con canestri regolabili e misure ufficiali.')
    `);

    // Add today's date bookings
    const todayStr = new Date().toISOString().split('T')[0];
    
    const r1 = generateReferenceId('Marco Rossi', todayStr, 18, 'paid');
    const r2 = generateReferenceId('Luca Bianchi', todayStr, 19, 'paid');
    const r3 = generateReferenceId('Giovanni Verdi', todayStr, 10, 'paid');
    const r4 = generateReferenceId('Alice Neri', todayStr, 16, 'paid');
    const r5 = generateReferenceId('Davide Ferrari', todayStr, 14, 'paid');

    await pool.query(`
      INSERT INTO bookings (area_id, user_name, user_email, booking_date, start_hour, duration_hours, total_paid, payment_status, reference_id)
      VALUES
      ('football', 'Marco Rossi', 'marco.rossi@example.com', $1, 18, 1, 45.00, 'paid', $2),
      ('football', 'Luca Bianchi', 'luca.bianchi@example.com', $1, 19, 1, 45.00, 'paid', $3),
      ('tennis', 'Giovanni Verdi', 'giovanni.verdi@example.com', $1, 10, 1, 20.00, 'paid', $4),
      ('beach-volley', 'Alice Neri', 'alice.neri@example.com', $1, 16, 2, 36.00, 'paid', $5),
      ('basketball', 'Davide Ferrari', 'davide.ferrari@example.com', $1, 14, 1, 15.00, 'paid', $6)
    `, [todayStr, r1, r2, r3, r4, r5]);

    res.json({
      success: true,
      message_en: 'Database has been reset to defaults.',
      message_it: 'Il database è stato ripristinato ai valori predefiniti.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server database error during reset' });
  }
});

// 6. Admin Username & Password Authentication endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ 
      error_en: 'Username and password are required', 
      error_it: 'Username e password sono obbligatori' 
    });
  }

  if (username === 'admin' && password === 'admin123') {
    return res.json({ token: 'admin123', role: 'manager' });
  } else if (username === 'viewer' && password === 'viewer123') {
    return res.json({ token: 'viewer123', role: 'viewer' });
  }

  res.status(401).json({
    error_en: 'Invalid username or password',
    error_it: 'Username o password errati'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
