const AuthService = require('../auth/auth-service');

function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';

  let basicToken;
  if (!authToken.toLowerCase().startsWith('basic ')) {
    return res.status(401).json({ error: 'Missing basic token' });
  } else {
    // slice out 'basic' from authToken
    basicToken = authToken.slice('basic '.length, authToken.length);
  }

  // convert basicToken from base64 to string and rip username & password
  const [tokenUserName, tokenPassword] = AuthService.parseBasicToken(basicToken);

  // reject if no username or password
  if (!tokenUserName || !tokenPassword) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }

  AuthService.getUserWithUserName(
    req.app.get('db'),
    tokenUserName
  )
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized request' });
      }

      return AuthService.comparePasswords(tokenPassword, user.password)
        .then(passwordsMatch => {
          if(!passwordsMatch) {
            return res.status(401).json({ error: 'Unauthorized request' });
          }
          req.user = user;
          next();
        })
    })
    .catch(next);

}

module.exports = {
  requireAuth,
};