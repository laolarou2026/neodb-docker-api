const express = require('express');
const axios = require('axios');
const app = express();

const PORT = 3000;
const NEODB_TOKEN = process.env.NEODB_TOKEN;
const BASE_URL = "https://neodb.social/api";

const headers = {
  Authorization: `Bearer ${NEODB_TOKEN}`
};

// 搜索书籍
app.get('/v2/book/search', async (req, res) => {
  try {
    const q = req.query.q;
    const r = await axios.get(`${BASE_URL}/search?category=book&q=${q}`, { headers });
    res.json({
      count: r.data.results.length,
      books: r.data.results.map(i => ({
        id: i.uuid,
        title: i.title,
        author: i.authors || [],
        publisher: i.publisher || '',
        pubdate: i.pub_date || '',
        isbn: i.isbn || '',
        image: i.cover_image_url || '',
        summary: i.brief || '',
        rating: { average: i.rating || 0 }
      }))
    });
  } catch (e) {
    res.json({ count: 0, books: [] });
  }
});

// ISBN 查询
app.get('/v2/book/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const r = await axios.get(`${BASE_URL}/search?q=${isbn}&category=book`, { headers });
    if (!r.data.results.length) return res.status(404).json({});
    const i = r.data.results[0];
    res.json({
      id: i.uuid,
      title: i.title,
      author: i.authors || [],
      publisher: i.publisher || '',
      pubdate: i.pub_date || '',
      isbn: i.isbn || isbn,
      image: i.cover_image_url || '',
      summary: i.brief || '',
      rating: { average: i.rating || 0 }
    });
  } catch (e) {
    res.status(500).json({});
  }
});

// 书籍详情
app.get('/v2/book/:id', async (req, res) => {
  try {
    const r = await axios.get(`${BASE_URL}/item/${req.params.id}`, { headers });
    const i = r.data;
    res.json({
      id: i.uuid,
      title: i.title,
      author: i.authors || [],
      publisher: i.publisher || '',
      pubdate: i.pub_date || '',
      isbn: i.isbn || '',
      image: i.cover_image_url || '',
      summary: i.brief || '',
      rating: { average: i.rating || 0 }
    });
  } catch (e) {
    res.status(500).json({});
  }
});

app.listen(PORT, () => {
  console.log("NeoDB API 代理运行在端口 3000");
});
