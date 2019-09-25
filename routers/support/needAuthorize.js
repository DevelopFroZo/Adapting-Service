/*
 *  Error codes:
 *   0 -- пользователь не авторизован
 *   1 -- неверный токен
 */

let express, router;

express = require( "express" );

router = express.Router();

router.post( "*", async ( req, res, next ) => {
  let needAuthorize;

  needAuthorize = [
    "/companies/editEmail",
    "/companies/editPassword",
    "/companies/editCity",
    "/companies/editLogin",
    "/infoBlocks/add",
    "/questions/add",
    "/possibleAnswers/add"
  ];

  if( needAuthorize.indexOf( req.originalUrl ) === -1 ){
    next();

    return;
  }

  if( typeof( req.cookies.token ) === "string" ){
    let id;

    id = await req.db.companies.getCompanyIdByToken( req.cookies.token );

    if( id === null ) res.send( {
      isSuccess : false,
      code : 0,
      message : "Invalid token"
    } );
    else{
      req.companyId = id;
      next();
    }
  }
  else res.send( {
    isSuccess : false,
    code : 1,
    message : "Authorize failed"
  } );
} );

module.exports = router;
