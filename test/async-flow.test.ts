import Remo from "../src/remo";
import * as asyncFlowFx from '../src/async-flow'

describe('async-flow effect handler', () => {
  let state = {};
  let store: Remo;
  const type = "some-event";
  const payload = {};

  beforeEach(() => {
    state = {};
    store = new Remo(state);
    store.registerEffectHandler('async-flow', asyncFlowFx.effectHandler)
    store.registerEffectHandler('dispatch', (ctx, event) => ctx.store.dispatch(event))
  });

  test('Fx event with async flow effect dispatches events in correct order', done => {
    
    store.fx('first', () => {
      return {
        dispatch: ['first-success']
      }
    })

    const firstSuccessHandler = jest.fn(() => {
      expect(firstSuccessHandler).toBeCalled()
    })

    store.on('first-success', firstSuccessHandler) 

    const secondHandler = jest.fn(() => {
      expect(secondHandler).toBeCalled()
    })

    store.on('second', secondHandler)

    const thirdHandler = jest.fn(() => {
      expect(thirdHandler).toBeCalled()
      const processedEventTypes = store.processEventsList.map(({event: [type]}) => type)
      expect(processedEventTypes[0]).toBe('async')
      expect(processedEventTypes[1]).toBe('first')
      expect(processedEventTypes[2]).toBe('first-success')
      expect(processedEventTypes[3]).toBe('second')
      done()
    })

    store.on('third', thirdHandler)

    store.fx('async', () => {
      return {
        'async-flow': {
          startWith: 'first',
          rules: [
            { when: 'seen', events: 'first-success', dispatch: 'second' },
            { when: 'seen', events: 'second', dispatch: 'third'}
          ]
        }
      }
    })

    store.dispatch(['async'])
  })
})

