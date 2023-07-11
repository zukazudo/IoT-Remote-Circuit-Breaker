const async = require('async');

const Current = require('../models/current');
const Machine = require('../models/machine');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecret = "ef0b6ef366eaae1dd9166f08dc83d8b3a6c0e9bf2f644986d13eceda44b70b2c060f1d";

const User = require('../models/user');

exports.login_get = function(req, res) {
  res.render("login", {
    title: "Remote Circuit Breaker",
  })
};
exports.login_post = function(req, res) {
  try{
    const { username, password } = req.body;
    
    User.findOne( {username: username}, (err, user) => {
      if(err) {
        return err;
      }
      if(user == null) {
        res.send('failed to login');
        return;
      }
      bcrypt.compare(password, user.password, (err, result) => {
        if(result) {
          const maxAge = 3 * 60 * 60;
          const token = jwt.sign(
            {id: user._id, username},
            jwtSecret,
            { expiresIn: maxAge },
          );
          res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000,  //in milli seconds
          });
          // res.send("successfully logged in");
          res.redirect("/");
          return;
        }
        else {
          return res.status(401).send("couldnt login");
        }
      });
    });
  }
  catch(error) {
    return res.status(401).send(error.message);
  }
};
exports.signup_get = function(req, res) {
  res.render("register_form", {
    title: "Register new user",
  });
};
exports.signup_post = async(req, res) => {
  const {username, password} = req.body;
  try {
    const user_exists = await User.findOne({username: username});

    if(user_exists) {
      res.send("user already exists");
      return;
    }

    const salt_rounds = 10;
    bcrypt.hash(password, salt_rounds, (err, hash) => {
      if(err) {
        throw new Error("Internal server error");
      }
      let user = new User({
        username: username,
        password: hash,
      });
      user.save((err) => {
        if(err) {
          console.log(err.message)
          res.render("result_page", {
            title: "Could not create user",
            error: err,
          });
          return;
        }
        // proceed with json web token
        const maxAge = 3 * 60 * 60; //3hrs in seconds
        const token = jwt.sign(
          {id: user._id, username},
          jwtSecret,
          { expiresIn: maxAge}
        );
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: maxAge * 1000,  //3hrs in ms
        });

        res.render("result_page", {
          title: "User created successfully",
        })
      })
    });
  }
  catch(error) {
    return res.status(401).send(error.message);
  }
};
exports.show_users = function(req, res) {
  User.find({}, (err, result) => {
    if(err) {
      throw err;
    }
    res.render("all_users", {
      title: "All Users",
      results: result,
    });
  });
};
exports.delete_user = function(req, res) {
  User.deleteOne({_id: req.params.id}, (err, obj) => {
    if(err) {
      res.render("result_page", {
        title: "IoT Industrial Data Logger",
        message: "Could not delete Users",
        error: true,
      });
      return;
    }
    res.redirect("/users");
  });
};
exports.delete_users = function(req, res) {
  User.deleteMany({}, (err, obj) => {
    if(err) {
      res.render("result_page", {
        title: "Remote Circuit Breaker",
        message: "Could not delete Users",
        error: true,
      });
      return;
    }
    res.render("result_page", {
      title: "Remote Circuit Breaker",
      message: "Users deleted Successfully",
      error: false,
    });
  });
};
exports.index = function(req, res) {
  res.render("index", {
    title: "Remote Circuit Breaker",
  });
};
exports.show_records = function(req, res) {
  async.parallel(
    {
      current(callback) {
        Current.find().exec(callback);
      },
      machine(callback) {
        Machine.find().exec(callback);
      }
    },
    (err, results) => {
      if(err) {
        return next(err);
      }
      res.render("all_records", {
        title: "Current Values Data",
        current_values: results.current,
        machine_state: results.machine[0].state,
      });
    }
  );
};
exports.data_get = function(req, res) {
  const max_current = 0.6;
  const currentValue = req.params.current;
  const currentState = currentValue > max_current ? 'short' : 'normal';
  var d = new Date();

  const new_current = new Current({
    value: currentValue,
    state: currentState,
    date: d.toLocaleString(),
  });

  new_current.save( (err) => {
    if(err) {
      res.status(401).send(err.message);
      return;
    }
    res.send('success');
  });
};
exports.delete_data = function(req, res) {
  Current.deleteMany({}, (err, obj) => {
    if(err) {
      res.render("delete_result", {
        title: "Failed to delete dat",
        error: err,
      });
      return;
    }
    res.render("delete_result", {
      title: "Data deleted successfully",
    });
  });
};
exports.toggle_state = function(req, res) {
  Machine.findOne({}, (err, result) => {
    if(err) {
      throw err;
    }
    const machine_state = result.state;
    const new_machine_state = machine_state == 'on' ? 'off' : 'on';
    result.state = new_machine_state;
    result.save( (err) => {
      if(err) {
        throw err;
      }
      res.send(new_machine_state);
    });
  });
};
exports.create_machine = function(req, res) {
  const new_machine = new Machine({
    state: "on",
  });
  new_machine.save( (err) => {
    if(err) {
      throw err;
    }
    else {
      res.send("success");
    }
  });
};
exports.get_state = function(req, res) {
  Machine.findOne({}, (err, result) => {
    if(err) {
      throw err;
    }
    res.send(result.state);
  });
};
