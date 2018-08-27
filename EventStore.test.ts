import * as firebase from 'firebase'
import FirebaseProjectRepository from 'src/repositories/FirebaseProjectRepository'
import FirebaseUserRepository from 'src/repositories/FirebaseUserRepository'
import EffectsProcessor from 'src/stores/EventStore/EffectsProcessor'
import EventStore from 'src/stores/EventStore/EventStore'

describe('EventStore', () => {
  let state = {}
  type EventTypes = 'on-success' | 'some-event'
  let store: EventStore<typeof state, EventTypes>

  beforeEach(() => {
    state = {}
    store = new EventStore(
      new EffectsProcessor(
        {} as firebase.database.Reference,
        {} as FirebaseProjectRepository,
        {} as FirebaseUserRepository,
      ),
      state,
    )

    store.on('on-success', () => {
      return
    })
  })

  test('it can be instantiated', () => {
    expect(store).toBeDefined()
  })

  test('it registers events for dispatch', () => {
    const type = 'some-event'
    const handler = jest.fn()

    store.on(type, handler)
    store.dispatch(type)

    expect(handler).toBeCalled()
  })

  test('it registers events that also yield effects', done => {
    const type = 'some-event'
    const effectMap = {
      db: {
        type: 'none',
        onSuccess: [],
        onError: [],
      },
    }
    const handler = jest.fn(() => effectMap)
    const payload = {}
    jest.spyOn(store.effectProcessor, 'process')
    store.on(type, handler)
    store.dispatch(type).then(() => {
      expect(store.eventMap[type]).toBe(handler)
      expect(handler).toHaveBeenCalledWith(state)
      expect(store.effectProcessor.process).toHaveBeenCalledWith(
        store,
        effectMap,
      )
      done()
    })
  })
})
