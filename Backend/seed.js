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
    // If your result utility uses status: 'success', keep this. 
    // Otherwise, check for existence of data.
    if (result.body && result.body.error) throw new Error(`Failed to create ${label}: ${result.body.error}`)
  }
  // NOTE: If using UUIDs, your backend routes MUST be updated to return the new ID 
  // because 'insertId' only works for auto-increment integers.
  return result.body.data.insertId || result.body.data.id
}

async function main() {
  // Added padding to names to satisfy the 20-character CHECK constraint in schema
  const timestamp = Date.now().toString().slice(-5)
  console.log('Starting dummy data seed to http://localhost:4000')

  const users = [
    { name: `Alice Seed User Account ${timestamp}`, email: `alice.seed.${timestamp}@example.com`, password: 'Password123!', address: '123 Oak Street', phone: '1234567890', role: 'Normal' },
    { name: `Bob Seed User Account ${timestamp}`, email: `bob.seed.${timestamp}@example.com`, password: 'Password123!', address: '456 Pine Avenue', phone: '0987654321', role: 'Normal' },
    { name: `Charlie Seed User Account ${timestamp}`, email: `charlie.seed.${timestamp}@example.com`, password: 'Password123!', address: '789 Walnut Way', phone: '1122334455', role: 'Normal' }
  ]

  const storeOwners = [
    { name: `Store Owner Primary Account ${timestamp}`, email: `owner.one.${timestamp}@example.com`, password: 'OwnerPass123!', address: '789 Maple Road', phone: '5551112222', role: 'Store Owner' },
    { name: `Store Owner Secondary Account ${timestamp}`, email: `owner.two.${timestamp}@example.com`, password: 'OwnerPass123!', address: '101 Elm Lane', phone: '5553334444', role: 'Store Owner' },
    { name: `Store Owner Tertiary Account ${timestamp}`, email: `owner.three.${timestamp}@example.com`, password: 'OwnerPass123!', address: '202 Birch Blvd', phone: '5556667777', role: 'Store Owner' }
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
    // Aligning keys with the /stores/add route in store.js
    { owner_id: createdOwners[0].id, store_name: `Premium Seed Store A ${timestamp}`, store_email: `store.a.${timestamp}@example.com`, store_address: '200 Market Street' },
    { owner_id: createdOwners[1].id, store_name: `Quality Seed Store B ${timestamp}`, store_email: `store.b.${timestamp}@example.com`, store_address: '300 Commerce Blvd' },
    { owner_id: createdOwners[2].id, store_name: `Gourmet Foods Store C ${timestamp}`, store_email: `store.c.${timestamp}@example.com`, store_address: '500 Culinary Court' }
  ]

  const createdStores = []
  for (const store of storeData) {
    const id = await addItem('/stores/add', store, `Store ${store.store_name}`)
    createdStores.push({ ...store, id })
  }

  const reviews = [
    // Removed review_text as it is not in the schema
    { user_id: createdUsers[0].id, store_id: createdStores[0].id, rating_value: 5 },
    { user_id: createdUsers[1].id, store_id: createdStores[0].id, rating_value: 4 },
    { user_id: createdUsers[0].id, store_id: createdStores[1].id, rating_value: 3 },
    { user_id: createdUsers[2].id, store_id: createdStores[0].id, rating_value: 5 },
    { user_id: createdUsers[2].id, store_id: createdStores[2].id, rating_value: 4 },
    { user_id: createdUsers[1].id, store_id: createdStores[2].id, rating_value: 2 }
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
