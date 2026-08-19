(() => {
  "use strict";

  // =========================================================
  // AMPARO — SCRIPT PRINCIPAL
  // Funciona com o HTML/CSS enviados.
  // =========================================================

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  // ---------- Navegação ----------
  function showScreen(id) {
    const target = document.getElementById(`screen-${id}`);
    if (!target) return;

    $$(".screen").forEach(screen => screen.classList.remove("active"));
    target.classList.add("active");

    $$(".navbtn").forEach(button => {
      button.classList.toggle("active", button.dataset.screen === id);
    });

    moveNavIndicator();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Deixa showScreen disponível para os onclick="" do HTML.
  window.showScreen = showScreen;

  $$(".navbtn").forEach(button => {
    button.addEventListener("click", () => showScreen(button.dataset.screen));
  });

  // ---------- Indicador da navegação ----------
  const navIndicator = $("#navIndicator");

  function moveNavIndicator() {
    if (!navIndicator) return;
    const active = $(".navbtn.active");

    if (!active || window.innerWidth <= 880) {
      navIndicator.style.opacity = "0";
      return;
    }

    navIndicator.style.opacity = "1";
  }

  window.addEventListener("resize", moveNavIndicator);

  // ---------- Saída rápida ----------
  const quickExit = $("#quickExit");
  if (quickExit) {
    quickExit.addEventListener("click", () => {
      // Não abre outra página dentro da aplicação.
      // O endereço neutro é intencional.
      window.location.replace("https://www.google.com/");
    });
  }

  // ---------- Ripple ----------
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-ripple]");
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const circle = document.createElement("span");

    circle.className = "ripple";
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.left = `${event.clientX - rect.left - size / 2}px`;
    circle.style.top = `${event.clientY - rect.top - size / 2}px`;

    button.appendChild(circle);
    window.setTimeout(() => circle.remove(), 600);
  });

  // ---------- Tilt dos cards ----------
  $$("[data-tilt]").forEach(card => {
    card.addEventListener("mousemove", event => {
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -6;
      const rotateY = ((x / rect.width) - 0.5) * 6;

      card.style.transform =
        `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform =
        "perspective(700px) rotateX(0) rotateY(0) translateY(0)";
    });
  });

  // ---------- Reveal ----------
  const revealTargets = $$(".sign-card, .support-item, .plan-item, .step, .quiz-item");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = "fade .5s ease both";
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealTargets.forEach(element => observer.observe(element));
  }

  // =========================================================
  // PERFIL / BOAS-VINDAS
  // =========================================================

  const welcomeOverlay = $("#welcomeOverlay");
  const welcomeOptions = $("#welcomeOptions");
  const welcomeForm = $("#welcomeForm");
  const optAccount = $("#optAccount");
  const optAnon = $("#optAnon");
  const confirmAccount = $("#confirmAccount");
  const backToOptions = $("#backToOptions");

  const profileName = $("#profileName");
  const profileAvatar = $("#profileAvatar");
  const profileSwitch = $("#profileSwitch");
  const heroGreeting = $("#heroGreeting");

  let profile = {
    mode: "anonymous",
    name: "",
    email: ""
  };

  function updateProfileUI() {
    const isNamed = profile.mode === "account" && profile.name.trim();

    if (profileName) {
      profileName.textContent = isNamed ? profile.name : "Anônima(o)";
    }

    if (profileAvatar) {
      profileAvatar.textContent = isNamed
        ? profile.name.trim().charAt(0).toUpperCase()
        : "?";
    }

    if (heroGreeting) {
      heroGreeting.textContent = isNamed
        ? `Olá, ${profile.name.trim()} · você está no Amparo`
        : "Agosto Lilás · prevenção à violência contra a mulher";
    }
  }

  function hideWelcome() {
    if (welcomeOverlay) welcomeOverlay.classList.add("hidden");
  }

  function openWelcome() {
    if (!welcomeOverlay) return;

    welcomeOverlay.classList.remove("hidden");
    if (welcomeOptions) welcomeOptions.style.display = "flex";
    if (welcomeForm) welcomeForm.classList.remove("show");
  }

  function saveProfile() {
    const name = ($("#welcomeName")?.value || "").trim();
    const email = ($("#welcomeEmail")?.value || "").trim();

    if (!name) {
      alert("Digite um nome ou apelido para continuar.");
      $("#welcomeName")?.focus();
      return;
    }

    profile = {
      mode: "account",
      name,
      email
    };

    try {
      localStorage.setItem("amparo.profile", JSON.stringify(profile));
    } catch (_) {}

    updateProfileUI();
    hideWelcome();
  }

  function useAnonymousMode() {
    profile = {
      mode: "anonymous",
      name: "",
      email: ""
    };

    // Remove apenas os dados do perfil salvo.
    try {
      localStorage.removeItem("amparo.profile");
    } catch (_) {}

    updateProfileUI();
    hideWelcome();
  }

  function loadProfile() {
    try {
      const saved = JSON.parse(localStorage.getItem("amparo.profile") || "null");

      if (saved && saved.mode === "account" && saved.name) {
        profile = saved;
        updateProfileUI();
        hideWelcome();
        return;
      }
    } catch (_) {}

    updateProfileUI();
  }

  if (optAccount) {
    optAccount.addEventListener("click", () => {
      if (welcomeOptions) welcomeOptions.style.display = "none";
      if (welcomeForm) welcomeForm.classList.add("show");
      $("#welcomeName")?.focus();
    });
  }

  if (optAnon) {
    optAnon.addEventListener("click", useAnonymousMode);
  }

  if (backToOptions) {
    backToOptions.addEventListener("click", () => {
      if (welcomeForm) welcomeForm.classList.remove("show");
      if (welcomeOptions) welcomeOptions.style.display = "flex";
    });
  }

  if (confirmAccount) {
    confirmAccount.addEventListener("click", saveProfile);
  }

  if ($("#welcomeName")) {
    $("#welcomeName").addEventListener("keydown", event => {
      if (event.key === "Enter") saveProfile();
    });
  }

  if (profileSwitch) {
    profileSwitch.addEventListener("click", openWelcome);
  }

  // =========================================================
  // AUTOAVALIAÇÃO
  // =========================================================

  const quizItems = [
    "A pessoa controla com quem você fala ou aonde você vai?",
    "Você já mudou seu comportamento por medo da reação dela(e)?",
    "Ela(e) já ameaçou machucar você, filhos ou animais de estimação?",
    "Ela(e) controla o dinheiro ou dificulta seu acesso a recursos próprios?",
    "Você se sente isolada(o) de amigos ou familiares por causa da relação?",
    "Já houve agressão física, mesmo que uma única vez?"
  ];

  let quizAnswers = new Array(quizItems.length).fill(null);
  const quizList = $("#quizList");

  function renderQuiz() {
    if (!quizList) return;

    quizList.innerHTML = "";

    quizItems.forEach((question, index) => {
      const item = document.createElement("div");
      item.className = "quiz-item";

      const paragraph = document.createElement("p");
      paragraph.textContent = question;

      const toggle = document.createElement("div");
      toggle.className = "toggle";

      const yes = document.createElement("button");
      yes.type = "button";
      yes.className = "sel-yes";
      yes.dataset.i = index;
      yes.dataset.v = "1";
      yes.textContent = "Sim";

      const no = document.createElement("button");
      no.type = "button";
      no.className = "sel-no";
      no.dataset.i = index;
      no.dataset.v = "0";
      no.textContent = "Não";

      toggle.append(yes, no);
      item.append(paragraph, toggle);
      quizList.appendChild(item);
    });
  }

  function showResult() {
    const yesCount = quizAnswers.filter(answer => answer === 1).length;
    const percentage = Math.round((yesCount / quizItems.length) * 100);

    const box = $("#resultBox");
    const fill = $("#resultFill");
    const title = $("#resultTitle");
    const text = $("#resultText");

    if (!box || !fill || !title || !text) return;

    box.classList.add("show");
    fill.style.width = `${percentage}%`;

    if (yesCount === 0) {
      title.textContent = "Nenhum sinal marcado";
      text.textContent =
        "Nenhum dos sinais listados foi identificado. Continue atenta(o) e lembre-se de que uma rede de apoio pode ser importante sempre que precisar.";
    } else if (yesCount <= 2) {
      title.textContent = "Alguns sinais de atenção";
      text.textContent =
        "Alguns sinais foram identificados. Vale conversar com alguém de confiança e conhecer a rede de apoio disponível.";
    } else {
      title.textContent = "Vários sinais identificados";
      text.textContent =
        "Diversos sinais foram identificados. Considere buscar orientação pela rede de apoio oficial.";
    }

    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  if (quizList) {
    quizList.addEventListener("click", event => {
      const button = event.target.closest("button");
      if (!button) return;

      const index = Number(button.dataset.i);
      const value = Number(button.dataset.v);

      if (!Number.isInteger(index) || index < 0 || index >= quizItems.length) return;

      quizAnswers[index] = value;

      const item = button.closest(".quiz-item");
      if (item) {
        $(".sel-yes", item)?.classList.toggle("on", value === 1);
        $(".sel-no", item)?.classList.toggle("on", value === 0);
      }

      if (quizAnswers.every(answer => answer !== null)) {
        showResult();
      }
    });
  }

  // =========================================================
  // CONTATOS DE CONFIANÇA
  // =========================================================

  let contacts = [];

  const contactList = $("#contactList");

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderContacts() {
    if (!contactList) return;

    contactList.innerHTML = "";

    if (contacts.length === 0) {
      contactList.innerHTML =
        '<div class="empty">Nenhum contato cadastrado ainda.</div>';
      return;
    }

    contacts.forEach((contact, index) => {
      const row = document.createElement("div");
      row.className = "contact-row";

      const initial = contact.name.trim().charAt(0).toUpperCase();

      row.innerHTML = `
        <div class="who">
          <div class="avatar">${escapeHTML(initial)}</div>
          <div>
            <h4>${escapeHTML(contact.name)}</h4>
            <span>${escapeHTML(contact.rel)} · ${escapeHTML(contact.phone)}</span>
          </div>
        </div>
        <button type="button" class="del-btn" data-i="${index}">Remover</button>
      `;

      contactList.appendChild(row);
    });
  }

  function addContact() {
    const nameInput = $("#cName");
    const phoneInput = $("#cPhone");
    const relationInput = $("#cRel");

    if (!nameInput || !phoneInput || !relationInput) return;

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const relation = relationInput.value;

    if (!name || !phone) {
      alert("Preencha o nome e o telefone do contato.");
      if (!name) nameInput.focus();
      else phoneInput.focus();
      return;
    }

    contacts.push({
      name,
      phone,
      rel: relation
    });

    nameInput.value = "";
    phoneInput.value = "";

    renderContacts();
  }

  window.addContact = addContact;

  if (contactList) {
    contactList.addEventListener("click", event => {
      const button = event.target.closest(".del-btn");
      if (!button) return;

      const index = Number(button.dataset.i);
      if (!Number.isInteger(index)) return;

      contacts.splice(index, 1);
      renderContacts();
    });
  }

  // =========================================================
  // PLANO DE SEGURANÇA
  // =========================================================

  const planItems = [
    {
      t: "Guardar documentos importantes",
      d: "RG, CPF, certidões — originais ou cópias, em local acessível."
    },
    {
      t: "Reservar um valor em dinheiro",
      d: "Uma quantia guardada separadamente, para uma saída rápida se necessário."
    },
    {
      t: "Definir um lugar seguro",
      d: "Casa de alguém de confiança ou abrigo conhecido, caso precise sair."
    },
    {
      t: "Combinar uma palavra-código",
      d: "Um sinal com alguém de confiança para pedir ajuda discretamente."
    },
    {
      t: "Salvar contatos de emergência",
      d: "180, 190 e pessoas de confiança salvas de forma acessível."
    },
    {
      t: "Preparar uma pequena bolsa essencial",
      d: "Itens básicos, medicamentos e documentos, prontos se precisar sair rápido."
    }
  ];

  let planState = new Array(planItems.length).fill(false);
  const planList = $("#planList");

  function renderPlan() {
    if (!planList) return;

    planList.innerHTML = "";

    planItems.forEach((item, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = `plan-item${planState[index] ? " done" : ""}`;

      const check = document.createElement("div");
      check.className = `plan-check${planState[index] ? " done" : ""}`;
      check.dataset.i = index;
      check.setAttribute("role", "button");
      check.setAttribute("tabindex", "0");
      check.setAttribute("aria-label", `Marcar: ${item.t}`);
      check.innerHTML = planState[index]
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>'
        : "";

      const body = document.createElement("div");
      body.className = "plan-item-body";
      body.innerHTML = `
        <h4>${escapeHTML(item.t)}</h4>
        <p>${escapeHTML(item.d)}</p>
      `;

      wrapper.append(check, body);
      planList.appendChild(wrapper);
    });

    const done = planState.filter(Boolean).length;

    const fill = $("#planFill");
    const label = $("#planLabel");

    if (fill) fill.style.width = `${(done / planItems.length) * 100}%`;
    if (label) label.textContent = `${done} de ${planItems.length} concluídos`;
  }

  function togglePlan(index) {
    if (!Number.isInteger(index) || index < 0 || index >= planItems.length) return;
    planState[index] = !planState[index];
    renderPlan();
  }

  if (planList) {
    planList.addEventListener("click", event => {
      const check = event.target.closest(".plan-check");
      if (!check) return;
      togglePlan(Number(check.dataset.i));
    });

    planList.addEventListener("keydown", event => {
      if (!["Enter", " "].includes(event.key)) return;

      const check = event.target.closest(".plan-check");
      if (!check) return;

      event.preventDefault();
      togglePlan(Number(check.dataset.i));
    });
  }

  // =========================================================
  // PONTOS DE SEGURANÇA / MAPA
  // =========================================================

  const locationStatus = $("#locationStatus");
  const useLocationBtn = $("#useLocationBtn");
  const useManualBtn = $("#useManualBtn");
  const manualLocation = $("#manualLocation");

  function setLocationStatus(message, type = "") {
    if (!locationStatus) return;

    locationStatus.textContent = message;
    locationStatus.className = "location-status";

    if (type) locationStatus.classList.add(type);
  }

  function openMap(query) {
    const cleanQuery = String(query || "").trim();

    if (!cleanQuery) {
      setLocationStatus("Digite uma cidade ou endereço para buscar.", "error");
      return;
    }

    const url =
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanQuery)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  $$(".point-card").forEach(card => {
    card.addEventListener("click", () => {
      const query = card.dataset.query || card.querySelector("h3")?.textContent || "";
      const place = manualLocation?.value.trim();

      if (place) {
        openMap(`${query}, ${place}`);
      } else {
        openMap(query);
      }
    });
  });

  if (useManualBtn) {
    useManualBtn.addEventListener("click", () => {
      const place = manualLocation?.value.trim();

      if (!place) {
        setLocationStatus("Digite uma cidade ou endereço.", "error");
        manualLocation?.focus();
        return;
      }

      setLocationStatus(`Local definido: ${place}`, "ok");
    });
  }

  if (manualLocation) {
    manualLocation.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        useManualBtn?.click();
      }
    });
  }

  if (useLocationBtn) {
    useLocationBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        setLocationStatus(
          "Seu navegador não oferece geolocalização. Digite a cidade ou endereço manualmente.",
          "error"
        );
        return;
      }

      setLocationStatus("Obtendo sua localização…");

      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;

          const mapsUrl =
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;

          setLocationStatus(
            "Localização encontrada. Escolha um ponto abaixo para abrir no mapa.",
            "ok"
          );

          // Guarda apenas em memória nesta sessão.
          window.amparoLocation = { latitude, longitude };

          $$(".point-card").forEach(card => {
            card.onclick = () => {
              const query = card.dataset.query || card.querySelector("h3")?.textContent || "";
              const url =
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query} near ${latitude},${longitude}`)}`;
              window.open(url, "_blank", "noopener,noreferrer");
            };
          });

          // Mantém o link pronto sem navegar automaticamente.
          useLocationBtn.dataset.mapsUrl = mapsUrl;
        },
        error => {
          let message =
            "Não foi possível obter sua localização. Digite uma cidade ou endereço manualmente.";

          if (error && error.code === 1) {
            message = "Permissão de localização negada. Você pode buscar manualmente.";
          } else if (error && error.code === 2) {
            message = "Não foi possível determinar sua localização. Tente buscar manualmente.";
          } else if (error && error.code === 3) {
            message = "A localização demorou demais. Tente novamente ou busque manualmente.";
          }

          setLocationStatus(message, "error");
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }

  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  renderQuiz();
  renderContacts();
  renderPlan();
  loadProfile();
  moveNavIndicator();

  // Garante que o primeiro screen esteja correto.
  if (!$(".screen.active")) {
    showScreen("inicio");
  }

})();
