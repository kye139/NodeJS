const express = require('express');
const { Maincategory, Subcategory, Link, Notice} = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const categories = await Maincategory.findAll({        
            order: [['order']],
            include: {
                model: Subcategory,
                order: [['order']]
            }
        });
        const bookmarks  = await Link.findAll();

        const notices = await Notice.findAll({
            limit: 5
        })

        res.render('index', {
            categories,
            bookmarks,
            notices,
            user: req.user
        });
    }
    catch(error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;