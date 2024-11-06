import EventEmitter from './EventEmitter.js'

export default class Time extends EventEmitter {
	constructor() {
		super()

		// Setup
		this.start = Date.now()
		this.current = this.start
		this.elapsed = 0
		this.delta = 16
		this.seconds = 0
		this.frameCount = 0
		
		// Start the ticking loop
		requestAnimationFrame(() => {
			this.tick()
		})
	}

	tick() {
		const currentTime = Date.now()
		this.delta = currentTime - this.current
		this.current = currentTime
		this.elapsed = this.current - this.start
		this.frameCount++

		// Trigger the regular tick event
		this.trigger('tick')

		// Continue the animation frame loop
		requestAnimationFrame(() => {
			this.tick()
		})
	}
}
