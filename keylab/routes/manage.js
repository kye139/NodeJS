const express = require('express');
const { isLoggedIn } = require('./middleware');

const { Maincategory, Subcategory, Link } = require('../models')

const router = express.Router();

router.get('/', isLoggedIn, async (req, res, next) => {
    try {
        const [ categories, bookmarks ] = await Promise.all([
            Maincategory.findAll({        
                order: [['order']],
                include: {
                    model: Subcategory,
                    order: [['order']]
                }
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

module.exports = router;