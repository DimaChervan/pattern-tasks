export function assertEqual(actual, expected, message) {
  const same = actual === expected ||
    (typeof expected === 'object' && expected !== null &&
      JSON.stringify(actual) === JSON.stringify(expected));
  if (!same) {
    throw new Error(
      (message || 'Assertion failed') + ': expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual)
    );
  }
}

export function run(name, fn) {
  try {
    fn();
    console.log('OK:', name);
  } catch (err) {
    console.error('FAIL:', name, err.message);
    process.exitCode = 1;
  }
}
