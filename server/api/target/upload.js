
var multer = require('multer');

function rcv() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
			multer
      User.findById(req.user._id, function (err, user) {
        if (err) return next(err);
        if (!user) return res.send(401);

        req.user = user;
        next();
      });
    });
