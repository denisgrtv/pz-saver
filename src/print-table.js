/* eslint-disable no-console */

const Table = require('easy-table');

console.warn = () => {};

const print = (...args) => console.log(...args);

/**
 * @param {Object[]} rows
 * @param {Object} cols
 */
const printTable = (rows, cols) => print(Table.print(rows, cols));

module.exports = {
  printTable,
};
