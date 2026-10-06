import React, { useState, useEffect } from 'react';
import { 
  Activity, Droplets, Thermometer, Wind, CloudRain, 
  Cpu, Wifi, Battery, RefreshCw, Copy, Check, Info, 
  ShieldCheck, AlertCircle, Sparkles, Sliders
} from 'lucide-react';
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import api from '../services/api';

export default function IoTMonitoring({ t, lang, isDemoMode, toggleDemoMode }) {
  const [telemetrySummary, setTelemetrySummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchTelemetry = async () => {
    try {
      const [latestRes, historyRes] = await Promise.all([
        api.getLatestIoT(),
        api.getIoTHistory({ hours: 24, limit: 20 })
      ]);
      setTelemetrySummary(latestRes.data);
      
      const formattedHistory = historyRes.data.map(item => ({
        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        moisture: item.soil_moisture,
        ph: item.ph,
        temp: item.temperature,
        humidity: item.humidity,
        nitrogen: item.nitrogen,
        phosphorus: item.phosphorus,
        potassium: item.potassium
      }));
      setHistory(formattedHistory);
    } catch (err) {
      console.error('Error fetching IoT telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 10000);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  const samplePayload = JSON.stringify({
    device_id: "ESP32_FIELD_001",
    soil_moisture: 44.5,
    ph: 6.45,
    nitrogen: 125.0,
    phosphorus: 48.0,
    potassium: 85.0,
    temperature: 29.8,
    humidity: 64.0,
    rain_detected: false
  }, null, 2);

  const copyPayload = () => {
    navigator.clipboard.writeText(samplePayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const current = telemetrySummary?.latest || {
    device_id: "ESP32_DEMO_01",
    soil_moisture: 42.5,
    ph: 6.4,
    nitrogen: 120,
    phosphorus: 45,
    potassium: 80,
    temperature: 29.5,
    humidity: 68,
    rain_detected: false,
    timestamp: new Date().toISOString()
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            {t.iot.title}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t.iot.subtitle}
          </p>
        </div>

        {/* Telemetry Switch */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-1.5 shadow-inner">
            <button
              onClick={toggleDemoMode}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                isDemoMode
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Simulation Demo</span>
            </button>
            <button
              onClick={toggleDemoMode}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                !isDemoMode
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wifi className="h-3.5 w-3.5" />
              <span>Live ESP32</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode Banner */}
      <div className={`rounded-xl border p-4 flex items-center gap-3 text-xs sm:text-sm ${
        isDemoMode
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      }`}>
        <Info className="h-5 w-5 shrink-0" />
        <div className="flex-1">
          <span className="font-bold">{isDemoMode ? 'Demo Mode Active: ' : 'Live Hardware Mode: '}</span>
          <span>{isDemoMode ? t.iot.demoNotice : t.iot.liveNotice}</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 shrink-0">
          <span className="flex items-center gap-1">
            <Battery className="h-4 w-4 text-emerald-400" />
            94%
          </span>
          <span className="flex items-center gap-1">
            <Wifi className="h-4 w-4 text-emerald-400" />
            -62 dBm
          </span>
        </div>
      </div>

      {/* 6 Primary Sensor Live Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* Soil Moisture */}
        <div className="agri-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.dashboard.soilMoisture}
            </span>
            <Droplets className="h-5 w-5 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{current.soil_moisture}%</span>
            <span className="text-xs font-bold text-emerald-400">
              {telemetrySummary?.moisture_status || 'Optimal Range'}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(current.soil_moisture, 100)}%` }}
            />
          </div>
        </div>

        {/* Soil pH */}
        <div className="agri-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.dashboard.soilPh}
            </span>
            <span className="text-xs font-extrabold text-emerald-400">pH Probe</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{current.ph}</span>
            <span className="text-xs font-bold text-emerald-300">
              {telemetrySummary?.ph_status || 'Optimal (6.0 - 7.0)'}
            </span>
          </div>
          {/* pH scale bar */}
          <div className="mt-3 h-2 w-full rounded-full bg-gradient-to-r from-red-500 via-emerald-400 to-purple-500 relative">
            <div 
              className="absolute top-1/2 -translate-y-1/2 h-3.5 w-1.5 rounded-full bg-white shadow"
              style={{ left: `${(current.ph / 14) * 100}%` }}
            />
          </div>
        </div>

        {/* NPK Macronutrients */}
        <div className="agri-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              NPK Macro Nutrients (mg/kg)
            </span>
            <Activity className="h-5 w-5 text-amber-400" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-950/60 p-2 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">N</span>
              <span className="text-base font-black text-emerald-400">{current.nitrogen}</span>
            </div>
            <div className="rounded-xl bg-slate-950/60 p-2 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">P</span>
              <span className="text-base font-black text-blue-400">{current.phosphorus}</span>
            </div>
            <div className="rounded-xl bg-slate-950/60 p-2 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">K</span>
              <span className="text-base font-black text-amber-400">{current.potassium}</span>
            </div>
          </div>
        </div>

        {/* Ambient Temperature */}
        <div className="agri-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Field Temperature (DHT22)
            </span>
            <Thermometer className="h-5 w-5 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{current.temperature}°C</span>
            <span className="text-xs font-semibold text-slate-400">Canopy Temp</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Chilli optimal range: 20°C - 35°C</p>
        </div>

        {/* Relative Humidity */}
        <div className="agri-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Relative Humidity
            </span>
            <Wind className="h-5 w-5 text-teal-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{current.humidity}%</span>
            <span className="text-xs font-semibold text-slate-400">RH</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Pathogen spore threshold: &gt;75% RH</p>
        </div>

        {/* Rain Detection */}
        <div className="agri-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Precipitation / Rain Sensor
            </span>
            <CloudRain className="h-5 w-5 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {current.rain_detected ? 'Rain Trigger Active' : 'Dry Surface'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Digital rain sensor on GPIO32</p>
        </div>

      </div>

      {/* 2 Big History Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Soil Moisture & Temperature Area Chart */}
        <div className="agri-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
            {t.iot.tempHumidityChart}
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} domain={[15, 90]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} dot={false} name="Temp (°C)" />
                <Line type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={2} dot={false} name="Humidity (%)" />
                <Line type="monotone" dataKey="moisture" stroke="#10b981" strokeWidth={2} dot={false} name="Soil Moisture (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NPK Bar Chart */}
        <div className="agri-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
            {t.iot.npkChart}
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history.slice(-8)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="nitrogen" fill="#10b981" name="Nitrogen (N)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="phosphorus" fill="#3b82f6" name="Phosphorus (P)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="potassium" fill="#f59e0b" name="Potassium (K)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ESP32 Hardware Integration Guide Box */}
      <div className="agri-card p-6 border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {t.iot.esp32Integration}
              </h2>
              <p className="text-xs text-slate-400">
                Ready-to-flash HTTP REST architecture for physical ESP32 prototype
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-4">
          
          {/* Pinout Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Hardware Sensor Pin Mapping
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-3.5 py-2.5">Sensor</th>
                    <th className="px-3.5 py-2.5">ESP32 Pin</th>
                    <th className="px-3.5 py-2.5">Interface Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="px-3.5 py-2">Capacitive Soil Moisture</td>
                    <td className="px-3.5 py-2 text-emerald-400 font-mono">GPIO 34 (ADC1_CH6)</td>
                    <td className="px-3.5 py-2">Analog (0 - 3.3V)</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2">Analog Soil pH Probe</td>
                    <td className="px-3.5 py-2 text-emerald-400 font-mono">GPIO 35 (ADC1_CH7)</td>
                    <td className="px-3.5 py-2">Analog</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2">DHT22 Temp & Humidity</td>
                    <td className="px-3.5 py-2 text-emerald-400 font-mono">GPIO 4</td>
                    <td className="px-3.5 py-2">Single-Bus Digital</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2">Rain Sensor Module</td>
                    <td className="px-3.5 py-2 text-emerald-400 font-mono">GPIO 32</td>
                    <td className="px-3.5 py-2">Digital DO</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2">NPK RS485 Modbus Sensor</td>
                    <td className="px-3.5 py-2 text-emerald-400 font-mono">GPIO 16 (RX2), 17 (TX2)</td>
                    <td className="px-3.5 py-2">UART / MAX485</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Ingestion Payload JSON */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                POST /api/iot/sensor-data Payload
              </h3>
              <button
                onClick={copyPayload}
                className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 transition-all"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-[11px] font-mono text-emerald-400 overflow-x-auto">
              {samplePayload}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
}
