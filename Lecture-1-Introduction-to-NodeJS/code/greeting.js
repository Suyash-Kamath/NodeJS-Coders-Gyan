const name = process.argv[2];

const hours = new Date().getHours(); // 24 hours format

console.log('hours ',hours);


function getGreetings(hours){
    if(hours<4 || hours>=19) return "Good night";
    else if(hours<9) return "Good morning";
    else if(hours<16) return "Good afternoon";
    else return "Good evening";
}


const greetings=getGreetings(hours)

console.log(`${greetings}, ${name}!`);

