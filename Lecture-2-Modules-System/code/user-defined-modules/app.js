// Common Js way 
// const getGreetings= require('./greeter')

// ESM syntax

import getGreetings from "./greeter.js";

const name = process.argv[2];

const hours = new Date().getHours;

const greetings = getGreetings(hours);

console.log(`${greetings}, ${name}!`);

