$(function () {
  const users = [
    { email: "alex.johnson@northeastern.edu", password: "Password123!" },
    { email: "jordan.lee@northeastern.edu", password: "Password123!" }
  ];
  const $email = $("#email");
  const $password = $("#password");
  const $loginButton = $("#login-button");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateEmail() {
    const email = $email.val().trim();
    const isValid = emailPattern.test(email) && email.toLowerCase().endsWith("@northeastern.edu");
    $("#email-error").text(isValid ? "" : "Please enter a valid Northeastern email");
    $email.attr("aria-invalid", String(!isValid));
    return isValid;
  }

  function validatePassword() {
    const password = $password.val();
    let error = "";
    if (!password) {
      error = "Password is required";
    } else if (password.length < 8) {
      error = "Password must be at least 8 characters";
    }
    $("#password-error").text(error);
    $password.attr("aria-invalid", String(Boolean(error)));
    return error === "";
  }

  function updateLoginButton() {
    const emailIsValid = validateEmail();
    const passwordIsValid = validatePassword();
    $loginButton.prop("disabled", !(emailIsValid && passwordIsValid));
  }

  $email.on("keyup blur", updateLoginButton);
  $password.on("keyup blur", updateLoginButton);
  $email.add($password).on("focus", function () {
    $(this).siblings(".field-error").text("");
    $("#login-error").text("");
  });

  $("#login-form").on("submit", function (event) {
    event.preventDefault();
    const emailIsValid = validateEmail();
    const passwordIsValid = validatePassword();
    if (!emailIsValid || !passwordIsValid) {
      updateLoginButton();
      return;
    }

    const email = $email.val().trim().toLowerCase();
    const user = users.find(function (candidate) {
      return candidate.email === email && candidate.password === $password.val();
    });

    if (!user) {
      $("#login-error").text("Invalid email or password");
      $("#login-success").text("");
      return;
    }

    const session = {
      username: user.email.split("@")[0],
      email: user.email,
      loginTimestamp: new Date().toISOString(),
      isLoggedIn: true
    };
    const rememberMe = $("#remember-me").is(":checked");
    const targetStorage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    otherStorage.removeItem("calculatorSession");
    targetStorage.setItem("calculatorSession", JSON.stringify(session));

    $("#login-error").text("");
    $("#login-success").text("Sign in successful. Opening your calculator...");
    $loginButton.prop("disabled", true);
    $("#login-form").stop(true).fadeTo(180, 0.65);
    window.setTimeout(function () {
      window.location.href = "calculator.html";
    }, 2000);
  });
});
