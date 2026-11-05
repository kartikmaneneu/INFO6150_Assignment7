$(function () {
  function readSession() {
    const rawSession = sessionStorage.getItem("calculatorSession") || localStorage.getItem("calculatorSession");
    if (!rawSession) {
      return null;
    }
    try {
      const session = JSON.parse(rawSession);
      return session && session.isLoggedIn === true && typeof session.username === "string" ? session : null;
    } catch (error) {
      console.error("Could not read the calculator session.", error);
      return null;
    }
  }

  const session = readSession();
  if (!session) {
    sessionStorage.removeItem("calculatorSession");
    localStorage.removeItem("calculatorSession");
    window.location.replace("login.html");
    return;
  }

  $("#welcome-message").text("Welcome, " + session.username + "!");

  const calculate = (num1, num2, operation) => {
    switch (operation) {
      case "add":
        return num1 + num2;
      case "subtract":
        return num1 - num2;
      case "multiply":
        return num1 * num2;
      case "divide":
        return num2 === 0 ? null : num1 / num2;
      default:
        return null;
    }
  };

  function parseNumber(value) {
    const trimmed = value.trim();
    if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed)) {
      return null;
    }
    const number = Number(trimmed);
    return Number.isFinite(number) ? number : null;
  }

  $(".operation-button").on("click", function () {
    const firstValue = parseNumber($("#number-1").val());
    const secondValue = parseNumber($("#number-2").val());
    const $firstError = $("#number-1-error");
    const $secondError = $("#number-2-error");
    $firstError.text(firstValue === null ? "Please enter a valid number" : "");
    $secondError.text(secondValue === null ? "Please enter a valid number" : "");
    $("#number-1").add("#number-2").attr("aria-invalid", "false");
    if (firstValue === null) {
      $("#number-1").attr("aria-invalid", "true");
    }
    if (secondValue === null) {
      $("#number-2").attr("aria-invalid", "true");
    }
    if (firstValue === null || secondValue === null) {
      $("#result").val("");
      $("#calculation-error").text("");
      return;
    }

    const value = calculate(firstValue, secondValue, $(this).data("operation"));
    if (value === null || !Number.isFinite(value)) {
      $("#result").val("");
      $("#calculation-error").text("Cannot divide by zero.");
      return;
    }
    $("#calculation-error").text("");
    $("#result").val(String(Number(value.toPrecision(12))));
  });

  $("#number-1, #number-2").on("focus", function () {
    $(this).siblings(".field-error").text("");
    $(this).attr("aria-invalid", "false");
  });

  $("#logout-button").on("click", function () {
    sessionStorage.removeItem("calculatorSession");
    localStorage.removeItem("calculatorSession");
    $("body").fadeOut(250, function () {
      window.location.replace("login.html");
    });
  });
});
