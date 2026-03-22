import * as fs from 'node:fs/promises'
import path from 'node:path'
export async function listItems(listPath='./'){
    const items = await fs.readdir(listPath,{withFileTypes:true})
    return items.map((item)=> {
    
        return {
            name:item.name,
            type:item.isDirectory() ? 'Folder':'File',
            path: path.join(import.meta.dirname,item.name)
        }
    }
)
        

}
listItems()
export async function deleteFolder(folderPath) {

    await fs.rm(folderPath,{recursive:true})
    
}

export async function createFolder(foldername) {
    await fs.mkdir(foldername, { recursive: true })
}

export async function readFile(pathname) {
    const data = await fs.readFile(pathname, 'utf-8') // returns string
    console.log('Data:', data)
}

export async function deleteFile(filepath){
    await fs.unlink(filepath)
}

export async function writeToFile(pathname, content = '') {
    await fs.appendFile(pathname, content)
}

export async function createFile(pathname, content = '') {
    await fs.writeFile(pathname, content)
}

export async function getFileInfo(filePath) {
    const stats = await fs.stat(filePath)

    return {
        size: ((stats.size)/1024).toFixed(2) + 'KB',
        created: stats.birthtime.toLocaleString(),
        modified: stats.mtime.toLocaleString(),
        permissions: stats.mode

    }
    
    
}
