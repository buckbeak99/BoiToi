const passCart = (req, res, next) => {
    let cart;
    if (!req.session.isLoggedIn) {
      cart = null;
    } else {
      cart = req.user.cart;
    }
    return {
      cart: cart,
    };
  };
  
  module.exports = passCart;
  