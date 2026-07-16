import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  CreditCard, 
  Shield, 
  Globe, 
  Trash2, 
  PlusCircle, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Mail, 
  DollarSign, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  CheckSquare, 
  Layers 
} from 'lucide-react';

const getDateInputValue = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateDisplay = (value) => {
  if (!value) return '---';
  const text = String(value).trim();
  if (!text) return '---';

  const dashed = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dashed) {
    return `${dashed[3]}/${dashed[2]}/${dashed[1]}`;
  }

  const slashed = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashed) {
    return `${slashed[1]}/${slashed[2]}/${slashed[3]}`;
  }

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return `${String(parsed.getDate()).padStart(2, '0')}/${String(parsed.getMonth() + 1).padStart(2, '0')}/${parsed.getFullYear()}`;
  }

  return text;
};

const parseJsonResponse = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    return { error: text, parseError: true };
  }
};

const API_BASE = (() => {
  const configured = (import.meta.env.VITE_API_BASE || 'https://apigalluzzo.albe0x.com').trim();
  return configured.endsWith('/api') ? configured : `${configured.replace(/\/$/, '')}/api`;
})();

// Localization Dictionary
const t = {
  en: {
    title: 'SportCenter Portal',
    subtitle: 'Book your sports court and pay online instantly',
    customerView: 'Book a Field',
    adminView: 'Admin Panel',
    selectSport: 'Select a Sport',
    hourlyRate: 'Price',
    perHour: '/ hour',
    step1: '1. Select Date & Slot',
    step2: '2. Customer Details',
    step3: '3. Simulated Payment',
    selectedField: 'Selected Field',
    date: 'Booking Date',
    timeslot: 'Timeslot',
    totalPrice: 'Total Price',
    namePlaceholder: 'Enter your full name',
    emailPlaceholder: 'Enter your email address',
    cardNumPlaceholder: 'Card number (Ends in 0000 to trigger decline)',
    payButton: 'Confirm and Pay',
    successMsg: 'Booking confirmed and payment simulated successfully!',
    errorTitle: 'Error',
    adminLoginTitle: 'Administrator Authentication',
    adminLoginSubtitle: 'Enter your access key to unlock the booking management dashboard.',
    adminKeyLabel: 'Admin Access Key',
    adminKeyPlaceholder: 'viewer123 or admin123',
    adminLoginBtn: 'Authenticate',
    adminLogout: 'Logout',
    adminRole: 'Access Level',
    adminRoleViewer: 'Tier 1: Viewer (Read-only)',
    adminRoleManager: 'Tier 2: Manager (Full DB Alter Access)',
    adminBookingsTitle: 'All Bookings & Slots Taken',
    adminAlterDbTitle: 'Database Operations (Tier 2)',
    adminFieldRates: 'Update Court Rates',
    adminAvailability: 'Disable Days & Hours',
    adminManualBooking: 'Force Book Slot (Manual Entry)',
    adminResetDb: 'Reset Database to Default',
    adminResetConfirm: 'Reset Database',
    searchPlaceholder: 'Search by client name or email...',
    tableId: 'ID',
    tableClient: 'Client',
    tableSport: 'Court',
    tableDate: 'Date',
    tableTime: 'Time',
    tablePaid: 'Amount Paid',
    tableStatus: 'Status',
    tableAction: 'Actions',
    btnDelete: 'Cancel Booking',
    btnUpdateRate: 'Update',
    btnManualAdd: 'Add Booking',
    labelNewRate: 'New rate per hour (€)',
    labelSelectSport: 'Choose court',
    labelSelectTime: 'Start hour (8 to 22)',
    loading: 'Loading...',
    taken: 'Booked',
    available: 'Available',
    summaryBookings: 'Total Bookings',
    summaryRevenue: 'Total Revenue',
    todayBookings: "Today's Bookings",
    successDelete: 'Booking successfully canceled.',
    successRate: 'Court hourly rate updated.',
    successReset: 'Database reset to default seed data.',
    insufficientPerms: 'Manager (Tier 2) authentication key is required to alter database records.',
    paymentDeclined: 'Payment declined. Card was rejected.',
    fieldRequired: 'Please fill in all the details.'
  },
  it: {
    title: 'Portale SportCenter',
    subtitle: 'Prenota il tuo campo sportivo e paga online all\'istante',
    customerView: 'Prenota un Campo',
    adminView: 'Pannello Admin',
    selectSport: 'Seleziona uno Sport',
    hourlyRate: 'Prezzo',
    perHour: '/ ora',
    step1: '1. Scegli Data e Ora',
    step2: '2. Dati Cliente',
    step3: '3. Simulazione Pagamento',
    selectedField: 'Campo Selezionato',
    date: 'Data della Prenotazione',
    timeslot: 'Orario',
    totalPrice: 'Prezzo Totale',
    namePlaceholder: 'Inserisci il tuo nome completo',
    emailPlaceholder: 'Inserisci il tuo indirizzo email',
    cardNumPlaceholder: 'Numero carta (Finisce con 0000 per simulare rifiuto)',
    payButton: 'Conferma e Paga',
    successMsg: 'Prenotazione confermata e pagamento simulato con successo!',
    errorTitle: 'Errore',
    adminLoginTitle: 'Autenticazione Amministratore',
    adminLoginSubtitle: 'Inserisci la chiave di accesso per sbloccare il pannello di gestione.',
    adminKeyLabel: 'Chiave di Accesso Admin',
    adminKeyPlaceholder: 'viewer123 o admin123',
    adminLoginBtn: 'Autentica',
    adminLogout: 'Disconnetti',
    adminRole: 'Livello di Accesso',
    adminRoleViewer: 'Tier 1: Visualizzatore (Solo Lettura)',
    adminRoleManager: 'Tier 2: Gestore (Accesso Completo DB)',
    adminBookingsTitle: 'Tutti gli Slot Occupati',
    adminAlterDbTitle: 'Operazioni Database (Tier 2)',
    adminFieldRates: 'Modifica Tariffe Campi',
    adminAvailability: 'Disattiva Giorni e Orari',
    adminManualBooking: 'Prenotazione Manuale (Forzata)',
    adminResetDb: 'Ripristina Database',
    adminResetConfirm: 'Ripristina DB',
    searchPlaceholder: 'Cerca per nome cliente o email...',
    tableId: 'ID',
    tableClient: 'Cliente',
    tableSport: 'Campo',
    tableDate: 'Data',
    tableTime: 'Orario',
    tablePaid: 'Importo Pagato',
    tableStatus: 'Stato',
    tableAction: 'Azioni',
    btnDelete: 'Cancella Prenotazione',
    btnUpdateRate: 'Aggiorna',
    btnManualAdd: 'Aggiungi Prenotazione',
    labelNewRate: 'Nuovo prezzo orario (€)',
    labelSelectSport: 'Scegli campo',
    labelSelectTime: 'Ora d\'inizio (8 a 22)',
    loading: 'Caricamento...',
    taken: 'Occupato',
    available: 'Libero',
    summaryBookings: 'Prenotazioni Totali',
    summaryRevenue: 'Ricavi Totali',
    todayBookings: 'Prenotazioni di Oggi',
    successDelete: 'Prenotazione cancellata con successo.',
    successRate: 'Tariffa oraria del campo aggiornata.',
    successReset: 'Database ripristinato ai dati iniziali.',
    insufficientPerms: 'È richiesta la chiave Gestore (Tier 2) per modificare i dati nel database.',
    paymentDeclined: 'Pagamento rifiutato. La carta è stata respinta.',
    fieldRequired: 'Si prega di inserire tutti i dettagli.'
  }
};

