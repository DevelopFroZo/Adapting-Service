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
    "/companies/edit",
    "/companies/getInfo",

    "/infoBlocks/add",
    "/infoBlocks/delete",
    "/infoBlocks/getAll",
    "/infoBlocks/edit",

    "/questions/add",
    "/questions/delete",
    "/questions/edit",

    "/possibleAnswers/add",
    "/possibleAnswers/delete",
    "/possibleAnswers/edit",

    "/tests/get",

    "/workers/create",
    "/workers/delete",
    "/workers/getAll",
    "/workers/subscribe",
    "/workers/unsubscribe",
    "/workers/getSubscribers"
  ];

  if( needAuthorize.indexOf( req.originalUrl ) === -1 ){
    next();

    return;
  }

  if( typeof( req.cookies.token ) === "string" ){
    let id;

    id = await req.db.companies.getCompanyIdByToken( req.cookies.token );

    if( id === null ) res.send( {
      ok : false,
      code : 11,
      message : "Invalid token"
    } );
    else{
      req.companyId = id;
      next();
    }
  }
  else res.send( {
    ok : false,
    code : 11,
    message : "Invalid token"
  } );
} );

module.exports = router;
