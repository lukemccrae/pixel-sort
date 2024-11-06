import Debug from 'utils/Debug.js'
import Sizes from 'utils/Sizes.js'
import Time from 'utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import Resources from 'utils/Resources.js'
import SceneManager from 'utils/SceneManager.js'
import sources from './sources.json'
import { Mesh, Scene } from 'three'
import SeedManager from 'utils/SeedManager.js'
import EventEmitter from 'utils/EventEmitter.js'

let instance = null

export default class Experience extends EventEmitter {
	constructor(_canvas) {
		super()
		// Singleton
		if (instance) {
			return instance
		}
		instance = this

		// Global access
		window.experience = this

		// Options
		this.canvas = _canvas

		// Setup
		this.sizes = new Sizes()
		this.time = new Time()
		this.scene = new Scene()
		this.debug = new Debug()
		this.camera = new Camera()
		this.resources = new Resources(sources)
		this.renderer = new Renderer()
		this.activeScene = new SceneManager()
		this.seedManager = new SeedManager()
		this.seedLength = 10
		this.url = new URL(window.location.href)

		// Resize event
		this.sizes.on('resize', () => {
			this.resize()
		})

		// Time tick event
		this.time.on('tick', () => {
			if(this.time.frameCount % 200 === 0) {
				this.setUrlSeed(this.getRandomSeed())
				this.trigger('reload')
				this.debug.update()
			}
			this.update()
		})
	}

	getRandomSeed(length = this.seedLength) {
		return Math.floor(Math.random() * Math.pow(10, length))
	}

	setUrlSeed(seed) {
		this.url.searchParams.set('seed', seed.toString())
		window.history.replaceState({}, '', this.url)
	}

	resize() {
		this.camera.resize()
		this.renderer.resize()
	}

	update() {
		this.camera.update()
		this.activeScene.update()
		this.renderer.update()
		this.debug.update()
	}

	destroy() {
		this.sizes.off('resize')
		this.time.off('tick')

		// Traverse the whole scene
		this.scene.traverse((child) => {
			// Test if it's a mesh
			if (child instanceof Mesh) {
				child.geometry.dispose()

				// Loop through the material properties
				for (const key in child.material) {
					const value = child.material[key]

					// Test if there is a dispose function
					if (value && typeof value.dispose === 'function') {
						value.dispose()
					}
				}
			}
		})

		this.camera.controls.dispose()
		this.renderer.instance.dispose()

		if (this.debug.active) this.debug.ui.destroy()
	}
}
