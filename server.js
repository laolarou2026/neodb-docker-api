const express = require('express')
const axios = require('axios')
const app = express()

const PORT = 3000
const NEODB_TOKEN = process.env.NEODB_TOKEN
const NEODB_API = 'https://neodb.social/api'

const headers = {
  Authorization: `Bearer ${NEODB_TOKEN}`
}

// 搜索书籍（兼容 Talebook 豆瓣格式）
app.get('/v2/book/search', async (req, res) => {
  try {
    const q = req.query.q
    const { data } = await axios.get(`${NEODB_API}/search`, {
      headers,
      params: { q, category: 'book' }
    })

    const books = data.results.map(b => ({
      id: b.uuid,
      title: b.title,
      author: b.authors || [],
      publisher: b.publisher || '',
      pubdate: b.pub_date || '',
      isbn: b.isbn || '',
      image: b.cover_image_url || '',
      summary: b.brief || '',
      rating: { average: b.rating || '0' }
    }))

    res.json({ count: books.length, books })
  } catch (e) {
    res.json({ count: 0, books: [] })
  }
})

// ISBN 查询（Talebook 必用）
app.get('/v2/book/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn
    const { data } = await axios.get(`${NEODB_API}/search`, {
      headers,
      params: { q: isbn, category: 'book' }
    })
    if (data.results.length === 0) return res.status(404).json({})
    const b = data.results[0]
    res.json({
      id: b.uuid,
      title: b.title,
      author: b.authors || [],
      publisher: b.publisher || '',
      pubdate: b.pub_date || '',
      isbn: b.isbn || isbn,
      image: b.cover_image_url || '',
      summary: b.brief || '',
      rating: { average: b.rating || '0' }
    })
  } catch (e) {
    res.status(500).json({})
  }
})

// 书籍详情
app.get('/v2/book/:id', async (req, res) => {
  try {
    const { data } = await axios.get(`${NEODB_API}/item/${req.params.id}`, { headers })
    res.json({
      id: data.uuid,
      title: data.title,
      author: data.authors || [],
      publisher: data.publisher || '',
      pubdate: data.pub_date || '',
      isbn: data.isbn || '',
      image: data.cover_image_url || '',
      summary: data.brief || '',
      rating: { average: data.rating || '0' }
    })
  } catch (e) {
    res.status(500).json({})
  }
})

app.listen(PORT, () => {
  console.log(`NeoDB proxy running on port ${PORT}`)
})
