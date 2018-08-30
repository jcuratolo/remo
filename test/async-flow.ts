import Remo from "../src/remo";
import asyncFlowFx from '../src/async-flow'

describe('Remo', () => {
  let state = {};
  let store: Remo;
  const type = "some-event";
  const payload = {};

  beforeEach(() => {
    state = {};
    store = new Remo(state);
    store.registerEffectHandler('asyncFlow', asyncFlowFx)
  });

  
})