import * as fs from 'node:fs/promises'

async function createFile(pathname){

    try {
        await fs.writeFile(pathname,'Hello NodeJS\n');
        console.log('File Written')
    
         await fs.appendFile(pathname,'Hello JavaScript\n');
        console.log('File Appended')
        
    } catch (error) {
        console.log('Error: ',error)
    }
}

createFile('./hello.txt')

console.log('Lets start writing file')