const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const catchAsync = require('../utils/catchAsync');


router.route('/')
    .get(catchAsync( campgrounds.index ))
    .post(isLoggedIn, validateCampground, catchAsync( campgrounds.createCampground ));

router.get('/new', isLoggedIn, campgrounds.renderNewForm );

router.get('/:id', catchAsync( campgrounds.showCampground ));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync( campgrounds.renderEditForm ));

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync( campgrounds.updateCampground ));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync( campgrounds.deleteCampground ));

module.exports = router;