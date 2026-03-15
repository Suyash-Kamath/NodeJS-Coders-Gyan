// new practice to differentiate it is in-built  modules  by node 

import os from 'node:os'

console.log('CPUs',os.cpus().length); // tells about the CPU cores, but now recommended way

console.log('Total Memory', os.totalmem()/(1024*1024*1024)) // converts from bytes to GB


console.log('Free Memory',os.freemem()/(1024*1024)) // MB

console.log('Uptime',os.uptime()/(60*60)) // Hours

console.log('Host name',os.hostname())

console.log('User info',os.userInfo());

console.log('Machine',os.machine())