const DEFAULT_AREAS = [
  { id: 'football', name_en: 'Football Field', name_it: 'Campo da Calcio', price_per_hour: 45.00, color_theme: 'football', description_en: 'Professional 8-a-side artificial turf field with night floodlights.', description_it: 'Campo professionale in erba sintetica a 8 giocatori con fari notturni.' },
  { id: 'tennis', name_en: 'Tennis Court', name_it: 'Campo da Tennis', price_per_hour: 20.00, color_theme: 'tennis', description_en: 'Premium clay court with wind shields and professional lines.', description_it: 'Campo in terra battuta di alta qualità con barriere antivento.' },
  { id: 'beach-volley', name_en: 'Beach Volley Court', name_it: 'Campo da Beach Volley', price_per_hour: 18.00, color_theme: 'beach-volley', description_en: 'Fine white sand court, perfect for summer matches under the lights.', description_it: 'Campo in sabbia bianca finissima, perfetto per partite estive illuminate.' },
  { id: 'basketball', name_en: 'Basketball Court', name_it: 'Campo da Basket', price_per_hour: 15.00, color_theme: 'basketball', description_en: 'Indoor polished hardwood court with adjustable hoops and official sizing.', description_it: 'Campo indoor in parquet lucido con canestri regolabili e misure ufficiali.' }
];

