

function getGreetings(hours){
    if(hours<4 || hours>=19) return "Good night";
    else if(hours<9) return "Good morning";
    else if(hours<16) return "Good afternoon";
    else return "Good evening";
}

// Common js ->Old
// ESM -> become standard in JS
// Always prefer ESM 


// module.exports = getGreetings;
// this is common js syntax , and we use require() to import 

// ESM Syntax

export default getGreetings;
// multiple export default not possible , 
// if you want to multiple export then please use named export with using only export