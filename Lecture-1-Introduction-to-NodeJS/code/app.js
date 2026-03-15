// console.log("Hello NodeJS");

// console.log(process); // Interesting object available globally in NodeJS
/* Jaisehi node app.js kartey he  to node ki process start hoti hai jiske andhar aapka application run ho raha hai 
  Toh uss process ke baarein me bohot saara information ye javascript ,process object ke form me deta hai

*/

console.log(process.argv); // argv provides argument in form of array 

console.log(process.argv[2],process.argv[3]);

// These all are primitives with the help of it , we are going to create powerful things 