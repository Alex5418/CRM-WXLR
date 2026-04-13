const cloudbase = require('@cloudbase/node-sdk')

const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV })
const db = app.database()
const _ = db.command

// ===== Router =====

exports.main = async (event) => {
  const { path, httpMethod, body: rawBody, queryStringParameters: query, headers } = event
  const method = httpMethod || event.method || 'GET'
  const body = typeof rawBody === 'string' ? JSON.parse(rawBody || '{}') : (rawBody || {})

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return respond(204, null, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
  }

  try {
    // Match route: /resource or /resource/:id
    const segments = path.replace(/^\//, '').split('/').filter(Boolean)
    const resource = segments[0]
    const id = segments[1]

    const handlers = { customers, projects, contracts, progress_logs, label_orders, staff }
    const handler = handlers[resource]
    if (!handler) return respond(404, { error: `Unknown resource: ${resource}` })

    return await handler(method, id, body, query)
  } catch (err) {
    console.error(err)
    return respond(500, { error: err.message })
  }
}

function respond(status, data, extraHeaders = {}) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...extraHeaders,
    },
    body: JSON.stringify(data),
  }
}

// ===== Customers =====

async function customers(method, id, body, query) {
  const col = db.collection('customers')

  if (method === 'GET' && !id) {
    const filter = {}
    if (query?.status) filter.status = query.status
    if (query?.search) {
      filter[_.or([
        { company_name: db.RegExp({ regexp: query.search, options: 'i' }) },
        { short_name: db.RegExp({ regexp: query.search, options: 'i' }) },
        { contact_person: db.RegExp({ regexp: query.search, options: 'i' }) },
      ])]
    }
    let q = col.where(filter)
    if (query?.search) {
      q = col.where(_.or([
        { company_name: db.RegExp({ regexp: query.search, options: 'i' }) },
        { short_name: db.RegExp({ regexp: query.search, options: 'i' }) },
        { contact_person: db.RegExp({ regexp: query.search, options: 'i' }) },
      ]))
      if (query?.status) {
        q = col.where(_.and([
          { status: query.status },
          _.or([
            { company_name: db.RegExp({ regexp: query.search, options: 'i' }) },
            { short_name: db.RegExp({ regexp: query.search, options: 'i' }) },
            { contact_person: db.RegExp({ regexp: query.search, options: 'i' }) },
          ]),
        ]))
      }
    }
    const { data } = await q.limit(100).get()
    return respond(200, data)
  }

  if (method === 'GET' && id) {
    const { data } = await col.doc(id).get()
    return respond(200, data[0] || null)
  }

  if (method === 'POST') {
    const now = new Date().toISOString()
    const doc = { ...body, created_at: now, updated_at: now }
    const { id: newId } = await col.add(doc)
    return respond(201, { _id: newId, ...doc })
  }

  if (method === 'PUT' && id) {
    const now = new Date().toISOString()
    await col.doc(id).update({ ...body, updated_at: now })
    return respond(200, { _id: id, ...body, updated_at: now })
  }

  if (method === 'DELETE' && id) {
    await col.doc(id).remove()
    return respond(200, { deleted: true })
  }

  return respond(405, { error: 'Method not allowed' })
}

// ===== Projects =====

async function projects(method, id, body, query) {
  const col = db.collection('projects')

  if (method === 'GET' && !id) {
    const filter = {}
    if (query?.customer_id) filter.customer_id = query.customer_id
    if (query?.stage) filter.stage = query.stage
    if (query?.owner_id) filter.owner_id = query.owner_id
    if (query?.biz_type) filter.biz_type = query.biz_type
    const { data } = await col.where(filter).limit(100).get()
    return respond(200, data)
  }

  if (method === 'GET' && id) {
    const { data } = await col.doc(id).get()
    return respond(200, data[0] || null)
  }

  if (method === 'POST') {
    const now = new Date().toISOString()
    const doc = { ...body, created_at: now, updated_at: now }
    const { id: newId } = await col.add(doc)
    return respond(201, { _id: newId, ...doc })
  }

  if (method === 'PUT' && id) {
    const now = new Date().toISOString()
    await col.doc(id).update({ ...body, updated_at: now })
    return respond(200, { _id: id, ...body, updated_at: now })
  }

  if (method === 'DELETE' && id) {
    await col.doc(id).remove()
    return respond(200, { deleted: true })
  }

  return respond(405, { error: 'Method not allowed' })
}

// ===== Contracts =====

async function contracts(method, id, body, query) {
  const col = db.collection('contracts')

  if (method === 'GET' && !id) {
    const filter = {}
    if (query?.customer_id) filter.customer_id = query.customer_id
    if (query?.project_id) filter.project_id = query.project_id
    const { data } = await col.where(filter).limit(100).get()
    return respond(200, data)
  }

  if (method === 'GET' && id) {
    const { data } = await col.doc(id).get()
    return respond(200, data[0] || null)
  }

  if (method === 'POST') {
    const now = new Date().toISOString()
    const doc = { ...body, created_at: now }
    const { id: newId } = await col.add(doc)
    return respond(201, { _id: newId, ...doc })
  }

  if (method === 'PUT' && id) {
    await col.doc(id).update(body)
    return respond(200, { _id: id, ...body })
  }

  if (method === 'DELETE' && id) {
    await col.doc(id).remove()
    return respond(200, { deleted: true })
  }

  return respond(405, { error: 'Method not allowed' })
}

// ===== Progress Logs =====

async function progress_logs(method, id, body, query) {
  const col = db.collection('progress_logs')

  if (method === 'GET' && !id) {
    const filter = {}
    if (query?.customer_id) filter.customer_id = query.customer_id
    if (query?.project_id) filter.project_id = query.project_id
    const { data } = await col.where(filter).orderBy('created_at', 'desc').limit(100).get()
    return respond(200, data)
  }

  if (method === 'POST') {
    const now = new Date().toISOString()
    const doc = { ...body, created_at: now }
    const { id: newId } = await col.add(doc)
    return respond(201, { _id: newId, ...doc })
  }

  return respond(405, { error: 'Method not allowed' })
}

// ===== Staff =====

async function staff(method, id, body, query) {
  const col = db.collection('staff')

  if (method === 'GET' && !id) {
    const { data } = await col.limit(100).get()
    return respond(200, data)
  }

  if (method === 'GET' && id) {
    const { data } = await col.doc(id).get()
    return respond(200, data[0] || null)
  }

  if (method === 'POST') {
    const now = new Date().toISOString()
    const doc = { ...body, created_at: now }
    const { id: newId } = await col.add(doc)
    return respond(201, { _id: newId, ...doc })
  }

  if (method === 'PUT' && id) {
    await col.doc(id).update(body)
    return respond(200, { _id: id, ...body })
  }

  return respond(405, { error: 'Method not allowed' })
}

// ===== Label Orders =====

async function label_orders(method, id, body, query) {
  const col = db.collection('label_orders')

  if (method === 'GET' && !id) {
    const filter = {}
    if (query?.customer_id) filter.customer_id = query.customer_id
    const { data } = await col.where(filter).orderBy('order_date', 'desc').limit(100).get()
    return respond(200, data)
  }

  if (method === 'POST') {
    const now = new Date().toISOString()
    const total_amount = (body.unit_price || 0) * (body.quantity || 0)
    const doc = { ...body, total_amount, created_at: now }
    const { id: newId } = await col.add(doc)
    return respond(201, { _id: newId, ...doc })
  }

  return respond(405, { error: 'Method not allowed' })
}
