'use strict';

// Tasks for rewriting:
//   - Topic: SoC, SRP, code characteristics, V8
//   - Apply optimizations of computing resources: processor, memory
//   - Minimize cognitive complexity
//   - Respect SRP and SoC
//   - Improve readability (understanding), reliability
//   - Optimize for maintainability, reusability, flexibility
//   - Make code testable
//   - Implement simple unittests without frameworks
// Additional tasks:
//   - Try to implement in multiple paradigms: OOP, FP, procedural, mixed
//   - Prepare load testing and trace V8 deopts

const data = `city,population,area,density,country
  Shanghai,24256800,6340,3826,China
  Delhi,16787941,1484,11313,India
  Lagos,16060303,1171,13712,Nigeria
  Istanbul,14160467,5461,2593,Turkey
  Tokyo,13513734,2191,6168,Japan
  Sao Paulo,12038175,1521,7914,Brazil
  Mexico City,8874724,1486,5974,Mexico
  London,8673713,1572,5431,United Kingdom
  New York City,8537673,784,10892,United States
  Bangkok,8280925,1569,5279,Thailand`;

function getRow(line) {
  const cells = line.split(',');
  return {
    city: cells[0],
    population: parseInt(cells[1], 10),
    area: parseInt(cells[2], 10),
    density: parseInt(cells[3], 10),
    country: cells[4],
  };
}

function parseCVS(csv) {
  const lines = csv.split('\n');
  const table = [];

  // A real project should have a validator for the input data
  for (let i = 1; i < lines.length; i++) {
    table.push(getRow(lines[i]));
  }

  return table;
}

function findMaxDensity(table) {
  let max = 0;
  for (const row of table) {
    const { density } = row;
    if (density > max) max = density;
  }
  return max;
}

function getDensityPercentage(density, max) {
  if (max === 0) return 0;
  return Math.round((density * 100) / max);
}
// insertDensityPercentage and findMaxDensity might be combined into one function for optimization
function insertDensityPercentage(table, max) {
  return table.map(row => {
    const { density } = row;
    const percent = getDensityPercentage(density, max);
    return { ...row, percent };
  });
}

function sortTable(table) {
  // toSorted might be less efficient than sort because it creates a new array
  // also, sortTable might be more flexible
  return table.toSorted((r1, r2) => r2.percent - r1.percent);
}

const COLUMN_ORDER = ['city', 'population', 'area', 'density', 'country', 'percent'];
const defaultFormatter = (value) => String(value);
const defaultFormatters = {
  city: (value) => String(value).padEnd(18),
  population: (value) => value.toString().padStart(10),
  area: (value) => value.toString().padStart(8),
  density: (value) => value.toString().padStart(8),
  country: (value) => String(value).padStart(18),
  percent: (value) => value.toString().padStart(6)
};

function formatTable(sortedTable, columns = COLUMN_ORDER, formatters = defaultFormatters) {
  return sortedTable.map(row => {
    const cells = columns.map(column => {
      const value = row[column];
      const formatter = formatters[column] || defaultFormatter;
      return formatter(value);
    });
    return cells.join('');
  });
}

function displayTable(strings) {
  for (const string of strings) {
    console.log(string);
  }
}

function prepareTable(csv) {
  const table = parseCVS(csv);
  const max = findMaxDensity(table);
  const tableWithPercent = insertDensityPercentage(table, max);
  return sortTable(tableWithPercent);
}

export function processData(csv) {
  const sortedTable = prepareTable(csv);
  return formatTable(sortedTable);
}

export function main() {
  const strings = processData(data);
  displayTable(strings);
}
