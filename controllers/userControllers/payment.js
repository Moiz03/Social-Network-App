/* eslint-disable camelcase */
/* eslint-disable consistent-return */
const dotenv = require('dotenv');
const User = require('../../models/User');
// eslint-disable-next-line import/order
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// to access .env variables
dotenv.config();

// payment function
const paymentUser = async (req, res) => {
  try {
    // CASE HANDEL : if user not found
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json('User not found');
    }

    // CASE HANDLEL: if user already paid for Feed
    if (user.subscribed) {
      return res.status(409).json('User already paid for content');
    }

    // creating strip customer
    const customer = await stripe.customers.create({
      name: req.body.customerName,
      email: req.body.customerEmail,
    });

    // creating stripe token
    const card_Token = await stripe.tokens.create({
      card: {
        name: req.body.cardName,
        number: req.body.cardNumber,
        exp_month: req.body.expMonth,
        exp_year: req.body.expYear,
        cvc: req.body.cvc,
      },
    });

    // creating payment source for customer by stripe
    const card = await stripe.customers.createSource(customer.id, {
      source: `${card_Token.id}`,
    });

    // charing cusomter for feed
    await stripe.charges.create({
      amount: 5 * 100, // $5
      currency: 'usd',
      card: card.id,
      customer: customer.id,
      description: 'Feed Content Payment',
    });

    // updating user information that user paid for Feed
    await User.findByIdAndUpdate(req.body.userId, {
      subscribed: true,
    });

    // return success message with userName who paid for Feed
    res.status(200).json({
      message: 'Payment is done successfully',
      user: { userName: user.userName },
    });
  } catch (err) {
    // catching error
    if (err.statusCode === '402') {
      // payment failed error throw by Stripe
      return res.status(402).json('Payment Failed');
    }
    // server error
    return res.status(500).json('Internal Error');
  }
};

// exporting function
module.exports = { paymentUser };
