class Auth {
  static getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  static isLoggedIn() {
    return this.getCurrentUser() !== null;
  }

  static login(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  static logout() {
    localStorage.removeItem('currentUser');
  }

  static requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.hash = '#/login';
      return false;
    }
    return true;
  }

  static getUserId() {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }
}

export default Auth;