const fetch = require('node-fetch')
const table = require('table').table
const fs = require('fs')

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


if (!fs.existsSync('battles')){
  fs.mkdirSync('battles')
}

async function getAllTokens () {
  const min = batch * 10
  console.log('fetching all data: ', TZKTQUERY + TOKEN_META)
  /*const data = await fetch(TZKTQUERY + TOKEN_META)
    .then((response) => response.json())
    .then((data) => data.filter((elm, i) => {
      return i > min && i < min + 10 
    }))*/
    let response
    
    await fetch('https://api.fxhash.xyz/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: `query ExampleQuery($generativeTokenId: Float) {
          generativeToken(id: $generativeTokenId) {
            id
            metadata
            objkts {
              id
              features
              owner {
                name
                id
              }
              minter {
                name
                id
              }
            }
          }
        }`,
        variables: {
          generativeTokenId: 18303
        }
      })
    })
      .then(r => r.json())
      .then((data) => response = data.data.generativeToken.objkts.filter((elm, i) => {
        return i > min && i < min + 10 
      }) )


  const tableData = [
    ['Address', 'Alias', 'ID', QUERY_ROW]
  ]

  response
    .sort((a, b) => {
      const s1 = a.features.find(n => n.name == QUERY_ROW).value
      const s2 = b.features.find(n => n.name == QUERY_ROW).value
      return s1 > s2 ? -1 : 1
    })
    .forEach(row => {
      console.log(JSON.stringify(row))
      tableData.push([row.owner.id, row.owner.name ?? '-', row.id, row.features.find(n => n.name == QUERY_ROW).value])
    })

  let tableOutput = table(tableData)
  console.log(tableOutput)

  fs.writeFile(`battles/batch-${batch}.txt`, tableOutput, function(err) {
    if(err) {
      return console.log(err)
    }

    console.log(`Batch ${batch} results were saved`)
  })
}

try {
  getAllTokens()
} catch (err) {
  console.log(err)
}