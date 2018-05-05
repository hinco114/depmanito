const mainErrorHandler = async (err, req, res, next) => {
  try {
    // TODO: Separate log level by Winston.
    switch (err.status) {
      case 400:
        console.log('----------------------------------------------------------------------');
        console.log(`[${new Date().toLocaleString()}] Client argument error with 400`);
        console.log('----------------------------------------------------------------------');
        break;
      case 401:
        // TODO : Add a Client IP.
        console.log('No Authorized');
        break;
      case 404:
        console.log(`Client request Error : 404 (${req.baseURI})`);
        break;
      default:
        console.log('Internal Server Error');
        err.status = 500;
        break;
    }
    if (global.env === 'development') {
      console.log(err);
    }
    res.status(err.status);
    res.json({
      message: err.message,
    });
  } catch (internalError) {
    // TODO: Separate log level by Winston.
    console.log('Unexpected Error Occured');
  }
};

module.exports = mainErrorHandler;
