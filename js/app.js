import NoiseMeasurement from './models/NoiseMeasurement.js'
import NoiseSensor from './models/NoiseSensor.js'
import MonitoringSystem from './services/MonitoringSystem.js'

const sensorsData = [
	{
		id: 'NS-01',
		district: 'Галицький',
		location: 'просп. Свободи',
		noiseLevel: 58,
	},
	{
		id: 'NS-02',
		district: 'Франківський',
		location: 'вул. Наукова',
		noiseLevel: 74,
	},
	{
		id: 'NS-03',
		district: 'Шевченківський',
		location: 'просп. Чорновола',
		noiseLevel: 83,
	},
]

// Ініціалізація системи та додавання сенсорів
const system = new MonitoringSystem()

sensorsData.forEach(data => {
	const sensor = new NoiseSensor(
		data.id,
		data.district,
		data.location,
		data.noiseLevel,
	)
	system.addSensor(sensor)
})

// Додавання нового тестового вимірювання для перевірки методів
const sensor1 = system.findSensorById('NS-01')
if (sensor1) {
	sensor1.addMeasurement(new NoiseMeasurement(52))
}

// Рендеринг карток (рядків таблиці)
function renderSensorCards() {
	const tbody = document.querySelector('.measurements-table tbody')
	if (!tbody) return

	tbody.innerHTML = ''

	system.sensors.forEach(sensor => {
		const tr = document.createElement('tr')
		const status = sensor.getStatus()

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

	// Вивід середнього рівня шуму в консоль для перевірки
	console.log(
		`Середній рівень шуму в системі: ${system.getAverageNoiseLevel().toFixed(2)} дБ`,
	)
}

document.addEventListener('DOMContentLoaded', renderSensorCards)
