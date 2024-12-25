let gameState = {
  groups: [],
  currentQuestion: 0,
  currentGroup: 0,
  timer: 60,
  timerInterval: null,
  canProceed: false,
  questions: [
    {
      question: "Dünya'nın en büyük okyanusu nedir?",
      options: ["Pasifik", "Atlantik", "Hint", "Arktik"],
      correct: 0,
      answers: {},
    },
    {
      question: "Python hangi yıl ortaya çıktı??",
      options: ["1989", "1991", "2000", "2010"],
      correct: 1,
      answers: {},
    },
    {
      question: "Türkiye'nin başkenti hangisidir?",
      options: ["İstanbul", "İzmir", "Ankara", "Antalya"],
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
  // Doğru şıkka renk ver
  const currentQuestion = gameState.questions[gameState.currentQuestion];
  const correctOption =
    document.querySelectorAll(".option")[currentQuestion.correct];
  correctOption.classList.add("correct-answer");

  // Skor güncellemesi
  const correctGroups = [];
  Object.entries(currentQuestion.answers).forEach(([optionIndex, groups]) => {
    if (parseInt(optionIndex) === currentQuestion.correct) {
      correctGroups.push(...groups);
    }
  });

  if (correctGroups.length > 0) {
    correctGroups.forEach((groupIndex) => {
      gameState.groups[groupIndex].score++;
    });
  }

  updateScoreDisplay();

  // 2 saniye sonra bir sonraki soruya geç
  setTimeout(() => {
    correctOption.classList.remove("correct-answer");

    gameState.currentQuestion++;
    if (gameState.currentQuestion >= gameState.questions.length) {
      endGame();
    } else {
      gameState.currentGroup = 0;
      gameState.canProceed = false;
      document.querySelector(".next-question-btn").style.display = "none";
      clearScoreDisplay();
      updateQuestion();
      startTimer();
    }
  }, 2000);
}

function updateScoreDisplay() {
  const scoreDisplay = document.querySelector(".score-board");
  if (scoreDisplay) {
    scoreDisplay.innerHTML = gameState.groups
      .map(
        (group) =>
          `<div class="score-item"><b class="score-item-bold">Grup ${group.id}:</b>  ${group.score} Puan</div>`
      )
      .join("");
  }
}

function clearScoreDisplay() {
  const scoreDisplay = document.querySelector(".score-display");
  if (scoreDisplay) {
    scoreDisplay.innerHTML = ""; // Skor ekranını temizle
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

  // Skor tablosu güncelleme
  const scoreDisplay = document.querySelector(".score-display");
  if (scoreDisplay) {
    scoreDisplay.innerHTML = gameState.groups
      .map(
        (group) =>
          `<div class="score-item">Grup ${group.id}: ${group.score} Puan</div>`
      )
      .join("");
  }
}

function updateScoreBoard() {
  const scoreBoard = document.querySelector(".score-board");
  scoreBoard.innerHTML = gameState.groups
    .map(
      (group) =>
        `<div class="score-item">Grup ${group.id}: ${group.score} Puan</div>`
    )
    .join("");
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

  // Grupları puana göre sırala
  const sortedGroups = gameState.groups.sort((a, b) => b.score - a.score);

  // İlk 3 grubu ayrı işle, geri kalanları farklı
  const topThreeGroups = sortedGroups.slice(0, 3);
  const otherGroups = sortedGroups.slice(3);

  const topThreeHTML = `
    <div class="podium">
      ${
        topThreeGroups[1]
          ? `
        <div class="podium-item silver">
          <div class="rank">2</div>
          <div class="group-name">${topThreeGroups[1].id}. Grup</div>
          <div class="group-score">${topThreeGroups[1].score} Puan</div>
        </div>
      `
          : ""
      }
      
      ${
        topThreeGroups[0]
          ? `
        <div class="podium-item gold">
          <div class="rank">1</div>
          <div class="group-name">${topThreeGroups[0].id}. Grup</div>
          <div class="group-score">${topThreeGroups[0].score} Puan</div>
        </div>
      `
          : ""
      }
      
      ${
        topThreeGroups[2]
          ? `
        <div class="podium-item bronze">
          <div class="rank">3</div>
          <div class="group-name">${topThreeGroups[2].id}. Grup</div>
          <div class="group-score">${topThreeGroups[2].score} Puan</div>
        </div>
      `
          : ""
      }
    </div>
  `;

  const otherGroupsHTML =
    otherGroups.length > 0
      ? `
    <div class="other-groups">
      <h3>Diğer Gruplar</h3>
      ${otherGroups
        .map(
          (group, index) => `
        <div class="other-group">
          <span class="group-rank">${index + 4}.</span>
          <span class="group-name">${group.id}. Grup</span>
          <span class="group-score">${group.score} Puan</span>
        </div>
      `
        )
        .join("")}
    </div>
  `
      : "";

  scoreScreen.innerHTML = `
    <div class="final-score-container">
      <h1 class="final-score-title" >Skor Tablosu:</h1>
      ${topThreeHTML}
      ${otherGroupsHTML}
      <button class="final-score-btn" onclick="location.reload()">Yeniden Başlat</button>
    </div>
  `;
}
