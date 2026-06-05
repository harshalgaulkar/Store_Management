const http = require('http')

const HOST = 'localhost'
const PORT = 4000

function request(path, method, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : ''
    const options = {
      hostname: HOST,
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }

    const req = http.request(options, (res) => {
      let raw = ''
      res.on('data', (chunk) => { raw += chunk })
      res.on('end', () => {
        try {
          const parsed = raw ? JSON.parse(raw) : null
          resolve({ statusCode: res.statusCode, body: parsed })
        } catch (err) {
          reject(err)
        }
      })
    })

    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

async function addItem(path, payload, label) {
  const result = await request(path, 'POST', payload)
  console.log(`\n[${label}] ${path}`)
  console.log(JSON.stringify(result.body, null, 2))
  if (!result.body || result.body.status !== 'success') {
    throw new Error(`Failed to create ${label}: ${JSON.stringify(result.body)}`)
  }
  return result.body.data.insertId || result.body.data.insertId || result.body.data?.affectedRows
}

async function main() {
  const timestamp = Date.now()

  console.log('Starting dummy data seed to http://localhost:4000')

  const users = [
    { name: `Alice Seed ${timestamp}`, email: `alice.seed.${timestamp}@example.com`, password: 'Password123!', address: '123 Oak Street', phone: '555-1010', role: 'Normal' },
    { name: `Bob Seed ${timestamp}`, email: `bob.seed.${timestamp}@example.com`, password: 'Password123!', address: '456 Pine Avenue', phone: '555-2020', role: 'Normal' }
  ]

  const storeOwners = [
    { name: `Owner One ${timestamp}`, email: `owner.one.${timestamp}@example.com`, password: 'OwnerPass123!', address: '789 Maple Road', phone: '555-3030' },
    { name: `Owner Two ${timestamp}`, email: `owner.two.${timestamp}@example.com`, password: 'OwnerPass123!', address: '101 Elm Lane', phone: '555-4040' }
  ]

  const createdUsers = []
  for (const user of users) {
    const id = await addItem('/users/register', user, `User ${user.name}`)
    createdUsers.push({ ...user, id })
  }

  const createdOwners = []
  for (const owner of storeOwners) {
    const id = await addItem('/store-owners/register', owner, `Store Owner ${owner.name}`)
    createdOwners.push({ ...owner, id })
  }

  const storeData = [
    { owner_id: createdOwners[0].id, store_name: `Seed Store A ${timestamp}`, store_email: `store.a.${timestamp}@example.com`, store_address: '200 Market Street' },
    { owner_id: createdOwners[1].id, store_name: `Seed Store B ${timestamp}`, store_email: `store.b.${timestamp}@example.com`, store_address: '300 Commerce Blvd' }
  ]

  const createdStores = []
  for (const store of storeData) {
    const id = await addItem('/stores/add', store, `Store ${store.store_name}`)
    createdStores.push({ ...store, id })
  }

  const reviews = [
    { user_id: createdUsers[0].id, store_id: createdStores[0].id, rating_value: 5, review_text: 'Excellent service and friendly staff.' },
    { user_id: createdUsers[1].id, store_id: createdStores[0].id, rating_value: 4, review_text: 'Great products, just a little crowded.' },
    { user_id: createdUsers[0].id, store_id: createdStores[1].id, rating_value: 3, review_text: 'Good selection but delivery was slow.' }
  ]

  for (const review of reviews) {
    await addItem('/ratings/add', review, `Rating for store ${review.store_id}`)
  }

  const storesResult = await request('/stores/all', 'GET')
  const ratingsResult = await request('/ratings/list', 'GET')

  console.log('\n[Seed complete] Summary:')
  console.log('Stores:', JSON.stringify(storesResult.body, null, 2))
  console.log('Ratings:', JSON.stringify(ratingsResult.body, null, 2))
}

main().catch((error) => {
  console.error('Seed failed:', error.message)
  process.exit(1)
})
