const express = require("express");
const User = require("../models/user");
const Message = require("../models/message");

const { ensureCorrectUser } = require("../middleware/auth");
const ExpressError = require("../expressError");

const router = new express.Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", ensureCorrectUser, async function (req, res, next) {
    const id = req.params.id;
    const id_message = await Message.get(id);
    if(req.user.username == id_message.from_user.username || req.user.username == id_message.to_user.username)
    {
        return res.json({message: id_message});
    }
    throw new ExpressError("Unauthorized.", 401);
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

module.exports = router;