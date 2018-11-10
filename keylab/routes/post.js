const express = require('express');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');

const { Maincategory, Subcategory, Link, Content, Tag, Comment } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middleware')

const router = express.Router();

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/images/')
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
        }
    }),
    limits: { filesize: 5 * 1024 * 1024 }
});

router.get('/list', async (req, res, next) => {
    try {
        const { name, type } = req.query;

        const [ categories, bookmarks, contents ] = await Promise.all([
            Maincategory.findAll({
                include: {
                    model: Subcategory,
                },
                order: [
                    ['order', 'asc'],
                    [Subcategory, 'order', 'asc']
                ]
            }),
            Link.findAll()
        ]);

        res.render('post/post_list', {
            user: req.user,
            categories,
            bookmarks,
            category_name: name,
            category_type: type,
            number: 1
        });
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.get('/list/:page', async (req, res, next) => {
    try {
        const { types, name } = req.query;
        const page_num = req.params.page;
        let content_data = [];
        let contents;

        if(types === 'main') {
            const category = await Maincategory.find({
                where: { name }
            });

            contents = await Content.findAll({
                where: { maincategoryId: category.id },
                order: [['createdAt', 'DESC']]
            });
        }
        else {
            category = await Subcategory.find({
                where: { name }
            });

            contents = await Content.findAll({
                where: { subcategoryId: category.id },
                order: [['createdAt', 'DESC']]
            });
        }

        const start = 6 * (page_num - 1);
        const content_count = contents.length
        contents = contents.slice(start, start + 6)

        for (const i in contents) {
            const data = fs.readFileSync(contents[i].contents)

            const tmp = data.toString()
                .replace(/<img(.)*\/>/gi, '')
                .replace(/<\/(.)*>/g, '')
                .replace(/<(.)*>/g, '')
                .replace(/&nbsp;/gi, '')
            let summary = tmp.substring(0, 200);

            if(tmp.length > 200) {
                summary += '...';
            }

            content_data.push({
                content: contents[i],
                summary
            });
        }

        res.json({
            content_data,
            content_count
        });
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.get('/write', isLoggedIn, async (req, res, next) => {
    try {
        const [ categories, bookmarks ] = await Promise.all([
            Maincategory.findAll({
                include: {
                    model: Subcategory,
                },
                order: [
                    ['order', 'asc'],
                    [Subcategory, 'order', 'asc']
                ]
            }),
            Link.findAll()
        ]);

        res.render('post/post_write', {
            categories,
            bookmarks,
            user: req.user
        });
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.post('/upload', isLoggedIn, upload.single('upload'), (req, res) => {
    res.json({
        "filename" : req.file.filename, 
        "uploaded" : 1, 
        "url": "/img/" + req.file.filename
    });
});

router.post('/posting', isLoggedIn, async (req, res, next) => {
    try {
        const { category_name, type, editor1, tag_list, title } = req.body;
        let tag;

        // 게시글 내용을 파일로 저장
        const post_path = 'uploads/posts/';
        const file_name = title + new Date().valueOf();

        fs.writeFile(path.join(post_path, file_name), editor1, (err) => {
            if(err) {
                throw err;
            }
        });

        // 태그 리스트 파싱
        if(tag_list) {
            tag = tag_list.split(' ');
        }

        let result;

        if(type === 'main') {
            const category = await Maincategory.find({
                where: { name: category_name }
            });

            result = await Content.create({
                title,
                contents: path.join(post_path, file_name),
                maincategoryId: category.id
            });
        }
        else {
            const category = await Subcategory.find({
                where: { name: category_name}
            });

            result = await Content.create({
                title,
                contents: path.join(post_path, file_name),
                subcategoryId: category.id
            })
        }

        if(tag_list) {
            for (const i in tag) {
                const tag_find = await Tag.find({
                    where: { title: tag[i] }
                });

                if(!tag_find) {
                    const tag_add = await Tag.create({
                        title: tag[i]
                    });

                    result.addTags(tag_add.id)
                }
                else {
                    result.addTags(tag_find.id);
                }
            }
        }

        res.redirect('/manage');       
    }
    catch(error) {
        console.error(error);
        next(error);
    }
})

router.get('/content', async (req, res, next) => {
    try {
        const { content_id, category_title } = req.query;
        
        const [ categories, bookmarks, content, comments ] = await Promise.all([
            Maincategory.findAll({
                include: {
                    model: Subcategory,
                },
                order: [
                    ['order', 'asc'],
                    [Subcategory, 'order', 'asc']
                ]
            }),
            Link.findAll(),
            Content.find({
                where: { id: content_id }
            }),
            Comment.findAll({
                where: { contentId: content_id }
            })
        ]);

        const content_path = content.contents;

        const post = fs.readFileSync(content_path);

        const tags = await content.getTags();

        res.render('post/post_content', {
            categories,
            bookmarks,
            category_title,
            content,
            post,
            tags,
            comments
        });
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.post('/comment', async (req, res, next) => {
    try {
        const { name, password, message, content_id, category_title } = req.body;

        const hash = await bcrypt.hash(password, 12);

        const result = await Comment.create({
            name,
            password: hash,
            contents: message,
            commentType: 'main',
            contentId: content_id
        });

        res.redirect('/post/content?content_id=' + content_id + "&category_title=" + category_title);
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.post('/sub_comment', async (req, res, next) => {
    try {
        const { name, password, message, content_id, category_title, parent_id } = req.body;

        const hash = await bcrypt.hash(password, 12);

        const result = await Comment.create({
            name,
            password: hash,
            contents: message,
            commentType: 'sub',
            contentId: content_id,
            parentId: parent_id
        })
    }
    catch(error) {
        console.error(error);
        next(error);
    }
})

module.exports = router;