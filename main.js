let gameState = {
  groups: [],
  currentQuestion: 0,
  currentGroup: 0,
  timer: 60,
  timerInterval: null,
  canProceed: false,
  questions: [
    {
      question: "Örnek Soru 1?",
      options: ["A Şıkkı", "B Şıkkı", "C Şıkkı", "D Şıkkı"],
      correct: 0,
      answers: {},
    },
    {
      question: "asdasda?",
      options: ["A Şıkkı", "B Şıkkı", "C Şıkkı", "D Şıkkı"],
      correct: 2,
      answers: {},
    },
    {
      question: "51515151?",
      options: ["A Şıkkı", "B Şıkkı", "C Şıkkı", "D Şıkkı"],
      correct: 2,
      answers: {},
    },
    // ... (more questions)
  ],
};

function showInfo(message, type) {
  const infoBox = document.querySelector(".info-box");
  infoBox.textContent = message;
  infoBox.className = "info-box " + type;
  infoBox.style.display = "block";

  setTimeout(() => {
    infoBox.style.display = "none";
  }, 3000);
}

function updateGroupIndicator() {
  const indicator = document.querySelector(".current-group-indicator");
  indicator.textContent = `Sıra: Grup ${gameState.currentGroup + 1}`;
  indicator.classList.remove("pulse");
  void indicator.offsetWidth; // Trigger reflow
  indicator.classList.add("pulse");
}

function startGame() {
  const groupCount = parseInt(document.getElementById("groupCount").value);
  gameState.groups = Array.from({ length: groupCount }, (_, i) => ({
    id: i + 1,
    score: 0,
  }));

  // Create reset buttons for each group
  const resetButtons = document.querySelector(".group-reset-buttons");
  gameState.groups.forEach((group) => {
    const btn = document.createElement("button");
    btn.className = "group-reset-btn";
    btn.textContent = `G${group.id}`;
    btn.onclick = () => resetGroupAnswer(group.id - 1);
    resetButtons.appendChild(btn);
  });

  document.getElementById("setupScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";

  showInfo("Oyun başladı!", "success");
  updateQuestion();
  startTimer();
}

function resetGroupAnswer(groupIndex) {
  const currentQuestion = gameState.questions[gameState.currentQuestion];

  // Remove group's previous answer
  Object.entries(currentQuestion.answers).forEach(([optionIndex, groups]) => {
    currentQuestion.answers[optionIndex] = groups.filter(
      (g) => g !== groupIndex
    );
  });

  // Remove group marker
  document.querySelectorAll(".group-marker").forEach((marker) => {
    if (marker.textContent === `G${groupIndex + 1}`) {
      marker.remove();
    }
  });

  // Set current group to the reset group
  gameState.currentGroup = groupIndex;
  updateGroupIndicator();
  showInfo(`Grup ${groupIndex + 1} cevabı sıfırlandı`, "warning");
}

function selectAnswer(optionIndex) {
  const currentQuestion = gameState.questions[gameState.currentQuestion];

  // Her grubun sadece bir kez cevap verebilmesini sağlayan kontrol
  const groupAlreadyAnswered = Object.values(currentQuestion.answers).some(
    (groups) => groups.includes(gameState.currentGroup)
  );

  if (groupAlreadyAnswered) {
    showInfo(`Grup ${gameState.currentGroup + 1} zaten cevap verdi`, "warning");
    return;
  }

  // Remove previous answer if exists
  Object.entries(currentQuestion.answers).forEach(([index, groups]) => {
    currentQuestion.answers[index] = groups.filter(
      (g) => g !== gameState.currentGroup
    );
  });

  // Add new answer
  if (!currentQuestion.answers[optionIndex]) {
    currentQuestion.answers[optionIndex] = [];
  }
  currentQuestion.answers[optionIndex].push(gameState.currentGroup);

  // Update UI
  document.querySelectorAll(".group-marker").forEach((marker) => {
    if (marker.textContent === `G${gameState.currentGroup + 1}`) {
      marker.remove();
    }
  });

  const selectedOption = document.querySelectorAll(".option")[optionIndex];
  const groupMarker = document.createElement("div");
  groupMarker.className = "group-marker";
  groupMarker.textContent = `G${gameState.currentGroup + 1}`;
  selectedOption.appendChild(groupMarker);

  // Move to next group
  gameState.currentGroup =
    (gameState.currentGroup + 1) % gameState.groups.length;
  updateGroupIndicator();

  if (gameState.currentGroup === 0) {
    gameState.canProceed = true;
    document.querySelector(".next-question-btn").style.display = "block";
  }

  showInfo(`Grup ${gameState.currentGroup + 1}'in sırası`, "success");
}

function startTimer() {
  const timerBar = document.querySelector(".timer-progress");
  gameState.timer = 60;
  clearInterval(gameState.timerInterval);

  gameState.timerInterval = setInterval(() => {
    gameState.timer--;
    timerBar.style.width = `${(gameState.timer / 60) * 100}%`;

    if (gameState.timer <= 0) {
      clearInterval(gameState.timerInterval);
      showInfo("Süre doldu!", "error");
      handleNextQuestion();
    }
  }, 1000);
}

function handleNextQuestion() {
  if (!gameState.canProceed) {
    showInfo("Lütfen tüm grupların cevap vermesini bekleyin.", "warning");
    return;
  }

  const currentQuestion = gameState.questions[gameState.currentQuestion];
  Object.entries(currentQuestion.answers).forEach(([optionIndex, groups]) => {
    groups.forEach((groupIndex) => {
      if (parseInt(optionIndex) === currentQuestion.correct) {
        gameState.groups[groupIndex].score++;
      }
    });
  });

  gameState.currentQuestion++;
  if (gameState.currentQuestion >= gameState.questions.length) {
    endGame();
  } else {
    gameState.currentGroup = 0;
    gameState.canProceed = false;
    document.querySelector(".next-question-btn").style.display = "none";
    updateQuestion();
    startTimer();
  }
}

function updateQuestion() {
  const currentQuestion = gameState.questions[gameState.currentQuestion];
  document.querySelector(".question").textContent = currentQuestion.question;

  const options = document.querySelectorAll(".option");
  options.forEach((option, index) => {
    option.textContent = currentQuestion.options[index];
    option.className = "option";
  });

  document
    .querySelectorAll(".group-marker")
    .forEach((marker) => marker.remove());
}

function endGame() {
  clearInterval(gameState.timerInterval);
  document.getElementById("gameScreen").style.display = "none";
  const scoreScreen = document.getElementById("scoreScreen");
  scoreScreen.style.display = "block";

  const resultList = gameState.groups
    .map((group) => `<p>Grup ${group.id}: ${group.score} puan</p>`)
    .join("");
  scoreScreen.innerHTML = `<h1>Oyun Bitti!</h1>${resultList}<button onclick="location.reload()">Yeniden Başlat</button>`;
}
