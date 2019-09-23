let express, router;

express = require( "express" );

router = express.Router();

router.post( "*", ( req, res, next ) => {
  if( "token" in req.cookies && req.cookies.token !== "" ){
    req.token = req.cookies.token;
    next();
  }
  else res.send( {
    isSuccess : false,
    message : "Пользователь не авторизован"
  } );
} );

module.exports = router;
