/*
 *  Error codes:
 *   0 -- пользователь не авторизован
 */

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
    code : 0,
    message : "Authorize failed"
  } );
} );

module.exports = router;
