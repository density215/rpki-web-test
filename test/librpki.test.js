import { exportForTest } from '../src/librpki.js'

test('adds 1 + 2 to equal 3', () => {
  expect((1 + 2)).toBe(3);
})

test('runs stuff from librpki', () => {
  console.log(exportForTest())
  expect(exportForTest()).toBe('export works')
})
