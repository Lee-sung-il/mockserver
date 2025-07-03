const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;
const DATA_PATH = path.join(__dirname, 'posts.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 데이터 초기화
let postId = 1;
let posts = [];

// 서버 시작 시 posts.json 로딩
if (fs.existsSync(DATA_PATH)) {
    const fileData = fs.readFileSync(DATA_PATH, 'utf-8');
    posts = JSON.parse(fileData);
    if (posts.length > 0) {
        postId = Math.max(...posts.map(p => p.id)) + 1;
    }
}

// 파일에 저장하는 함수
const savePostsToFile = () => {
    fs.writeFileSync(DATA_PATH, JSON.stringify(posts, null, 2), 'utf-8');
};

app.post('/api/v1/community/posts/', (req, res) => {
    const data = req.body;
    console.log('📥 받은 게시글:', data);

    const response = {
        id: postId++,
        category: {
            id: data.category_id,
            name: data.category?.name || data.category_name || '',
        },
        author_id: 1,
        title: data.title,
        content: data.content,
        view_count: 0,
        is_visible: true,
        is_notice: false,
        attachments: data.attachments,
        images: data.images,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    posts.push(response);
    savePostsToFile();

    res.status(201).json(response);
});

app.get('/api/v1/community/posts', (req, res) => {
    res.json(posts);
});


app.get('/api/v1/community/posts/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const post = posts.find(p => p.id === id);
    if (!post) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    res.json(post);
});

// 게시글 수정
app.put('/api/v1/community/posts/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = posts.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ message: '수정할 게시글을 찾을 수 없습니다.' });
    }

    const data = req.body;

    const updatedPost = {
        ...posts[index],
        title: data.title,
        content: data.content,
        category: {
            id: data.category_id,
            name: data.category?.name || data.category_name || '',
        },
        attachments: data.attachments || [],
        images: data.images || [],
        updated_at: new Date().toISOString(),
    };

    posts[index] = updatedPost;
    savePostsToFile();

    res.json(updatedPost);
});

app.listen(PORT, () => {
    console.log(`✅ Mock 서버 실행 중: http://localhost:${PORT}`);
});