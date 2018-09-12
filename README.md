# remo

A port of Re-Frame

### Make store
```
const store = new Remo({})
```

### Register event handler
```
store.on('my-event', (state, event) => {
  // Handle business
  const [type, payload] = event
  state.received = payload.thing
})
```

### Dispatch event with payload
```
store.dispatch(['my-event', { thing: true }])
```

### Register effect handler
```
// Allow events to trigger other events
store.registerEffectHandler('dispatch', (context, effect) => {
  context.store.dispatch(effect)
})
```

### Handle event and return effect
```
store.fx('my-event', (context, evt) => {
  const [type, payload] = evt
  context.store.state.status = payload.status
  
  // Causes ['my-event-2'] to be dispatched
  return {
    dispatch: ['my-event-2']
  }
})
```
