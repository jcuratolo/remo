import Remo from './remo'

const store = new Remo({})
// @ts-ignore
window.store = store

// @ts-ignore
store.registerEffectHandler('dispatch', (context, event) => {
  context.store.dispatch(...event)
})
store.addPreEventCallback((ctx: any) => console.group(ctx.event[0]))
store.addPostEventCallback((ctx: any) => {
  // @ts-ignore
  const [type, args] = ctx.event
  console.log(args)
  console.groupEnd()
})
store.fx('outer', () => {
  return {
    dispatch: ['inner']
  }
})
store.fx('inner', () => {
  return {
    dispatch: ['inner 2']
  }
})
store.fx('inner 2', () => {})
store.fx('1', () => {})
store.fx('2', () => {})
store.fx('3', () => {})
store.dispatch('outer')
store.dispatch('1')
store.dispatch('2')
store.dispatch('3')
