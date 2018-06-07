var router = require("express").Router();
router.get('/', function (req, res) {
	res.render('activity/index.html');
});
router.get('/notice', function (req, res) {
	res.render('activity/layout.html',require("./src/mock/sample"));
});
router.get('/registers', function (req, res) {
	res.render('activity/layout.html',require("./src/mock/regist"));
});
router.get('/codes', function (req, res) {
	res.render('activity/layout.html',require("./src/mock/code"));
});
router.get('/alerts', function (req, res) {
	res.render('activity/layout.html',require("./src/mock/alerts"));
});

router.get('/alerts_img', function (req, res) {
	res.render('activity/layout.html',require("./src/mock/alerts"));
});
router.get('/buttons', function (req, res) {
	res.render('activity/layout.html',require("./src/mock/buttons"));
});

router.get('/forms', function (req, res) {
	res.render('activity/layout.html',require("./src/mock/forms"));
});

router.get('/zp', function (req, res) {
	res.render('activity/layout.html',require("./src/mock/turnplate"));
});
router.get('/rolling', function (req, res) {
	res.render('activity/layout.html',require("./src/mock/rolling"));
});
router.get('/float', function (req, res) {
	res.render('activity/layout.html',require("./src/mock/float"));
});
router.get('/scratch', function (req, res) {
	res.render('activity/layout.html',require("./src/mock/scratch"));
});
module.exports = router;
