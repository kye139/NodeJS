const express = require('express');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');

const { Maincategory, Subcategory, Link, Content, Tag, Comment, sequelize } = require('../models');
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

// 포스트 목록의 레이아웃 페이지 요청 - 
router.get('/list', async (req, res, next) => {
    try {
        const { name, type } = req.query; // name : 카테고리의 이름, type : 카테고리의 타입

        // 레이아웃 설정을 위한 Promise
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

        res.render('post/post_list', {
            user: req.user,
            categories,
            bookmarks,
            category_name: name,
            category_type: type
        });
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

// 포스트 목록의 각 페이지에 대한 포스트들 요청 (ajax)
router.get('/list/:page', async (req, res, next) => {
    try {
        const { types, name } = req.query; // name: 카테고리 이름, types: 카테고리 타입(main/sub)

        const page_num = req.params.page; // page_num : 현재 페이지
        let content_data = [];
        let contents;

        // 해당 카테고리에 대한 포스트 목록들
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

        const start = 6 * (page_num - 1); // 페이지네이션을 위한 포스트 목록들 중 출력 시작 인덱스
        const content_count = contents.length // 전체 포스트의 갯수
        contents = contents.slice(start, start + 6) // 출력할 포스트 목록들 추출 ( 현재: 6개 출력 )

        // 각 포스트의 내용에 대한 요약을 추출
        for (const i in contents) {
            const data = fs.readFileSync(contents[i].contents)

            // 파일의 내용에서 태그들만 제거
            const tmp = data.toString()
                .replace(/<img(.)*\/>/gi, '')
                .replace(/<\/(.)*>/g, '')
                .replace(/<(.)*>/g, '')
                .replace(/&nbsp;/gi, '')

            // 태그가 제거된 내용들에 대해 최대 200자까지만 추출
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
            content_data, // 포스트 + 요약
            content_count, // 전체 포스트의 갯수
        });
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});


// 게시글 작성 페이지 요청 라우터
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

// 이미지 파일 업로드에 대한 multer 처리. -> uploads/images 폴더에 이미지를 저장
router.post('/upload', isLoggedIn, upload.single('upload'), (req, res) => {
    res.json({
        "filename" : req.file.filename, 
        "uploaded" : 1, 
        "url": "/img/" + req.file.filename
    });
});

// 게시글 업로드 요청 라우터
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

        // 해당 카테고리에 대한 포스트 목록들
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
});

router.get('/editing', isLoggedIn, async (req, res, next) => {
    try {
        const { content_id, category_title } = req.query;

        const [ categories, bookmarks, content ] = await Promise.all([
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
        ]);

        const file_content = fs.readFileSync(content.contents);

        const tags = await content.getTags();

        let tag_list = '';

        for (const i in tags) {
            tag_list += tags[i].title + ' ';
        }

        tag_list = tag_list.trim();

        res.render('post/post_edit', {
            categories,
            bookmarks,
            id: content.id,
            title: content.title,
            content: file_content,
            tag_list,
            category_title
        });
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.post('/editing', isLoggedIn, async (req, res, next) => {
    try {
        const { id, title, editor1, tag_list, category_title } = req.body;

        const result = await Content.find({
            where: { id }
        });

        if(result) {
            const post_path = 'uploads/posts/';
            const file_name = title + new Date().valueOf();

            fs.writeFile(path.join(post_path, file_name), editor1, (err) => {
                if(err) {
                    throw err;
                }
            });

            const upd = await Content.update({
                title,
                contents: path.join(post_path, file_name),
            }, {
                where: { id }
            })

            // 태그 리스트 파싱
            if(tag_list) {
                console.log(tag_list)
                tag = tag_list.split(' ');

                for (const i in tag) {
                    console.log(tag[i]);
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

                const db_tag_list = await result.getTags();

                console.log(tag);
                console.log(db_tag_list);

                for(const i in db_tag_list) {
                    // db의 태그 리스트에 존재하지 않는 경우
                    if(tag.indexOf(db_tag_list[i].dataValues.title) < 0) {
                        Tag.find({
                            where: { title: db_tag_list[i].dataValues.title }
                        })
                            .then(function(db_tag) {
                                // 연결 목록이 하나만 남은 경우
                                db_tag.getContents()
                                    .then(function(db_contents) {
                                        if(db_contents.length == 1) {
                                            Tag.destroy({
                                                where: { title: db_tag_list[i].dataValues.title }
                                            });
                                        }
                                        else {
                                            sequelize.query('DELETE FROM contenttag WHERE contentId=? and tagId=?', { 
                                                replacements: [ parseInt(id), db_tag.id ]
                                            });     
                                        }
                                    })
                                    .catch((error) => {
                                        throw error;
                                    });
                            })
                            .catch(function(error) {
                                throw error;
                            })
                    }
                }
                res.redirect('/post/content?content_id=' + id + "&category_title=" + category_title);
            }

        }
        else {
            res.redirect('/')
        }
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.get('/deleting', isLoggedIn, async (req, res, next) => {
    try {
        const { content_id, category_title, category_name } = req.query;

        const result = await Content.find({
            where: { id: content_id }
        });

        const tag = await result.getTags();

        for (const i in tag) {
            const tag_contents = await tag[i].getContents();

            sequelize.query('DELETE FROM contenttag WHERE contentId=? and tagId=?', { 
                replacements: [ parseInt(content_id), tag[i].dataValues.id ]
            });

            if(tag_contents.length == 1) {
                await Tag.destroy({
                    where: { id: tag[i].dataValues.id }
                });
            }
        }

        await Content.destroy({
            where: { id: content_id }
        });

        res.redirect('/post/list?name=' + category_name + '&type=' + category_title);
    }   
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.get('/content', async (req, res, next) => {
    try {
        const { content_id, category_title, category_name } = req.query;
        
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

        // const img = post.match(/<img(.)*\/>/gi);
        const img = post.toString().match(/height="\d+"/gi);
        let height = 0;

        for (const i in img) {
            console.log('aaa' + img[i]);
        }

        const tags = await content.getTags();

        res.render('post/post_content', {
            categories,
            bookmarks,
            category_title,
            category_name,
            content,
            post,
            tags,
            comments,
            user: req.user
        });
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.get('/comment', async (req, res, next) => {
    try {
        const { id } = req.query;

        const result = await Comment.findAll({
            where: { contentId: id },
            order: [['parentId', 'ASC'], ['createdAt', 'DESC']]
        });

        res.json(result);
    }
    catch(error) {
        console.error(error);
        next(error);
    }
})

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

        res.redirect('/post/content?content_id=' + content_id + "&category_title=" + category_title);
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.post('/comment/edit/:id', async (req, res, next) => {
    try {
        const { password, message, content_id, category_title } = req.body;
        const comment_id = req.params.id

        console.log(message);

        let comment = await Comment.find({
            where: { id: comment_id }
        });

        const result = await bcrypt.compare(password, comment.password);

        if(result) {
            comment = await Comment.update({
                contents: message
            }, {
                where: { id: comment_id }
            });

            res.json(1);
        }
        else {
            res.json(0);
        }
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.post('/comment/del/:id', async (req, res, next) => {
    try {
        const { password, content_id, category_title } = req.body;
        const comment_id = req.params.id;

        let comment = await Comment.find({
            where: { id: comment_id }
        });

        const result = await bcrypt.compare(password, comment.password);

        if(result) {
            comment = await Comment.destroy({
                where: { id: comment_id }
            });

            res.json(1);
        }
        else {
            res.json(0);
        }
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});



module.exports = router;