import faunadb from 'faunadb'
import { Router } from 'itty-router'
import { getFaunaError } from './utils'

const router = Router()

const faunaClient = new faunadb.Client({
  secret: FAUNA_SECRET,
})

const { Create, Collection, Get, Ref, Paginate, Documents } = faunadb.query

router.post('/products', async req => {
  try {
    const { serialNumber, title, weightLbs } = await req.json()

    const result = await faunaClient.query(
      Create(Collection('Products'), {
        data: {
          serialNumber,
          title,
          weightLbs,
          quantity: 0,
        },
      }),
    )

    return new Response(
      JSON.stringify({
        productId: result.ref.id,
      }),
    )
  } catch (error) {
    const faunaError = getFaunaError(error)
    return new Response(JSON.stringify(faunaError), {
      status: faunaError.status,
    })
  }
})

router.get('/products/:productId', async req => {
  try {
    const { productId } = req.params

    const start = Date.now()

    const result = await faunaClient.query(
      Get(Ref(Collection('Products'), productId)),
    )

    const time = Date.now() - start

    return new Response(JSON.stringify({ ...result.data, time }))
  } catch (error) {
    console.log(error)
    const faunaError = getFaunaError(error)

    return new Response(JSON.stringify(faunaError), {
      status: faunaError.status,
    })
  }
})

router.get('/products', async req => {
  try {
    const start = Date.now()

    const result = await faunaClient.query(
      Paginate(Documents(Collection('Products'))),
    )

    const time = Date.now() - start

    return new Response(JSON.stringify({ ...result.data, time }))
  } catch (error) {
    console.log(error)
    const faunaError = getFaunaError(error)

    return new Response(JSON.stringify(faunaError), {
      status: faunaError.status,
    })
  }
})

router.get('/favicon.ico', () => new Response('hello'))
router.get('/', () => new Response('hello'))

addEventListener('fetch', event => {
  event.respondWith(router.handle(event.request))
})
