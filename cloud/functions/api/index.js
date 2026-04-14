const cloudbase = require('@cloudbase/node-sdk')
const COS = require('cos-nodejs-sdk-v5')

const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV })
const db = app.database()
const _ = db.command

// COS config — bucket name from CloudBase storage
const COS_BUCKET = '6d79-my-test-env-0gif1eyrbc6d63e1-1375988356'
const COS_REGION = 'ap-shanghai'

function getCOS() {
  return new COS({
    SecretId: process.env.TENCENTCLOUD_SECRETID,
    SecretKey: process.env.TENCENTCLOUD_SECRETKEY,
    SecurityToken: process.env.TENCENTCLOUD_SESSIONTOKEN,
  })
}

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

    // Auth route: /auth/login
    if (resource === 'auth' && id === 'login' && method === 'POST') {
      return await authLogin(body)
    }

    // File routes: /files/presign, /files/url, /files/delete, /files/setup-cors
    if (resource === 'files') {
      if (id === 'presign' && method === 'POST') return await filePresign(body)
      if (id === 'url' && method === 'POST') return await fileGetURL(body)
      if (id === 'delete' && method === 'POST') return await fileDelete(body)
      if (id === 'setup-cors' && method === 'POST') return await fileSetupCORS()
      return respond(404, { error: 'Unknown file action' })
    }

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

// ===== Files =====

async function filePresign(body) {
  const { cloudPath } = body
  if (!cloudPath) return respond(400, { error: '缺少 cloudPath' })

  const cos = getCOS()
  return new Promise((resolve) => {
    cos.getObjectUrl({
      Bucket: COS_BUCKET,
      Region: COS_REGION,
      Key: cloudPath,
      Method: 'PUT',
      Sign: true,
      Expires: 600, // 10 minutes
    }, (err, data) => {
      if (err) {
        resolve(respond(500, { error: err.message }))
      } else {
        // Construct CloudBase fileID
        const fileID = `cloud://${process.env.TCB_ENV}.${COS_BUCKET}/${cloudPath}`
        resolve(respond(200, { uploadURL: data.Url, fileID }))
      }
    })
  })
}

async function fileGetURL(body) {
  const { fileList } = body
  if (!fileList || !fileList.length) {
    return respond(400, { error: '缺少 fileList' })
  }
  const res = await app.getTempFileURL({ fileList })
  return respond(200, { fileList: res.fileList })
}

async function fileDelete(body) {
  const { fileList } = body
  if (!fileList || !fileList.length) {
    return respond(400, { error: '缺少 fileList' })
  }
  await app.deleteFile({ fileList })
  return respond(200, { deleted: true })
}

async function fileSetupCORS() {
  const cos = getCOS()
  return new Promise((resolve) => {
    cos.putBucketCors({
      Bucket: COS_BUCKET,
      Region: COS_REGION,
      CORSRules: [{
        AllowedOrigins: ['*'],
        AllowedMethods: ['GET', 'PUT', 'POST', 'HEAD'],
        AllowedHeaders: ['*'],
        MaxAgeSeconds: 86400,
      }],
    }, (err) => {
      if (err) {
        resolve(respond(500, { error: err.message }))
      } else {
        resolve(respond(200, { success: true, message: 'CORS configured' }))
      }
    })
  })
}

// ===== Helpers =====

function stripPin(staff) {
  const { pin, ...rest } = staff
  return rest
}

// ===== Auth =====

async function authLogin(body) {
  const { staff_id, pin } = body
  if (!staff_id || !pin) {
    return respond(400, { error: '请输入员工和PIN码' })
  }

  const { data } = await db.collection('staff').doc(staff_id).get()
  const user = data[0]
  if (!user) return respond(404, { error: '员工不存在' })
  if (!user.is_active) return respond(403, { error: '该账号已停用' })
  if (user.pin !== pin) return respond(401, { error: 'PIN码错误' })

  // Return staff info without pin
  const { pin: _pin, ...safeUser } = user
  return respond(200, safeUser)
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
    return respond(200, data.map(stripPin))
  }

  if (method === 'GET' && id) {
    const { data } = await col.doc(id).get()
    return respond(200, data[0] ? stripPin(data[0]) : null)
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

  if (method === 'PUT' && id) {
    const total_amount = (body.unit_price || 0) * (body.quantity || 0)
    await col.doc(id).update({ ...body, total_amount })
    return respond(200, { _id: id, ...body, total_amount })
  }

  if (method === 'DELETE' && id) {
    await col.doc(id).remove()
    return respond(200, { deleted: true })
  }

  return respond(405, { error: 'Method not allowed' })
}
