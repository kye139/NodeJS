const express = require('express');

const { isLoggedIn } = require('./middleware');
const { Maincategory, Subcategory, Link, Notice } = require('../models');

const router = express.Router();

router.get('/list/:num', async (req, res, next) => {
    try {
        const [ categories, bookmarks, notices ] = await Promise.all([
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
            Notice.findAll({
                order: [['createdAt', 'DESC']]
            })
        ]);

        const start = 15 * (req.params.num - 1);
        
        res.render('notice/notice_list', {
            user: req.user,
            categories,
            bookmarks,
            notices : notices.slice(start, start + 15),
            notice_count: notices.length,
            number: req.params.num
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

        res.render('notice/write_notice', {
            categories,
            bookmarks
        });
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.get('/post/:id', async (req, res, next) => {
    try {
        const [ categories, bookmarks, notice ] = await Promise.all([
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
            Notice.find({
                where: { id: req.params.id }
            })
        ]);
        
        res.render('notice/notice', {
            categories,
            bookmarks,
            notice,
            user: req.user,
        });
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.post('/write', isLoggedIn, async (req, res, next) => {
    try {
        const { title, editor1 } = req.body;
        const result = await Notice.create({
            title,
            contents: editor1
        });
        res.redirect('/notice/post/' + result.id)
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.get('/edit/:id', isLoggedIn, async (req, res, next) => {
    try {
        const [ categories, bookmarks, notice ] = await Promise.all([
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
            Notice.find({
                where: { id: req.params.id }
            })
        ]);

        res.render('notice/notice_edit', {
            categories,
            bookmarks,
            notice
        })
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.post('/edit', isLoggedIn, async (req, res, next) => {
    try {
        const { id, title, editor1 } = req.body;
        const result = await Notice.update({
            title,
            contents: editor1,
        }, {
            where: { id }
        });

        res.redirect('/notice/post/' + id);
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

router.get('/delete/:id', isLoggedIn, async (req, res, next) => {
    try {
        console.log(req.params.id);
        const result = await Notice.destroy({
            where: { id: req.params.id }
        });
        
        res.redirect('/notice/list/1');
    }
    catch(error) {
        console.error(error);
        next(error);
    }
})

module.exports = router;