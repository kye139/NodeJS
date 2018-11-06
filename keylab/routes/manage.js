const express = require('express');
const { isLoggedIn } = require('./middleware');

const { Maincategory, Subcategory, Link, Content } = require('../models')

const router = express.Router();

router.get('/', isLoggedIn, async (req, res, next) => {
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

        res.render('menu/manage', {
            categories,
            bookmarks
        })
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.post('/cate', isLoggedIn, async (req, res, next) => {
    try {
        const { list_category, delete_list } = req.body;
        const del = JSON.parse(delete_list);
        const list = JSON.parse(list_category);

        for (const i in del) {
            const name = del[i].name;
            const type = del[i].type;

            if(type === 'main') {
                const result = await Maincategory.destroy({
                    where: { name }
                })
            }
            else {
                const result = await Subcategory.destroy({
                    where: { name }
                })
            }
        }

        for (const i in list) {
            const name = list[i].name;
            const parent = list[i].parent;

            // 메인카테고리의 경우
            if(list[i].type === 'main') {
                const result = await Maincategory.find({
                    where: { name }
                });
                // 카테고리가 기존에 존재했던 경우
                if(result) {
                    const upd = await Maincategory.update({
                        order: parseInt(i) + 1
                    }, {
                        where: { name }
                    });
                }
                // 카테고리가 새로운 카테고리인 경우
                else {
                    const upd = await Maincategory.create({
                        name,
                        order: parseInt(i) + 1
                    });
                }
            }
            // 서브카테고리의 경우
            else {
                const result = await Subcategory.find({
                    where: { name }
                });
                // 카테고리가 기존에 존재했던 경우
                if(result) {
                    const upd = await Subcategory.update({
                        order: parseInt(i) + 1
                    }, {
                        where: { name }
                    });
                }
                // 서브카테고리가 새로운 카테고리인 경우
                else {
                    const parent_id = await Maincategory.find({
                        where: { name: parent }
                    });
                    if (parent_id){
                        const upd = await Subcategory.create({
                            name,
                            order: parseInt(i) + 1,
                            maincategoryId: parent_id.id
                        });
                    }
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

router.get('/del', isLoggedIn, async (req, res, next) => {
    try {
        const { name, type } = req.query;
        let result;
        if(type === 'main') {
            result = await Maincategory.find({
                where: { name },
                include: {
                    model: Content
                }
            });
        }
        else {
            result = await Subcategory.find({
                where: { name },
                include: {
                    model: Content
                }
            });
        }

        if(!result || result.contents.length == 0) {
            res.status(200).json(0)
        }
        else {
            res.status(200).json(1)
        }
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.post('/bookmark', isLoggedIn, async (req, res, next) => {
    try {
        const { bookmark_name, bookmark_url } = req.body;

        const result = await Link.find({
            where: { title: bookmark_name }
        });

        if(result) {
            return res.json({
                isSuccess: false,
                errorMessage: '중복된 이름을 사용할 수 없습니다.'
            });
        };

        await Link.create({
            title: bookmark_name,
            URL: bookmark_url
        });

        return res.json({
            isSuccess: true
        });

    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;