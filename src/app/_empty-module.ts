// Empty module stub for test-only packages that get accidentally compiled
// by Next.js when test files in src/views/**/__tests__/ are treated as pages.
// This is a scaffold limitation that will be resolved in Phase 3.

/* eslint-disable @typescript-eslint/no-explicit-any */
const noop = (..._args: any[]) => {}
const noopChain: any = new Proxy(noop, {
  get(_t, _p) { return noopChain },
  apply(_t, _this, _args) { return noopChain },
})

function createMockFn() {
  const calls: any[][] = []
  let resolvedValue: any
  let rejectedValue: any
  let returnValue: any

  const fn: any = (...args: any[]) => {
    calls.push(args)
    if (rejectedValue !== undefined) return Promise.reject(rejectedValue)
    if (resolvedValue !== undefined) return Promise.resolve(resolvedValue)
    return returnValue
  }

  fn.mock = { calls, results: [], instances: [] }
  fn.mockResolvedValue = (v: any) => { resolvedValue = v; return fn }
  fn.mockRejectedValue = (v: any) => { rejectedValue = v; return fn }
  fn.mockReturnValue = (v: any) => { returnValue = v; return fn }
  fn.mockImplementation = (_impl: any) => fn
  fn.mockReset = () => { calls.length = 0; return fn }
  fn.mockClear = () => { calls.length = 0; return fn }
  fn.mockResolvedValueOnce = (v: any) => { resolvedValue = v; return fn }
  fn.mockReturnValueOnce = (v: any) => { returnValue = v; return fn }

  return fn
}

export const vi = {
  mock: noop,
  fn: createMockFn,
  spyOn: () => createMockFn(),
  mocked: (x: any) => x,
  clearAllMocks: noop,
  resetAllMocks: noop,
  restoreAllMocks: noop,
  stubGlobal: noop,
}
export const vitest = vi

// Common test globals
export const describe = (_name: string, fn: () => void) => { try { fn() } catch (_e) { /* noop */ } }
export const it = noop
export const test = noop
const expectFn: any = () => noopChain
expectFn.extend = noop
expectFn.soft = () => noopChain
expectFn.assertions = noop
export const expect = expectFn
export const beforeEach = noop
export const afterEach = noop
export const beforeAll = noop
export const afterAll = noop

// Testing library exports
export const render = () => ({ container: null, unmount: noop })
export const screen = noopChain
export const fireEvent = noopChain
export const waitFor = async (fn: any) => { try { return await fn() } catch (_e) { /* noop */ } }
export const cleanup = noop
export const act = async (fn: any) => { try { return await fn() } catch (_e) { /* noop */ } }
export const userEvent = { setup: () => noopChain }

// jest-dom matchers
const matcherFn: any = () => ({ pass: true, message: () => '' })
export const matchers: any = new Proxy({}, { get: () => matcherFn })

export default {}
