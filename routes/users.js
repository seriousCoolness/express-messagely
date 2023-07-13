const express = require("express");
const User = require("../models/user");

const router = new express.Router();

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get("/", async function (req, res, next) {

    return res.json({users: await User.all()});
});


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get("/:username", async function (req, res, next) {

    const { username } = req.params;

    try {
        const user = await User.get(username);

        return res.json({ user: user });
    }
    catch(err) {
        return next(err);
    }
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/to", async function (req, res, next) {

    const { username } = req.params;

    try {
        const messagesTo = await User.messagesTo(username);

        return res.json({ messages: messagesTo });
    }
    catch(err) {
        return next(err);
    }
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/from", async function (req, res, next) {

    const { username } = req.params;

    try {
        const messagesFrom = await User.messagesFrom(username);

        return res.json({ messages: messagesFrom });
    }
    catch(err) {
        return next(err);
    }
});

module.exports = router;