import NoiseMeasurement from './models/NoiseMeasurement.js'
import NoiseSensor from './models/NoiseSensor.js'
import MonitoringSystem from './services/MonitoringSystem.js'

// Універсальна функція для гарантованого запуску після завантаження DOM
function onDOMReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback)
  } else {
    callback()
  }
}

// =========================================================================
// ЧАСТИНА 1: Моніторинг та таблиця вимірювань (Лабораторна №5)
// =========================================================================
const sensorsData = [
  { id: 'NS-01', district: 'Галицький', location: 'просп. Свободи', noiseLevel: 58 },
  { id: 'NS-02', district: 'Франківський', location: 'вул. Наукова', noiseLevel: 74 },
  { id: 'NS-03', district: 'Шевченківський', location: 'просп. Чорновола', noiseLevel: 83 }
]

const system = new MonitoringSystem()

sensorsData.forEach(data => {
  const sensor = new NoiseSensor(data.id, data.district, data.location, data.noiseLevel)
  system.addSensor(sensor)
})

const sensor1 = system.findSensorById('NS-01')
if (sensor1) {
  sensor1.addMeasurement(new NoiseMeasurement(52))
}

function renderSensorCards() {
  const tbody = document.querySelector('.measurements-table tbody')
  if (!tbody) return

  tbody.innerHTML = ''

  system.sensors.forEach(sensor => {
    const tr = document.createElement('tr')
    const status = typeof sensor.getStatus === 'function' ? sensor.getStatus() : 'normal'

    let statusText = 'Норма'
    let cssClass = 'normal-text'

    if (status === 'warning') {
      statusText = 'Попередження'
      cssClass = 'status-warning'
    } else if (status === 'critical') {
      statusText = 'Перевищення'
      cssClass = 'danger-text'
    }

    tr.innerHTML = `
      <td>${new Date().toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' })}</td>
      <td>${sensor.location} (${sensor.district})</td>
      <td class="${cssClass}">${sensor.noiseLevel} дБ</td>
      <td class="${cssClass}">${statusText}</td>
    `
    tbody.appendChild(tr)
  })

  if (typeof system.getAverageNoiseLevel === 'function') {
    console.log(`Середній рівень шуму в системі: ${system.getAverageNoiseLevel().toFixed(2)} дБ`)
  }
}

// =========================================================================
// ЧАСТИНА 2: Активні сенсори та фільтрація (Лабораторна №6)
// =========================================================================
const activeSensors = [
  {
    id: 'NS-01',
    district: 'Галицький',
    location: 'просп. Свободи, 14',
    noiseLevel: 52,
    status: 'normal'
  },
  {
    id: 'NS-02',
    district: 'Франківський',
    location: 'вул. Наукова, 8',
    noiseLevel: 68,
    status: 'warning'
  },
  {
    id: 'NS-03',
    district: 'Шевченківський',
    location: 'просп. Чорновола, 21',
    noiseLevel: 83,
    status: 'critical'
  },
  {
    id: 'NS-04',
    district: 'Сихівський',
    location: 'вул. Зелена, 102',
    noiseLevel: 49,
    status: 'normal'
  },
  {
    id: 'NS-05',
    district: 'Личаківський',
    location: 'вул. Пасічна, 30',
    noiseLevel: 71,
    status: 'warning'
  },
  {
    id: 'NS-06',
    district: 'Залізничний',
    location: 'вул. Городоцька, 155',
    noiseLevel: 86,
    status: 'critical'
  }
]

function initActiveSensors() {
  const sensorList = document.querySelector('.sensor-list')
  const districtFilter = document.querySelector('#district-filter')
  const criticalFilter = document.querySelector('#critical-filter')

  if (!sensorList) {
    console.error('Помилка: елемент .sensor-list не знайдено в HTML!')
    return
  }

  function createSensorCard(sensor) {
    const card = document.createElement('article')
    card.classList.add('sensor-card')

    const districtText = sensor.district.includes('район')
      ? sensor.district
      : `${sensor.district} район`

    card.innerHTML = `
      <div class="card-header">
        <h3 class="sensor-id">${sensor.id}</h3>
        <span class="status-badge status-badge--${sensor.status}">
          <span class="badge-dot"></span>
          ${sensor.status}
        </span>
      </div>

      <div class="card-body">
        <div class="info-row">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>${districtText}</span>
        </div>
        <div class="info-row">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
            <path d="M9 22v-4h6v4"/>
            <path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/>
            <path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/>
            <path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
          </svg>
          <span>${sensor.location}</span>
        </div>
      </div>

      <div class="card-footer">
        <div class="noise-info">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 10v4"/><path d="M6 6v12"/><path d="M10 3v18"/>
            <path d="M14 8v8"/><path d="M18 5v14"/><path d="M22 11v2"/>
          </svg>
          <span>Рівень шуму: <strong class="noise-value noise-value--${sensor.status}">${sensor.noiseLevel} дБ</strong></span>
        </div>
      </div>
    `

    return card
  }

  function renderSensors(sensorArray) {
    sensorList.innerHTML = ''
    sensorArray.forEach(sensor => {
      const card = createSensorCard(sensor)
      sensorList.append(card)
    })
  }

  function applyFilters() {
    const selectedDistrict = districtFilter ? districtFilter.value : 'all'
    const criticalOnly = criticalFilter ? criticalFilter.checked : false

    const filteredSensors = activeSensors.filter(sensor => {
      const matchesDistrict = selectedDistrict === 'all' || sensor.district === selectedDistrict
      const matchesStatus = !criticalOnly || sensor.status === 'critical'
      return matchesDistrict && matchesStatus
    })

    renderSensors(filteredSensors)
  }

  if (districtFilter) districtFilter.addEventListener('change', applyFilters)
  if (criticalFilter) criticalFilter.addEventListener('change', applyFilters)

  // Початковий рендер карток
  renderSensors(activeSensors)
}

// Запуск рендерингу для обох секцій
onDOMReady(() => {
  try {
    renderSensorCards()
  } catch (err) {
    console.error('Помилка в рендері таблиці Лаб 5:', err)
  }

  try {
    initActiveSensors()
  } catch (err) {
    console.error('Помилка в рендері секції Лаб 6:', err)
  }
})
