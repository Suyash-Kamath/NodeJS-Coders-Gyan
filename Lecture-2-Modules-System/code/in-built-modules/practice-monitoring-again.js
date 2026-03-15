import os from 'node:os'

function monitor(){
    const oldCPUs = os.cpus();

    setTimeout(()=>{
        const newCPUs = os.cpus();

        const usage = newCPUs.map((cpu,i)=>{
            return {core:i,
            usage:calculateCPU(oldCPUs[i],newCPUs[i]) + '%'
        }
        })

        console.table(usage)
    },1000)
}

function calculateCPU(oldCPUs,newCPUs){
    const oldTotal = Object.values(oldCPUs.times).reduce((a,b)=> a+b)

    const newTotal = Object.values(newCPUs.times).reduce((a,b)=>a+b);

    const total = newTotal - oldTotal;

    const idle = newCPUs.times.idle - oldCPUs.times.idle; 

    const used  = total - idle ; 

    return ((used/total)*100).toFixed(1);
}

setInterval(monitor,1000);