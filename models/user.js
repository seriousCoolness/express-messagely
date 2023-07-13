/** User class for message.ly */

const db = require("../db");

const moment = require("moment");

const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */

class User {

  constructor({ username, first_name, last_name, phone })
  {
    this.username = username;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phone = phone;
  }

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {

    //create our hashed password
    const password_hashed = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(`INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING username, password, first_name, last_name, phone`,
      [username, password_hashed, first_name, last_name, phone, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ssZ')]);
    
      return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      "SELECT password FROM users WHERE username = $1",
      [username]);
    let user = result.rows[0];

    if(user) {
      if(await bcrypt.compare(password, user.password) === true)
      {
        return true;
      }
    }
    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    try {
      const result = await db.query(`UPDATE users SET last_login_at=$1 WHERE username=$2`,
      [moment().format('YYYY-MM-DD HH:mm:ssZ'), username]);
    }
    catch(err) {
      err.status = 404;
      throw err;
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    try {
      const result = await db.query(`SELECT username, first_name, last_name, phone FROM users`);

      return result.rows.map(u => new User(u));
    }
    catch(err)
    {
      err.status = 404;
      throw err;
    }
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 

    const result = await db.query(`SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users WHERE username=$1`,
    [username]);

    const user = result.rows[0];
    if(user === undefined)
    {
      const err = new Error(`No such user with username: ${username}`)
      err.status = 404;
      throw err;
    }

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    const result = await db.query(
      `SELECT 
        messages.id, 
          users.username, 
          users.first_name, 
          users.last_name, 
          users.phone, 
        messages.body, 
        messages.sent_at, 
        messages.read_at 
      FROM messages JOIN users 
      ON messages.to_username=users.username 
      WHERE messages.from_username=$1`, 
      [username]);
    
    return result.rows.map((row) => {
      return {
        id: row.id,
        to_user: {
          username: row.username,
          first_name: row.first_name,
          last_name: row.last_name,
          phone: row.phone
        },
        body: row.body,
        sent_at: row.sent_at,
        read_at: row.read_at
      };
    });
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {

    const result = await db.query(
      `SELECT 
        messages.id, 
          users.username, 
          users.first_name, 
          users.last_name, 
          users.phone, 
        messages.body, 
        messages.sent_at, 
        messages.read_at 
      FROM messages JOIN users 
      ON messages.from_username=users.username 
      WHERE messages.to_username=$1`, 
      [username]);
    
    return result.rows.map((row) => {
      return {
        id: row.id,
        from_user: {
          username: row.username,
          first_name: row.first_name,
          last_name: row.last_name,
          phone: row.phone
        },
        body: row.body,
        sent_at: row.sent_at,
        read_at: row.read_at
      };
    });

  }
}


module.exports = User;