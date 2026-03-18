// module.exports=(fn)=>{
//     return (req , res , next)=>{
//       Promise.resolve( fn(req , res , next).ctach(next)); 
//     }
// }
module.exports = fn => {
  return (req, res, next) => {
    try {
      const result = fn(req, res, next);
      // if fn returned a promise, handle rejections
      Promise.resolve(result).catch(next);
    } catch (err) {
      // if fn threw synchronously (like new Listing(…)),
      // forward the error as well
      next(err);
    }
  };
};