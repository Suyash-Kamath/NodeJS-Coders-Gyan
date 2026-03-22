import * as fs from 'node:fs'

function createFile(pathname){
    // Async 
    // Error first callbacks
  
    fs.writeFile(pathname,'Hello NodeJS!\n',(error)=>{
        if(error){
            console.log("Something ent wrong while writing a file");
            return ;
        }
        // append() is written to avoid the race condition
         fs.appendFile(pathname,'Hello JavaScript!\n',(error)=>{
        if(error){
            console.log("Something ent wrong while writing a file");
            return ;
        }
        console.log("File has been created asynchronously")
    })
        console.log("File has been created asynchronously")
    })

   console.log('File Operation done ')

}

createFile('./hello.txt');
