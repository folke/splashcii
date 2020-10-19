// #!/usr/bin/env bash
// set -e

// ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && cd .. && pwd)"
// CACHE="$ROOT/cache"
// mkdir -p $CACHE

// search() {
// 	FILE="$CACHE/$(echo "$@" | sed -E 's/[^a-z]+/-/ig').json"
// 	[ -f "$FILE" ] ||
// 		curl -s "https://www.asciiur.com/api/" -G --data-urlencode "q=$1" >$FILE
// 	echo $FILE
// }

// one() {
// 	f=$(search "$1")
// 	len=$(jq "length" "$f")
// 	choice=$(($RANDOM % $len))
// 	art=$(jq ".[$choice].body" --raw-output "$f" | sed "s/\r//g")
// 	width=$(echo "$art" | awk '{print length}' | sort -nr | head -1)
// 	echo "$art" | awk "{printf(\"%-${width}s\n\", \$0)}"
// }

// one "$@"
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
  const art = arts[Math.floor(Math.random() * arts.length)].body
  const lines = art.split(/\r?\n/)
  const width = Math.max(...lines.map((l) => l.length))
  console.log(lines.map((l) => l.padEnd(width, " ")).join("\n"))
}

searchOne(process.argv.slice(2).join(" "))
