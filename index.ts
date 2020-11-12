import fetch from "node-fetch"
import path from "path"
import fs from "fs"

const MAX_RESULTS = 40
const MAX_PAGES = 5

type AsciiArt = { body: string; id: string; tags: string[] }

async function _search(query: string, page = 1): Promise<AsciiArt[]> {
  const q = encodeURIComponent(query)
  const url = `https://www.asciiur.com/api/?q=${q}&pg=${page}`

  console.error(`[fetch] ${url}`)

  return await fetch(url)
    .then((res) => res.json())
    .then(async (json: AsciiArt[]) => {
      if (!json) return []
      if (json.length == MAX_RESULTS && page < MAX_PAGES) {
        return [...json, ...(await _search(query, page + 1))]
      }
      return json
    })
}

async function search(query: string): Promise<AsciiArt[]> {
  const cacheDir = path.resolve(__dirname, "cache")
  const cacheFile = path.resolve(cacheDir, query.replace(/\W+/g, "-") + ".json")
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir)
  }
  if (!fs.existsSync(cacheFile)) {
    const ret = await _search(query)
    fs.writeFileSync(cacheFile, JSON.stringify(ret))
    return ret
  }
  return JSON.parse(fs.readFileSync(cacheFile).toString()) as AsciiArt[]
}

async function searchOne(query: string) {
  const arts = await search(query)
  if (!arts.length) return
  const art = arts[Math.floor(Math.random() * arts.length)].body.replace(
    /\r/g,
    ""
  )
  const lines = art.split(/\r?\n/)
  const width = Math.max(...lines.map((l) => l.length))
  console.log(lines.map((l) => l.padEnd(width, " ")).join("\n"))
}

function run() {
  const args = process.argv.slice(2)
  for (const a of args) {
    if (a.startsWith("-")) {
      args.shift()
      switch (a) {
        case "-c":
        case "--cache":
          return console.log(path.resolve(__dirname, "cache"))
        case "-h":
        case "--help":
          console.log("splashcii keyword1 [keyword2] ...")
          console.log(
            "  --cache|-c   prints the cache directory. Simply delete it to clear the cache"
          )
          return

        default:
          if (a.startsWith("-")) throw new Error(`Invalid option ${a}`)
      }
    }
  }
  console.log(args)
  return searchOne(args.join(" "))
}

try {
  run()
} catch (error) {
  console.error("error: " + error.message)
  process.exit(1)
}
