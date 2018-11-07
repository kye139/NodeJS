const express = require('express');

const { Maincategory, Subcategory, Link, Content } = require('../models');

const router = express.Router();

router.get('/:id/list', async (req, res, next) => {
    try {
        const [ categories, bookmarks, contents ] = await Promise.all([
            Maincategory.findAll({
                order: [['order']],
                include: {
                    model: Subcategory,
                    order: [['order']]
                }
            }),
            Link.findAll(),
            Content.findAll({
                order: [['createdAt', 'DESC']]
            })
        ]);

        const start = 8 * (req.query.num - 1);
        
        res.render('post/post_list', {
            user: req.user,
            categories,
            bookmarks,
            contents : contents.slice(start, start + 8),
            content_count: contents.length,
            number: req.query.num
        });     
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;