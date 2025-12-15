import fs from 'node:fs/promises'
export async function writeToDisk(
    filePath: string,
    data: string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView>
  ) {
    // create folders
    var root = ''
    var folderPath = filePath
    if (folderPath[0] === '/') {
      root = '/'
      folderPath = folderPath.slice(1)
    }
    const folders = folderPath.split('/').slice(0, -1) // remove last item (file)
    var cfolderPath = root
    for (const folder of folders) {
      cfolderPath = cfolderPath + folder + '/'
      try {
        await fs.access(cfolderPath)
      } catch {
        await fs.mkdir(cfolderPath)
      }
    }
    try {
      await fs.writeFile(filePath, data)
    } catch (error) {
      console.error(error)
    }
  }