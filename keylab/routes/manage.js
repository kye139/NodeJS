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
        const { list_category } = req.body;
        const list = JSON.parse(list_category);

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
                    console.log( i + 'main : update')
                    const upd = await Maincategory.update({
                        order: parseInt(i) + 1
                    }, {
                        where: { name }
                    });
                }
                // 카테고리가 새로운 카테고리인 경우
                else {
                    console.log( i + 'main : create')
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
                    console.log( i + 'sub : update')
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
                        console.log( i + 'sub : create')
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
        console.log(name + ":" + type);
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

        console.log(result);
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
})

module.exports = router;