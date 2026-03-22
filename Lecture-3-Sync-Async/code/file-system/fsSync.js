import * as fs from 'node:fs'

function createFile(pathname){
 
    // Sync API testing 

    fs.writeFileSync(pathname,"Hello NodeJS\n");
    // fs.writeFileSync(pathname,"Hello JavaScript");
    fs.appendFileSync(pathname,"Hello JavaScript")
    console.log("File has been created ")

    // Sync is not used in production systems , but if making internal tool only for me , not multiple users , then you can use this sync 
     console.log('File Operation done ')


}

createFile('./hello.txt');



