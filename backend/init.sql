-- Create areas table
CREATE TABLE IF NOT EXISTS areas (
    id VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_it VARCHAR(100) NOT NULL,
    price_per_hour DECIMAL(10, 2) NOT NULL,
    color_theme VARCHAR(50) NOT NULL, -- Theme identifier for CSS styling
    description_en TEXT NOT NULL,
    description_it TEXT NOT NULL
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    area_id VARCHAR(50) REFERENCES areas(id) ON DELETE CASCADE,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) NOT NULL,
    booking_date DATE NOT NULL,
    start_hour INTEGER NOT NULL, -- e.g., 9 for 09:00
    duration_hours INTEGER DEFAULT 1,
    total_paid DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'paid', -- paid, pending, cancelled
    reference_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial areas
INSERT INTO areas (id, name_en, name_it, price_per_hour, color_theme, description_en, description_it)
VALUES 
('football', 'Football Field', 'Campo da Calcio', 45.00, 'football', 'Professional 8-a-side artificial turf field with night floodlights.', 'Campo professionale in erba sintetica a 8 giocatori con fari notturni.'),
('tennis', 'Tennis Court', 'Campo da Tennis', 20.00, 'tennis', 'Premium clay court with wind shields and professional lines.', 'Campo in terra battuta di alta qualità con barriere antivento.'),
('beach-volley', 'Beach Volley Court', 'Campo da Beach Volley', 18.00, 'beach-volley', 'Fine white sand court, perfect for summer matches under the lights.', 'Campo in sabbia bianca finissima, perfetto per partite estive illuminate.'),
('basketball', 'Basketball Court', 'Campo da Basket', 15.00, 'basketball', 'Indoor polished hardwood court with adjustable hoops and official sizing.', 'Campo indoor in parquet lucido con canestri regolabili e misure ufficiali.')
ON CONFLICT (id) DO NOTHING;

-- Seed some bookings (using current date placeholders or hardcoded dates close to 2026-07-16)
INSERT INTO bookings (area_id, user_name, user_email, booking_date, start_hour, duration_hours, total_paid, payment_status)
VALUES
('football', 'Marco Rossi', 'marco.rossi@example.com', '2026-07-16', 18, 1, 45.00, 'paid'),
('football', 'Luca Bianchi', 'luca.bianchi@example.com', '2026-07-16', 19, 1, 45.00, 'paid'),
('tennis', 'Giovanni Verdi', 'giovanni.verdi@example.com', '2026-07-16', 10, 1, 20.00, 'paid'),
('beach-volley', 'Alice Neri', 'alice.neri@example.com', '2026-07-16', 16, 2, 36.00, 'paid'),
('basketball', 'Davide Ferrari', 'davide.ferrari@example.com', '2026-07-16', 14, 1, 15.00, 'paid')
ON CONFLICT DO NOTHING;
