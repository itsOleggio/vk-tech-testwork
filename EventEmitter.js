class EventEmitter {
    constructor() {
        this.events = {}
    }

    on(eventName, listener) {
        if(!this.events[eventName]) {
            this.events[eventName] = []
        }
        this.events[eventName].push(listener)
    }

    emit(eventName, ...args) {
        if(this.events[eventName]) {
            this.events[eventName].forEach(listener => {
                listener(...args)
            })
        }
    }

    off(eventName, listener) {
        if(this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(l => l !== listener)
        }
    }

}

const emitter = new EventEmitter()

function LogData(data) {
    console.log(data)
}

emitter.on('data', LogData)

emitter.emit('data', {message: "Happy developing ✨"})

emitter.off('data', LogData)

emitter.emit('data', {message: "NO TEXT Happy developing ✨" })

