const fetch = require('node-fetch')

const TZKTQUERY = 'https://api.tzkt.io/v1/tokens?contract.address.eq=KT1BJC12dG17CVvPKJ1VYaNnaT5mzfnUTwXv&metadata.name.as='
const TOKEN_META = 'Lonely%20Shapes*'
const QUERY_ROW = 'Pallet Number'

function getArg (args, argname) {
  const arg = args.find(arg => {
    return arg.toString().split('=')[0].match(argname).length > 0
  })
  return arg.split('=')[1]
}

const myArgs = process.argv.slice(2);
const batch = (myArgs.length > 0) ? getArg(myArgs, /batch/g) : null

if (!batch) {
  console.log('Please specify a batch #')
  return
}

async function getAllTokens () {
  const min = batch * 10
  const data = await fetch(TZKTQUERY + TOKEN_META)
    .then((response) => response.json())
    .then((data) => data.filter((elm, i) => {
      return i < min
    }))

  data
  .sort((a, b) => {
    const s1 = parseInt(a.metadata.attributes.find(n => n.name == QUERY_ROW).value)
    const s2 = parseInt(b.metadata.attributes.find(n => n.name == QUERY_ROW).value)
    return s1 > s2 ? -1 : 1
  })
  .forEach(row => {
    console.table(row.firstMinter)
    console.table(row.metadata.attributes)
  })

  // pick a winner
  console.log('winner')
  console.table(data[0].firstMinter)
  console.table(data[0].metadata.attributes)
}

getAllTokens()