export default function App() {
  const [lang, setLang] = useState('it'); // default to Italian
  const [view, setView] = useState('customer'); // customer or admin
  const [areas, setAreas] = useState(DEFAULT_AREAS);
  const [selectedAreaId, setSelectedAreaId] = useState('football');
  
  // Booking States
  const [bookingDate, setBookingDate] = useState(() => getDateInputValue());
  const [takenSlots, setTakenSlots] = useState([]);
  const [selectedHour, setSelectedHour] = useState(null);
  
  // Customer details form
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'card'
  const [lastBookingSuccess, setLastBookingSuccess] = useState(null);

  // Admin States
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [currentAdminKey, setCurrentAdminKey] = useState(localStorage.getItem('admin_key') || '');
  const [adminRole, setAdminRole] = useState(null); // 'viewer' or 'manager'
  const [adminBookings, setAdminBookings] = useState([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [availabilityBlocks, setAvailabilityBlocks] = useState([]);
  const [availabilityFlags, setAvailabilityFlags] = useState({ blockedHours: [], dayBlocked: false });
  const [availabilityForm, setAvailabilityForm] = useState({
    area_id: 'football',
    block_date: getDateInputValue(),
    start_hour: 18,
    block_type: 'hour',
    reason: ''
  });
  
  // DB Alter Forms (Admin Tier 2)
  const [rateUpdates, setRateUpdates] = useState({});
  const [manualBooking, setManualBooking] = useState({
    area_id: 'football',
    user_name: '',
    user_email: '',
    booking_date: getDateInputValue(),
    start_hour: 18,
    duration_hours: 1
  });

  // Notifications Toast State
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const getT = (key) => t[lang][key] || key;

  // 1. Fetch Sports Areas on Mount
  useEffect(() => {
    fetch(`${API_BASE}/areas`)
      .then(res => parseJsonResponse(res))
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setAreas(data);
      })
      .catch(err => {
        console.warn('API /areas fallback to defaults:', err);
        setAreas(DEFAULT_AREAS);
      });
  }, []);

  // 2. Fetch taken slots and availability blocks when court or date changes
  useEffect(() => {
    if (!selectedAreaId || !bookingDate) {
      setTakenSlots([]);
      setAvailabilityFlags({ blockedHours: [], dayBlocked: false });
      return;
    }

    Promise.all([
      fetch(`${API_BASE}/bookings?date=${bookingDate}`),
      fetch(`${API_BASE}/availability?date=${bookingDate}&area_id=${selectedAreaId}`)
    ])
      .then(async ([bookingsRes, availabilityRes]) => {
        const bookingsData = await parseJsonResponse(bookingsRes);
        const availabilityData = await parseJsonResponse(availabilityRes);

        if (Array.isArray(bookingsData)) {
          const slots = bookingsData
            .filter(b => b.area_id === selectedAreaId)
            .map(b => b.start_hour);
          setTakenSlots(slots);
        } else {
          setTakenSlots([]);
        }

        if (availabilityData && typeof availabilityData === 'object') {
          setAvailabilityFlags({
            blockedHours: Array.isArray(availabilityData.blocked_hours) ? availabilityData.blocked_hours : [],
            dayBlocked: Boolean(availabilityData.day_blocked)
          });
        } else {
          setAvailabilityFlags({ blockedHours: [], dayBlocked: false });
        }
      })
      .catch(err => {
        console.warn('Could not fetch timeslot availability:', err);
        setTakenSlots([]);
        setAvailabilityFlags({ blockedHours: [], dayBlocked: false });
      });
  }, [selectedAreaId, bookingDate]);

  // 3. Admin Authentication Status Check
  useEffect(() => {
    if (!currentAdminKey) {
      setAdminRole(null);
      setAdminBookings([]);
      setAvailabilityBlocks([]);
      return;
    }

    const inferredRole = currentAdminKey === 'admin123'
      ? 'manager'
      : currentAdminKey === 'viewer123'
        ? 'viewer'
        : null;

    if (!inferredRole) {
      localStorage.removeItem('admin_key');
      setCurrentAdminKey('');
      setAdminRole(null);
      setAdminBookings([]);
      setAvailabilityBlocks([]);
      return;
    }

    setAdminRole(inferredRole);

    Promise.all([
      fetch(`${API_BASE}/admin/bookings`, { headers: { 'x-admin-key': currentAdminKey } }),
      fetch(`${API_BASE}/admin/availability`, { headers: { 'x-admin-key': currentAdminKey } })
    ])
      .then(async ([bookingsRes, availabilityRes]) => {
        const bookingsData = await parseJsonResponse(bookingsRes);
        const availabilityData = await parseJsonResponse(availabilityRes);
        setAdminRole(bookingsData?.role || inferredRole);
        setAdminBookings(bookingsData?.bookings || []);
        setAvailabilityBlocks(availabilityData?.blocks || []);
      })
      .catch(() => {
        setAdminBookings([]);
        setAvailabilityBlocks([]);
      });
  }, [currentAdminKey]);

  // Refresh admin data
  const refreshAdminData = async () => {
    if (!currentAdminKey) return;
    try {
      const res = await fetch(`${API_BASE}/admin/bookings`, {
        headers: { 'x-admin-key': currentAdminKey }
      });
      const data = await parseJsonResponse(res);
      setAdminBookings(data?.bookings || []);
      const blocksRes = await fetch(`${API_BASE}/admin/availability`, {
        headers: { 'x-admin-key': currentAdminKey }
      });
      const blocksData = await parseJsonResponse(blocksRes);
      setAvailabilityBlocks(blocksData?.blocks || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Customer Booking & Simulated Payment
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHour) {
      addToast('error', lang === 'it' ? 'Seleziona un orario prima di procedere.' : 'Please select an hour slot first.');
      return;
    }
    
    if (paymentMethod === 'card') {
      addToast('error', lang === 'it' ? 'Il pagamento con carta è temporaneamente disabilitato.' : 'Card payments are temporarily disabled.');
      return;
    }

    if (!custName || !custEmail) {
      addToast('error', getT('fieldRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area_id: selectedAreaId,
          user_name: custName,
          user_email: custEmail,
          booking_date: bookingDate,
          start_hour: selectedHour,
          duration_hours: 1,
          payment_method: paymentMethod
        })
      });

      const data = await parseJsonResponse(response);
      if (!response.ok) {
        throw new Error(lang === 'it' ? (data?.error_it || data?.error || 'Request failed') : (data?.error_en || data?.error || 'Request failed'));
      }

      addToast('success', lang === 'it' ? (data?.message_it || data?.message) : (data?.message_en || data?.message));
      const bookingPayload = data?.booking || {};
      setLastBookingSuccess({
        ...bookingPayload,
        reference_id: data?.reference_id || bookingPayload?.reference_id || ''
      });
      // Reset input form
      setCustName('');
      setCustEmail('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setSelectedHour(null);
      // Trigger takenSlots refetch
      setBookingDate(prev => prev);
    } catch (err) {
      addToast('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin Actions (Tier 2 Only)

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminUsername || !adminPassword) return;
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) {
        throw new Error(lang === 'it' ? (data?.error_it || data?.error || 'Request failed') : (data?.error_en || data?.error || 'Request failed'));
      }
      setCurrentAdminKey(data?.token);
      setAdminRole(data?.role || null);
      localStorage.setItem('admin_key', data?.token);
      setAdminUsername('');
      setAdminPassword('');
      addToast('success', lang === 'it' ? 'Autenticazione riuscita!' : 'Authentication successful!');
    } catch (err) {
      addToast('error', err.message);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_key');
    setCurrentAdminKey('');
    setAdminRole(null);
    setAdminBookings([]);
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm(lang === 'it' ? 'Confermi la cancellazione?' : 'Are you sure you want to cancel this booking?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': currentAdminKey }
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) {
        throw new Error(lang === 'it' ? (data?.error_it || data?.error || 'Request failed') : (data?.error_en || data?.error || 'Request failed'));
      }
      addToast('success', getT('successDelete'));
      refreshAdminData();
    } catch (err) {
      addToast('error', err.message);
    }
  };

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': currentAdminKey
        },
        body: JSON.stringify(availabilityForm)
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) {
        throw new Error(lang === 'it' ? (data?.error_it || data?.error || 'Request failed') : (data?.error_en || data?.error || 'Request failed'));
      }
      addToast('success', lang === 'it' ? 'Disponibilità aggiornata.' : 'Availability updated.');
      setAvailabilityForm({
        area_id: availabilityForm.area_id,
        block_date: availabilityForm.block_date,
        start_hour: 18,
        block_type: 'hour',
        reason: ''
      });
      refreshAdminData();
    } catch (err) {
      addToast('error', err.message);
    }
  };

  const handleDeleteAvailabilityBlock = async (id) => {
    if (!window.confirm(lang === 'it' ? 'Rimuovere questo blocco di disponibilità?' : 'Remove this availability block?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/availability/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': currentAdminKey }
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) {
        throw new Error(lang === 'it' ? (data?.error_it || data?.error || 'Request failed') : (data?.error_en || data?.error || 'Request failed'));
      }
      addToast('success', lang === 'it' ? 'Blocco rimosso.' : 'Block removed.');
      refreshAdminData();
    } catch (err) {
      addToast('error', err.message);
    }
  };

  const handleUpdatePrice = async (courtId) => {
    const price = rateUpdates[courtId];
    if (!price || isNaN(price)) {
      addToast('error', 'Enter a valid number');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/admin/areas/${courtId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': currentAdminKey
        },
        body: JSON.stringify({ price_per_hour: parseFloat(price) })
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) {
        throw new Error(lang === 'it' ? (data?.error_it || data?.error || 'Request failed') : (data?.error_en || data?.error || 'Request failed'));
      }
      addToast('success', getT('successRate'));
      // Update local court rates
      setAreas(prev => prev.map(a => a.id === courtId ? { ...a, price_per_hour: parseFloat(price) } : a));
      setRateUpdates(prev => ({ ...prev, [courtId]: '' }));
    } catch (err) {
      addToast('error', err.message);
    }
  };

  const handleManualBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': currentAdminKey
        },
        body: JSON.stringify(manualBooking)
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) {
        throw new Error(lang === 'it' ? (data?.error_it || data?.error || 'Request failed') : (data?.error_en || data?.error || 'Request failed'));
      }
      addToast('success', lang === 'it' ? 'Prenotazione manuale inserita!' : 'Manual booking added successfully!');
      setManualBooking({
        area_id: 'football',
        user_name: '',
        user_email: '',
        booking_date: getDateInputValue(),
        start_hour: 18,
        duration_hours: 1
      });
      refreshAdminData();
    } catch (err) {
      addToast('error', err.message);
    }
  };

  const handleResetDb = async () => {
    if (!window.confirm(lang === 'it' ? 'Questo cancellerà tutte le prenotazioni correnti e ripristinerà il DB. Procedere?' : 'This will clear all current bookings and reset the DB to initial default data. Proceed?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/reset-db`, {
        method: 'POST',
        headers: { 'x-admin-key': currentAdminKey }
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) {
        throw new Error(lang === 'it' ? (data?.error_it || data?.error || 'Request failed') : (data?.error_en || data?.error || 'Request failed'));
      }
      addToast('success', getT('successReset'));
      
      // Update local court data and table
      const areasRes = await fetch(`${API_BASE}/areas`);
      const areasData = await parseJsonResponse(areasRes);
      if (Array.isArray(areasData)) setAreas(areasData);
      
      refreshAdminData();
    } catch (err) {
      addToast('error', err.message);
    }
  };

  // Generate 8:00 to 22:00 timeslots
  const hourlySlots = Array.from({ length: 15 }, (_, i) => 8 + i);
  const selectedArea = areas.find(a => a.id === selectedAreaId) || DEFAULT_AREAS[0];
  const effectiveTakenSlots = Array.from(new Set([...takenSlots, ...availabilityFlags.blockedHours]));
  const availabilityDayBlocked = availabilityFlags.dayBlocked;

  // Admin filter search
  const filteredBookings = adminBookings.filter(b => {
    const search = adminSearch.toLowerCase();
    return b.user_name.toLowerCase().includes(search) || 
           b.user_email.toLowerCase().includes(search) ||
           b.area_id.toLowerCase().includes(search) ||
           b.booking_date.includes(search);
  });

  // Calculate statistics
  const totalRevenue = adminBookings.reduce((sum, b) => sum + parseFloat(b.total_paid || 0), 0);
  const todayStr = getDateInputValue();
  const todayBookingsCount = adminBookings.filter(b => {
    const bookingDateText = String(b.booking_date || '').substring(0, 10);
    return bookingDateText === todayStr;
  }).length;

  return (
    <div className="app-container min-h-screen flex flex-col px-4 max-w-7xl mx-auto">
      
      {/* 1. Header Area */}
      <header className="flex justify-between items-center py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-accent-glow">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              {getT('title')}
            </h1>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setLang('en')} 
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${lang === 'en' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('it')} 
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${lang === 'it' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              IT
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setView('customer')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${view === 'customer' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              {getT('customerView')}
            </button>
            <button 
              onClick={() => setView('admin')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${view === 'admin' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              {getT('adminView')}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Customer Booking View */}
      {view === 'customer' && (
        <main className="flex-grow py-8">
          {/* Hero Panel */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-400/10 rounded-full border border-indigo-400/20">
              {lang === 'it' ? 'Prenota Subito' : 'Book Now'}
            </span>
            <h2 className="text-3xl md:text-5xl font-black mt-3 mb-4 leading-tight tracking-tight">
              {lang === 'it' ? 'Gioca Nel Tuo Campo Preferito' : 'Play On Your Favorite Court'}
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              {getT('subtitle')}
            </p>
          </div>

          {/* 4 Sports Fields Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {areas.map(court => {
              const isActive = selectedAreaId === court.id;
              // Determine styles based on court id
              let glowStyle = 'before:bg-gray-500';
              let wrapperBg = 'bg-gray-500/10 text-gray-400';
              let activeShadow = '';

              if (court.id === 'football') {
                glowStyle = 'before:bg-football';
                wrapperBg = 'bg-football/10 text-football';
                activeShadow = isActive ? 'shadow-football-glow border-football/50 bg-cardHover' : '';
              } else if (court.id === 'tennis') {
                glowStyle = 'before:bg-tennis';
                wrapperBg = 'bg-tennis/10 text-tennis';
                activeShadow = isActive ? 'shadow-tennis-glow border-tennis/50 bg-cardHover' : '';
              } else if (court.id === 'beach-volley') {
                glowStyle = 'before:bg-beach-volley';
                wrapperBg = 'bg-beach-volley/10 text-beach-volley';
                activeShadow = isActive ? 'shadow-beach-volley-glow border-beach-volley/50 bg-cardHover' : '';
              } else if (court.id === 'basketball') {
                glowStyle = 'before:bg-basketball';
                wrapperBg = 'bg-basketball/10 text-basketball';
                activeShadow = isActive ? 'shadow-basketball-glow border-basketball/50 bg-cardHover' : '';
              }

              return (
                <div 
                  key={court.id}
                  onClick={() => {
                    setSelectedAreaId(court.id);
                    setSelectedHour(null);
                  }}
                  className={`glass glass-interactive p-6 flex flex-col relative overflow-hidden before:content-[""] before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:transition-all ${glowStyle} ${activeShadow}`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${wrapperBg}`}>
                      {court.id === 'football' && <Sparkles className="w-6 h-6" />}
                      {court.id === 'tennis' && <Sparkles className="w-6 h-6" />}
                      {court.id === 'beach-volley' && <Sparkles className="w-6 h-6" />}
                      {court.id === 'basketball' && <Sparkles className="w-6 h-6" />}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">€{court.price_per_hour}</div>
                      <div className="text-xs text-gray-400">{getT('perHour')}</div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {lang === 'it' ? court.name_it : court.name_en}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed flex-grow">
                    {lang === 'it' ? court.description_it : court.description_en}
                  </p>

                  <div className="mt-4 flex items-center justify-end gap-1 text-xs font-semibold text-indigo-400">
                    <span>{lang === 'it' ? 'Seleziona' : 'Select'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Booking Area Work Board */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            
            {/* Calendar & Timeslots (Left Pane) */}
            <div className="lg:col-span-7 glass p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg md:text-xl font-bold">{getT('step1')}</h3>
              </div>

              {/* Date Input Box */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <div className="w-full sm:w-auto">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {getT('date')}
                  </label>
                  <input 
                    type="date"
                    value={bookingDate}
                    min={getDateInputValue()}
                    onChange={(e) => {
                      setBookingDate(e.target.value);
                      setSelectedHour(null);
                    }}
                    className="w-full sm:w-60 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-2 sm:mt-6">
                  {lang === 'it' ? '* Gli slot occupati sono disabilitati' : '* Taken slots are crossed out'}
                </div>
              </div>

              {/* Grid of Hours */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {availabilityDayBlocked ? (
                  <div className="col-span-full rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                    {lang === 'it' ? 'Questa giornata è stata disattivata dall\'amministratore.' : 'This day has been disabled by the administrator.'}
                  </div>
                ) : hourlySlots.map(hour => {
                  const isTaken = effectiveTakenSlots.includes(hour);
                  const isSelected = selectedHour === hour;
                  const displayTime = `${hour.toString().padStart(2, '0')}:00`;

                  return (
                    <button
                      key={hour}
                      type="button"
                      disabled={isTaken}
                      onClick={() => setSelectedHour(hour)}
                      className={`py-3.5 px-2 rounded-xl text-center flex flex-col items-center gap-1.5 transition-all duration-200 border ${
                        isTaken 
                          ? 'bg-red-500/5 border-red-500/10 text-red-400/40 line-through cursor-not-allowed'
                          : isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-600/30 shadow-md transform -translate-y-0.5'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="font-semibold text-sm">{displayTime}</span>
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider ${
                        isTaken ? 'text-red-500' : isSelected ? 'text-white' : 'text-gray-400'
                      }`}>
                        {isTaken ? getT('taken') : isSelected ? 'OK' : getT('available')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Check-Out & Details Form (Right Pane) */}
            <div className="lg:col-span-5 glass p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-lg md:text-xl font-bold">{lang === 'it' ? '2. Dettagli & Pagamento' : '2. Checkout Details'}</h3>
              </div>

              {/* Booking Recap Summary Box */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-2.5 pb-2.5 border-b border-white/5">
                  <span>{getT('selectedField')}:</span>
                  <span className="font-bold text-white">
                    {lang === 'it' ? selectedArea.name_it : selectedArea.name_en}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400 mb-2.5 pb-2.5 border-b border-white/5">
                  <span>{getT('date')}:</span>
                  <span className="font-bold text-white">{bookingDate}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400 mb-2.5 pb-2.5 border-b border-white/5">
                  <span>{getT('timeslot')}:</span>
                  <span className="font-bold text-white">
                    {selectedHour ? `${selectedHour.toString().padStart(2, '0')}:00 - ${(selectedHour + 1).toString().padStart(2, '0')}:00` : '---'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-extrabold text-white">
                  <span>{getT('totalPrice')}:</span>
                  <span className="text-lg text-emerald-400">
                    €{selectedHour ? parseFloat(selectedArea.price_per_hour).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>

              {/* Inputs Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                    {lang === 'it' ? 'Nome Completo' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text"
                      required
                      placeholder={getT('namePlaceholder')}
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="email"
                      required
                      placeholder={getT('emailPlaceholder')}
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Simulated Payment Section */}
                <div className="pt-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                    {lang === 'it' ? 'Metodo di Pagamento' : 'Payment Method'}
                  </div>
                  
                  {/* Option Buttons: Cash / Card */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        paymentMethod === 'cash'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {lang === 'it' ? '💵 Paga in Contanti' : '💵 Pay in Cash'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        paymentMethod === 'card'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {lang === 'it' ? '💳 Paga con Carta' : '💳 Pay with Card'}
                    </button>
                  </div>

                  {paymentMethod === 'cash' ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl p-3.5 text-xs flex gap-2">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
                      <div>
                        {lang === 'it' 
                          ? 'Pagherai l\'importo direttamente in contanti alla reception dell\'impianto sportivo prima di iniziare a giocare.' 
                          : 'You will pay the amount directly in cash at the sports venue reception before you start playing.'}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Warning Notice: Card Payments Temporarily Out of Service */}
                      <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-3.5 text-xs flex gap-2">
                        <AlertTriangle className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
                        <div>
                          {lang === 'it' 
                            ? 'Attenzione: Il pagamento online con carta è temporaneamente disattivato per manutenzione. Seleziona "Paga in Contanti" per procedere.' 
                            : 'Notice: Online card payment is temporarily unavailable due to system maintenance. Please select "Pay in Cash" to proceed.'}
                        </div>
                      </div>

                      {/* Greyed out credit card fields */}
                      <div className="opacity-20 pointer-events-none select-none">
                        <input 
                          type="text"
                          disabled
                          placeholder={getT('cardNumPlaceholder')}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono mb-3"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input 
                            type="text"
                            disabled
                            placeholder="MM/YY"
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white text-center"
                          />
                          <input 
                            type="password"
                            disabled
                            placeholder="CVV"
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white text-center font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedHour || paymentMethod === 'card'}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 text-white py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 mt-6 shadow-lg shadow-indigo-900/40"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === 'it' ? 'Elaborazione...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {paymentMethod === 'card'
                          ? (lang === 'it' ? 'Metodo Non Disponibile' : 'Method Unavailable')
                          : (lang === 'it' ? 'Conferma e Prenota' : 'Confirm and Book')}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      )}

      {/* 3. Admin Authentication Login Gate */}
      {view === 'admin' && !adminRole && (
        <main className="flex-grow py-12 flex justify-center items-center">
          <div className="glass w-full max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-violet-500/10 text-violet-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-violet-500/20 shadow-accent-glow">
              <Shield className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-extrabold text-white mb-2">
              {getT('adminLoginTitle')}
            </h2>
            <p className="text-gray-400 text-xs mb-6 leading-relaxed">
              {getT('adminLoginSubtitle')}
            </p>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="text-left">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Username
                </label>
                <input 
                  type="text"
                  required
                  placeholder={lang === 'it' ? 'Inserisci username' : 'Enter username'}
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="text-left">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors font-mono"
                />
              </div>

              <div className="text-left bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-gray-400 space-y-1">
                <div className="font-bold text-white mb-1">💡 Demo Accounts (User / Pass):</div>
                <div>• <code className="text-violet-300">viewer</code> / <code className="text-violet-300">viewer123</code> - Tier 1: View slots</div>
                <div>• <code className="text-violet-300">admin</code> / <code className="text-violet-300">admin123</code> - Tier 2: Alter database</div>
              </div>

              <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-500 text-white py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-900/30"
              >
                <Shield className="w-4 h-4" />
                <span>{getT('adminLoginBtn')}</span>
              </button>
            </form>
          </div>
        </main>
      )}

      {/* 4. Admin Authenticated Workspace */}
      {view === 'admin' && adminRole && (
        <main className="flex-grow py-8">
          
          {/* Admin Header with Role & Stats */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h2 className="text-2xl font-black">{getT('adminView')}</h2>
                <span className="px-3 py-1 text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full">
                  {adminRole === 'manager' ? getT('adminRoleManager') : getT('adminRoleViewer')}
                </span>
              </div>
              <p className="text-gray-400 text-xs">
                {lang === 'it' ? 'Gestione sportiva ed elenco slot orari.' : 'Manage timeslots and pricing.'}
              </p>
            </div>

            <button
              onClick={handleAdminLogout}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2 px-4 rounded-lg text-xs font-bold transition-all"
            >
              {getT('adminLogout')}
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="glass p-5 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-gray-400">{getT('summaryBookings')}</div>
                <div className="text-xl font-bold text-white">{adminBookings.length}</div>
              </div>
            </div>

            <div className="glass p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-gray-400">{getT('summaryRevenue')}</div>
                <div className="text-xl font-bold text-white">€{totalRevenue.toFixed(2)}</div>
              </div>
            </div>

            <div className="glass p-5 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-gray-400">{getT('todayBookings')}</div>
                <div className="text-xl font-bold text-white">{todayBookingsCount}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Bookings & Slots List (Tier 1 & 2 View - Width 8/12) */}
            <div className="lg:col-span-8 glass p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-lg font-bold">{getT('adminBookingsTitle')}</h3>
                
                {/* Search field */}
                <input 
                  type="text"
                  placeholder={getT('searchPlaceholder')}
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              {/* Slots/Bookings Table */}
              <div className="overflow-x-auto border border-white/10 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-gray-400 font-bold">
                      <th className="py-3 px-4">{getT('tableId')}</th>
                      <th className="py-3 px-4">{lang === 'it' ? 'Riferimento' : 'Reference'}</th>
                      <th className="py-3 px-4">{getT('tableClient')}</th>
                      <th className="py-3 px-4">{getT('tableSport')}</th>
                      <th className="py-3 px-4">{getT('tableDate')}</th>
                      <th className="py-3 px-4">{getT('tableTime')}</th>
                      <th className="py-3 px-4">{getT('tablePaid')}</th>
                      <th className="py-3 px-4">{getT('tableStatus')}</th>
                      <th className="py-3 px-4 text-right">{getT('tableAction')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="py-8 text-center text-gray-500">
                          {lang === 'it' ? 'Nessuna prenotazione trovata.' : 'No bookings found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map(b => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-gray-500">#{b.id}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-violet-400 select-all">{b.reference_id || 'N/A'}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{b.user_name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{b.user_email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              b.area_id === 'football' ? 'bg-football/10 border-football/30 text-football' :
                              b.area_id === 'tennis' ? 'bg-tennis/10 border-tennis/30 text-tennis' :
                              b.area_id === 'beach-volley' ? 'bg-beach-volley/10 border-beach-volley/30 text-beach-volley' :
                              'bg-basketball/10 border-basketball/30 text-basketball'
                            }`}>
                              {lang === 'it' ? b.area_name_it : b.area_name_en}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium">
                            {formatDateDisplay(b.booking_date)}
                          </td>
                          <td className="py-3.5 px-4 font-bold">
                            {b.start_hour.toString().padStart(2, '0')}:00
                          </td>
                          <td className="py-3.5 px-4 text-emerald-400 font-mono font-bold">
                            €{parseFloat(b.total_paid).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              {b.payment_status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              disabled={adminRole !== 'manager'}
                              title={adminRole !== 'manager' ? getT('insufficientPerms') : getT('btnDelete')}
                              className="text-red-400 hover:text-red-300 disabled:text-gray-600 disabled:cursor-not-allowed p-1.5 rounded-md hover:bg-red-500/10 transition-colors inline-flex"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DB Modification Controls (Tier 2 Only - Width 4/12) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Tier 2 Alter DB Module */}
              <div className="glass p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-md font-bold">{getT('adminAlterDbTitle')}</h3>
                </div>

                {adminRole !== 'manager' ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl p-4 text-xs flex gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>{getT('insufficientPerms')}</div>
                  </div>
                ) : (
                  <div className="space-y-6 divide-y divide-white/5 text-xs">
                    
                    {/* Alter court rates */}
                    <div className="pt-0 space-y-3">
                      <h4 className="font-bold text-gray-300 uppercase tracking-wider">{getT('adminFieldRates')}</h4>
                      <div className="space-y-2">
                        {areas.map(court => (
                          <div key={court.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-2.5">
                            <div>
                              <div className="font-bold">{lang === 'it' ? court.name_it : court.name_en}</div>
                              <div className="text-[10px] text-emerald-400 font-bold">€{court.price_per_hour}/hr</div>
                            </div>
                            <div className="flex gap-2">
                              <input 
                                type="number" 
                                placeholder="€"
                                value={rateUpdates[court.id] || ''}
                                onChange={(e) => setRateUpdates({ ...rateUpdates, [court.id]: e.target.value })}
                                className="w-14 bg-white/5 border border-white/10 rounded px-2 py-1 text-center font-mono"
                              />
                              <button 
                                onClick={() => handleUpdatePrice(court.id)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1 rounded transition-all"
                              >
                                {getT('btnUpdateRate')}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Availability Controls */}
                    <div className="pt-4 space-y-3">
                      <h4 className="font-bold text-gray-300 uppercase tracking-wider">{getT('adminAvailability')}</h4>
                      <form onSubmit={handleAvailabilitySubmit} className="space-y-2.5">
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1">{getT('labelSelectSport')}</label>
                          <select 
                            value={availabilityForm.area_id}
                            onChange={(e) => setAvailabilityForm({ ...availabilityForm, area_id: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none"
                          >
                            {areas.map(a => (
                              <option key={a.id} value={a.id} className="bg-darkBg">
                                {lang === 'it' ? a.name_it : a.name_en}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-gray-400 uppercase mb-1">{getT('date')}</label>
                            <input 
                              type="date"
                              required
                              value={availabilityForm.block_date}
                              onChange={(e) => setAvailabilityForm({ ...availabilityForm, block_date: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 uppercase mb-1">{lang === 'it' ? 'Tipo' : 'Type'}</label>
                            <select 
                              value={availabilityForm.block_type}
                              onChange={(e) => setAvailabilityForm({ ...availabilityForm, block_type: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none"
                            >
                              <option value="hour">{lang === 'it' ? 'Ora' : 'Hour'}</option>
                              <option value="day">{lang === 'it' ? 'Giorno intero' : 'Full day'}</option>
                            </select>
                          </div>
                        </div>
                        {availabilityForm.block_type === 'hour' && (
                          <div>
                            <label className="block text-[10px] text-gray-400 uppercase mb-1">{getT('labelSelectTime')}</label>
                            <input 
                              type="number"
                              required
                              min="8"
                              max="22"
                              value={availabilityForm.start_hour}
                              onChange={(e) => setAvailabilityForm({ ...availabilityForm, start_hour: parseInt(e.target.value) })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none text-center font-mono"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1">{lang === 'it' ? 'Motivo' : 'Reason'}</label>
                          <input 
                            type="text"
                            value={availabilityForm.reason}
                            onChange={(e) => setAvailabilityForm({ ...availabilityForm, reason: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none"
                            placeholder={lang === 'it' ? 'Es. manutenzione' : 'E.g. maintenance'}
                          />
                        </div>
                        <button 
                          type="submit"
                          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold p-2.5 rounded-lg transition-all"
                        >
                          {lang === 'it' ? 'Blocca disponibilità' : 'Block availability'}
                        </button>
                      </form>

                      {availabilityBlocks.length > 0 && (
                        <div className="space-y-2">
                          {availabilityBlocks.map(block => (
                            <div key={block.id} className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex items-center justify-between gap-2">
                              <div>
                                <div className="font-bold text-white text-[11px]">
                                  {lang === 'it' ? (areas.find(a => a.id === block.area_id)?.name_it || block.area_id) : (areas.find(a => a.id === block.area_id)?.name_en || block.area_id)}
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  {formatDateDisplay(block.block_date)} • {block.block_type === 'day' ? (lang === 'it' ? 'Giorno intero' : 'Full day') : `${String(block.start_hour).padStart(2, '0')}:00`}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteAvailabilityBlock(block.id)}
                                className="text-red-400 hover:text-red-300 p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Manual Book Slot Entry */}
                    <div className="pt-4 space-y-3">
                      <h4 className="font-bold text-gray-300 uppercase tracking-wider">{getT('adminManualBooking')}</h4>
                      
                      <form onSubmit={handleManualBookingSubmit} className="space-y-2.5">
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1">{getT('labelSelectSport')}</label>
                          <select 
                            value={manualBooking.area_id}
                            onChange={(e) => setManualBooking({ ...manualBooking, area_id: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none"
                          >
                            {areas.map(a => (
                              <option key={a.id} value={a.id} className="bg-darkBg">
                                {lang === 'it' ? a.name_it : a.name_en}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-gray-400 uppercase mb-1">{getT('date')}</label>
                            <input 
                              type="date"
                              required
                              value={manualBooking.booking_date}
                              onChange={(e) => setManualBooking({ ...manualBooking, booking_date: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 uppercase mb-1">{getT('labelSelectTime')}</label>
                            <input 
                              type="number"
                              required
                              min="8"
                              max="22"
                              value={manualBooking.start_hour}
                              onChange={(e) => setManualBooking({ ...manualBooking, start_hour: parseInt(e.target.value) })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none text-center font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-gray-400 uppercase mb-1">{lang === 'it' ? 'Nome' : 'Name'}</label>
                            <input 
                              type="text"
                              required
                              placeholder="Marco"
                              value={manualBooking.user_name}
                              onChange={(e) => setManualBooking({ ...manualBooking, user_name: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 uppercase mb-1">Email</label>
                            <input 
                              type="email"
                              required
                              placeholder="client@mail.com"
                              value={manualBooking.user_email}
                              onChange={(e) => setManualBooking({ ...manualBooking, user_email: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none"
                            />
                          </div>
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 mt-2"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>{getT('btnManualAdd')}</span>
                        </button>
                      </form>
                    </div>

                    {/* Reset DB to default seed data */}
                    <div className="pt-4 space-y-3">
                      <h4 className="font-bold text-red-400 uppercase tracking-wider">{getT('adminResetDb')}</h4>
                      <button 
                        onClick={handleResetDb}
                        className="w-full bg-red-950/20 hover:bg-red-900/40 text-red-300 border border-red-500/20 hover:border-red-500/40 font-bold p-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>{getT('adminResetConfirm')}</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      )}

      {/* 4.5 Booking Success Ticket Modal */}
      {lastBookingSuccess && (
        <div className="modal-overlay">
          <div className="modal-content glass border border-indigo-500/40 relative max-w-md p-6 text-center shadow-2xl">
            <button 
              onClick={() => setLastBookingSuccess(null)}
              className="modal-close"
            >
              &times;
            </button>
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-white mb-1">
              {lang === 'it' ? 'Prenotazione Confermata!' : 'Booking Confirmed!'}
            </h3>
            <p className="text-gray-400 text-[11px] mb-6">
              {lang === 'it' 
                ? 'La tua sessione di gioco è stata registrata con successo.' 
                : 'Your play session has been registered successfully.'}
            </p>

            {/* Ticket Graphic layout */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left text-xs space-y-2.5 relative overflow-hidden">
              
              <div className="grid grid-cols-2 gap-y-2 pb-3 mb-3 border-b border-white/5">
                <div>
                  <span className="text-gray-500 uppercase tracking-wider text-[9px] font-bold block">{lang === 'it' ? 'CAMPO' : 'COURT'}</span>
                  <span className="font-bold text-white text-xs">
                    {lang === 'it' 
                      ? (areas.find(a => a.id === lastBookingSuccess.area_id)?.name_it || lastBookingSuccess.area_id)
                      : (areas.find(a => a.id === lastBookingSuccess.area_id)?.name_en || lastBookingSuccess.area_id)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase tracking-wider text-[9px] font-bold block">{lang === 'it' ? 'GIOCATORE' : 'PLAYER'}</span>
                  <span className="font-bold text-white text-xs truncate block">{lastBookingSuccess.user_name}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase tracking-wider text-[9px] font-bold block">{lang === 'it' ? 'DATA' : 'DATE'}</span>
                  <span className="font-mono font-bold text-white text-xs">{formatDateDisplay(lastBookingSuccess.booking_date)}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase tracking-wider text-[9px] font-bold block">{lang === 'it' ? 'ORARIO' : 'TIME'}</span>
                  <span className="font-bold text-white text-xs">{lastBookingSuccess.start_hour.toString().padStart(2, '0')}:00</span>
                </div>
              </div>

              {/* Lower ticket part */}
              <div className="pt-2 flex justify-between items-center">
                <div>
                  <span className="text-gray-500 uppercase tracking-wider text-[9px] font-bold block">{lang === 'it' ? 'PAGAMENTO' : 'PAYMENT'}</span>
                  <span className="font-bold text-emerald-400 capitalize">{lastBookingSuccess.payment_status}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase tracking-wider text-[9px] font-bold block">{lang === 'it' ? 'TOTALE' : 'TOTAL'}</span>
                  <span className="font-extrabold text-white text-xs">€{parseFloat(lastBookingSuccess.total_paid).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 text-center">
                <span className="text-gray-500 uppercase tracking-wider text-[9px] font-bold block mb-1">
                  {lang === 'it' ? 'CODICE RIFERIMENTO (FIRMATO)' : 'SIGNED REFERENCE CODE'}
                </span>
                <span className="font-mono text-xs font-bold text-violet-400 select-all bg-violet-500/10 border border-violet-500/30 rounded px-2 py-1.5 block tracking-wide">
                  {lastBookingSuccess.reference_id || lastBookingSuccess?.booking?.reference_id || 'N/A'}
                </span>
              </div>
            </div>

            <div className="mt-4 text-[9px] text-gray-500 leading-relaxed">
              {lang === 'it' 
                ? '🛡️ Ricevuta firmata digitalmente dal backend. Mostra questo codice alla reception.' 
                : '🛡️ Receipt digitally signed by the backend. Show this code at reception.'}
            </div>

            <button 
              onClick={() => setLastBookingSuccess(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all mt-6 shadow-md shadow-indigo-900/30"
            >
              {lang === 'it' ? 'Chiudi' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* 5. Footer */}
      <footer className="py-8 mt-auto border-t border-white/10 text-center text-xs text-gray-500">
        <p>© 2026 SportCenter. All rights reserved / Tutti i diritti riservati.</p>
        <p className="mt-1 text-[10px] text-gray-600">Simulated Booking System Powered by React & PostgreSQL</p>
      </footer>

      {/* 6. Notification Toasts Alerts */}
      <div className="toast-container fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-xs font-bold text-white transition-all transform animate-bounce ${
              toast.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300' 
                : 'bg-red-950/90 border-red-500/50 text-red-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
