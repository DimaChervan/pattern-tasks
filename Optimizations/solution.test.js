import { processData } from './solution.js';
import { assertEqual, run } from '../test-helpers.js';

const csvThreeRows = `city,population,area,density,country
A,1,1,10,X
B,1,1,50,Y
C,1,1,30,Z`;

run('returns 3 strings sorted by density percent descending (B, C, A)', () => {
  const strings = processData(csvThreeRows);
  assertEqual(Array.isArray(strings), true, 'result must be array');
  assertEqual(strings.length, 3, 'three data rows');
  assertEqual(strings[0].startsWith('B'), true, 'first row: city with max density (B)');
  assertEqual(strings[1].startsWith('C'), true, 'second row: C (60%)');
  assertEqual(strings[2].startsWith('A'), true, 'third row: A (20%)');
});

run('formatted strings match expected column layout', () => {
  const strings = processData(csvThreeRows);
  const expected = [
    'B                          1       1      50                 Y   100'
  ];
  assertEqual(strings[0], expected[0], 'first row format');
});

run('single row with density 0 returns one formatted string', () => {
  const csv = `city,population,area,density,country
A,0,0,0,X`;
  const strings = processData(csv);
  assertEqual(strings.length, 1, 'one row');
  assertEqual(strings[0].startsWith('A'), true, 'first row is A');
});

run('empty data returns empty array of strings', () => {
  const csv = `city,population,area,density,country`;
  const strings = processData(csv);
  assertEqual(strings.length, 0, 'no data rows');
  assertEqual(Array.isArray(strings), true, 'result is array');
});
