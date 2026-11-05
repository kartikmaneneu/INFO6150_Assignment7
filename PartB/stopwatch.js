$(function () {
  const STORAGE_KEY = "eventStopwatchSessions";
  const $date = $("#event-date");
  const $eventName = $("#event-name");
  const $timerDisplay = $("#timer-display");
  const $startButton = $("#start-button");
  const $pauseButton = $("#pause-button");
  const $stopButton = $("#stop-button");
  const $resetButton = $("#reset-button");
  const $timerStatus = $("#timer-status");
  let intervalId = null;
  let elapsedSeconds = 0;
  let startedAt = null;
  let activeEvent = null;
  let isRunning = false;
  let notificationTimeout = null;

  const today = new Date();
  $date.val([
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-"));

  function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map(function (value) {
      return String(value).padStart(2, "0");
    }).join(":");
  }

  function showNotification(message, kind) {
    const $notification = $("#notification");
    window.clearTimeout(notificationTimeout);
    $notification.removeClass("notification-error notification-success")
      .addClass(kind === "error" ? "notification-error" : "notification-success")
      .text(message)
      .prop("hidden", false)
      .stop(true, true)
      .fadeIn(160);
    notificationTimeout = window.setTimeout(function () {
      $notification.fadeOut(200, function () {
        $notification.prop("hidden", true);
      });
    }, 3200);
  }

  function validateDate() {
    const value = $date.val();
    const dateParts = /^\d{4}-(\d{2})-(\d{2})$/.exec(value || "");
    const parsedDate = dateParts ? new Date(value + "T00:00:00") : null;
    const isValid = Boolean(parsedDate) &&
      parsedDate.getFullYear() === Number(value.slice(0, 4)) &&
      parsedDate.getMonth() + 1 === Number(dateParts[1]) &&
      parsedDate.getDate() === Number(dateParts[2]);
    $("#date-error").text(isValid ? "" : "Please select a date");
    $date.attr("aria-invalid", String(!isValid));
    return isValid;
  }

  function validateEventName() {
    const value = $eventName.val().trim();
    let error = "";
    if (!value) {
      error = "Event name is required";
    } else if (value.length < 3) {
      error = "Event name must be at least 3 characters";
    } else if (value.length > 100) {
      error = "Event name too long (max 100 characters)";
    } else if (!/^[A-Za-z0-9 '-]+$/.test(value)) {
      error = "Event name contains invalid characters";
    }
    $("#event-error").text(error);
    $eventName.attr("aria-invalid", String(Boolean(error)));
    return error === "";
  }

  async function validateEventDetails() {
    const dateIsValid = validateDate();
    const eventNameIsValid = validateEventName();
    return dateIsValid && eventNameIsValid;
  }

  function readSessions() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const sessions = JSON.parse(raw);
    if (!Array.isArray(sessions) || sessions.some(function (session) {
      return !session || typeof session.eventName !== "string" ||
        typeof session.date !== "string" ||
        !Number.isInteger(session.durationSeconds) || session.durationSeconds < 0;
    })) {
      throw new Error("Saved session data has an unexpected format.");
    }
    return sessions;
  }

  async function saveSessions(sessions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }

  function updateDisplay() {
    $timerDisplay.text(formatDuration(elapsedSeconds));
  }

  function updateControls() {
    const hasActiveEvent = activeEvent !== null;
    $date.prop("disabled", hasActiveEvent);
    $eventName.prop("disabled", hasActiveEvent);
    $startButton.prop("disabled", hasActiveEvent);
    $pauseButton.prop("disabled", !hasActiveEvent);
    $pauseButton.text(hasActiveEvent && !isRunning ? "Resume" : "Pause");
    $stopButton.prop("disabled", !hasActiveEvent);
    $resetButton.prop("disabled", !hasActiveEvent && elapsedSeconds === 0);
  }

  function updateClock() {
    if (startedAt !== null) {
      elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      updateDisplay();
    }
  }

  function startInterval() {
    startedAt = Date.now() - elapsedSeconds * 1000;
    isRunning = true;
    intervalId = window.setInterval(updateClock, 250);
    updateControls();
    $timerStatus.text("Timer running for “" + activeEvent.eventName + "”.");
  }

  async function startTimer() {
    if (activeEvent || !(await validateEventDetails())) {
      return;
    }
    activeEvent = { date: $date.val(), eventName: $eventName.val().trim() };
    elapsedSeconds = 0;
    updateDisplay();
    startInterval();
  }

  function pauseTimer() {
    if (!activeEvent) {
      return;
    }
    if (isRunning) {
      updateClock();
      window.clearInterval(intervalId);
      intervalId = null;
      startedAt = null;
      isRunning = false;
      $timerStatus.text("Timer paused.");
    } else {
      startInterval();
    }
    updateControls();
  }

  function clearIntervalIfRunning() {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
    startedAt = null;
    isRunning = false;
  }

  async function stopAndSave() {
    if (!activeEvent) {
      return;
    }
    if (isRunning) {
      updateClock();
    }
    clearIntervalIfRunning();
    const session = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      date: activeEvent.date,
      eventName: activeEvent.eventName,
      durationSeconds: elapsedSeconds,
      savedAt: new Date().toISOString()
    };
    try {
      const sessions = await Promise.resolve(readSessions());
      sessions.push(session);
      await saveSessions(sessions);
      activeEvent = null;
      updateControls();
      $timerStatus.text("Session saved.");
      renderHistory();
      showNotification("Your session was saved.", "success");
    } catch (error) {
      console.error("Could not save stopwatch session.", error);
      $timerStatus.text("The session could not be saved. Your timer is stopped; try again or reset.");
      showNotification("Could not save this session. Check browser storage and try again.", "error");
      activeEvent = session;
      updateControls();
    }
  }

  function resetTimer() {
    clearIntervalIfRunning();
    activeEvent = null;
    elapsedSeconds = 0;
    updateDisplay();
    updateControls();
    $timerStatus.text("Timer reset. No session was saved.");
  }

  function renderHistory() {
    let sessions;
    try {
      sessions = readSessions();
    } catch (error) {
      console.error("Could not read stopwatch session history.", error);
      showNotification("Saved history could not be read. Clear the corrupted browser data to continue.", "error");
      $("#total-sessions").text("Unavailable");
      $("#total-time").text("Unavailable");
      $("#clear-history-button").prop("disabled", false);
      $("#history-list").empty().append($("<p>").addClass("empty-state").text("History is unavailable because its saved data is invalid."));
      return;
    }
    const filterDate = $("#history-date-filter").val();
    const sortedSessions = sessions.slice().sort(function (first, second) {
      return new Date(second.savedAt || second.date).getTime() - new Date(first.savedAt || first.date).getTime();
    });
    const visibleSessions = filterDate ? sortedSessions.filter(function (session) {
      return session.date === filterDate;
    }) : sortedSessions;
    const $list = $("#history-list").empty();

    $("#total-sessions").text(String(sessions.length));
    $("#total-time").text(formatDuration(sessions.reduce(function (total, session) {
      return total + session.durationSeconds;
    }, 0)));
    $("#clear-history-button").prop("disabled", sessions.length === 0);

    if (sessions.length === 0) {
      $list.append($("<p>").addClass("empty-state").text("No sessions recorded yet."));
      return;
    }
    if (visibleSessions.length === 0) {
      $list.append($("<p>").addClass("empty-state").text("No sessions match this date."));
      return;
    }

    visibleSessions.forEach(function (session) {
      const $item = $("<article>").addClass("history-item");
      const $details = $("<div>").addClass("history-details");
      $("<time>").attr("datetime", session.date).text(session.date).appendTo($details);
      $("<h3>").text(session.eventName).appendTo($details);
      $("<span>").addClass("duration-label").text("Duration").appendTo($item);
      $("<strong>").addClass("history-duration").text(formatDuration(session.durationSeconds)).appendTo($item);
      $item.append($details);
      $list.append($item);
    });
  }

  function closeClearModal() {
    $("#clear-modal").fadeOut(120, function () {
      $(this).prop("hidden", true);
    });
    $("#clear-history-button").trigger("focus");
  }

  $startButton.on("click", startTimer);
  $pauseButton.on("click", pauseTimer);
  $stopButton.on("click", stopAndSave);
  $resetButton.on("click", resetTimer);

  $date.add($eventName).on("focus", function () {
    $(this).siblings(".field-error").text("");
  });
  $date.on("blur change", validateDate);
  $eventName.on("keyup blur", validateEventName);
  $("#history-date-filter").on("change", renderHistory);
  $("#clear-filter-button").on("click", function () {
    $("#history-date-filter").val("");
    renderHistory();
  });

  $("#clear-history-button").on("click", function () {
    $("#clear-modal").prop("hidden", false).hide().fadeIn(150);
    $("#cancel-clear-button").trigger("focus");
  });
  $("#cancel-clear-button").on("click", closeClearModal);
  $("#confirm-clear-button").on("click", async function () {
    try {
      await saveSessions([]);
      renderHistory();
      closeClearModal();
      showNotification("Session history cleared.", "success");
    } catch (error) {
      console.error("Could not clear stopwatch session history.", error);
      showNotification("Could not clear history. Check browser storage and try again.", "error");
    }
  });
  $("#clear-modal").on("click", function (event) {
    if (event.target === this) {
      closeClearModal();
    }
  });
  $(document).on("keydown", function (event) {
    if (event.key === "Escape" && !$("#clear-modal").prop("hidden")) {
      closeClearModal();
    }
  });

  updateControls();
  renderHistory();
});
