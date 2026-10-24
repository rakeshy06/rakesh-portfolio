/** * RAKESH YANAMANDRA - AI RAG CHATBOT CLIENT */

(function () {
  'use strict';

  class PortfolioChatbot {
    constructor() {
      // Configuration
      this.config = window.PORTFOLIO_CONFIG || {
        API_BASE_URL: "https://rakesh-portfolio-8kmr.onrender.com",
        BOT_NAME: "Rakesh's AI Assistant",
        WELCOME_MESSAGE: "Hello! How can I assist you with Rakesh's portfolio today?",
        SUGGESTED_QUESTIONS: []
      };

      // State
      this.isOpen = false;
      this.isLoading = false;
      this.conversationHistory = [];

      // DOM Elements Cache
      this.dom = {
        fab: document.getElementById("rag-chat-fab"),
        tooltip: document.getElementById("rag-chat-tooltip"),
        window: document.getElementById("rag-chat-window"),
        closeBtn: document.getElementById("rag-chat-close-btn"),
        resetBtn: document.getElementById("rag-chat-reset-btn"),
        messagesContainer: document.getElementById("rag-chat-messages"),
        suggestionsContainer: document.getElementById("rag-chat-suggestions"),
        form: document.getElementById("rag-chat-form"),
        input: document.getElementById("rag-chat-input"),
        sendBtn: document.getElementById("rag-chat-send-btn"),
        typingIndicator: document.getElementById("rag-typing-indicator")
      };

      this.init();
    }

    /**
     * Initializes event listeners, mounts suggestions, and displays welcome message.
     */
    init() {
      if (!this.dom.fab || !this.dom.window) {
        console.warn("PortfolioChatbot: Required DOM elements not found.");
        return;
      }

      this.bindEvents();
      this.renderSuggestions();
      this.displayWelcomeMessage();
    }

    /**
     * Attaches all click, submit, and keyboard event handlers.
     */
    bindEvents() {
      // Toggle chat window on FAB click
      this.dom.fab.addEventListener("click", () => this.toggleChat());

      // Close chat button in header
      if (this.dom.closeBtn) {
        this.dom.closeBtn.addEventListener("click", () => this.closeChat());
      }

      // Reset / Clear chat button in header
      if (this.dom.resetBtn) {
        this.dom.resetBtn.addEventListener("click", () => this.resetConversation());
      }

      // Form submit (Send button or Enter key)
      if (this.dom.form) {
        this.dom.form.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleSendMessage();
        });
      }

      // Allow pressing 'Escape' key to close chat
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.closeChat();
        }
      });
    }

    /**
     * Toggles chat window open/closed with smooth animation.
     */
    toggleChat() {
      if (this.isOpen) {
        this.closeChat();
      } else {
        this.openChat();
      }
    }

    openChat() {
      this.isOpen = true;
      this.dom.window.classList.add("is-open");
      this.dom.fab.classList.add("is-open");
      
      // Hide the initial floating teaser tooltip permanently
      if (this.dom.tooltip) {
        this.dom.tooltip.style.opacity = "0";
        setTimeout(() => {
          if (this.dom.tooltip) this.dom.tooltip.remove();
        }, 300);
      }

      // Focus input field smoothly
      setTimeout(() => {
        if (this.dom.input) this.dom.input.focus();
      }, 250);

      this.scrollToBottom();
    }

    closeChat() {
      this.isOpen = false;
      this.dom.window.classList.remove("is-open");
      this.dom.fab.classList.remove("is-open");
    }

    /**
     * Displays default welcome message from configuration.
     */
    displayWelcomeMessage() {
      this.appendMessage({
        role: "assistant",
        content: this.config.WELCOME_MESSAGE
      });
    }

    /**
     * Renders clickable question pills for instant exploration.
     */
    renderSuggestions() {
      if (!this.dom.suggestionsContainer || !this.config.SUGGESTED_QUESTIONS.length) return;

      this.dom.suggestionsContainer.innerHTML = "";
      this.config.SUGGESTED_QUESTIONS.forEach((questionText) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "rag-chat-chip";
        chip.textContent = questionText;
        chip.addEventListener("click", () => {
          if (!this.isLoading) {
            this.handleUserQuestion(questionText);
          }
        });
        this.dom.suggestionsContainer.appendChild(chip);
      });
    }

    /**
     * Clears history and resets conversation to initial state.
     */
    resetConversation() {
      this.conversationHistory = [];
      if (this.dom.messagesContainer) {
        this.dom.messagesContainer.innerHTML = "";
      }
      this.displayWelcomeMessage();
      this.renderSuggestions();
    }

    /**
     * Submits current user input from the text field.
     */
    handleSendMessage() {
      const text = this.dom.input.value.trim();
      if (!text || this.isLoading) return;

      this.dom.input.value = "";
      this.handleUserQuestion(text);
    }

    /**
     * Core orchestrator: sends query to backend and renders response.
     */
    async handleUserQuestion(question) {
      if (this.isLoading) return;

      // 1. Render User Message
      this.appendMessage({
        role: "user",
        content: question
      });

      // Update state
      this.conversationHistory.push({ role: "user", content: question });
      this.setLoading(true);

      // Construct API endpoint
      const baseUrl = (window.PORTFOLIO_CONFIG?.API_BASE_URL || this.config.API_BASE_URL).replace(/\/$/, "");
      const endpoint = `${baseUrl}/api/chat`;

      try {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      message: question,
      history: this.conversationHistory.slice(-6)
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Backend error:", response.status, errorText);
    throw new Error(`Server returned HTTP ${response.status}`);
  }

  const data = await response.json();
  const answer = data.reply || "I received an empty response. Please ask again!";

  this.appendMessage({
    role: "assistant",
    content: answer
  });

  this.conversationHistory.push({ role: "assistant", content: answer });



} catch (error) {
  console.error("Chatbot API Request Failed:", error);

  this.appendMessage({
    role: "assistant",
    content: "⚠️ **Backend is waking up** (free Render hosting sleeps after inactivity).\n\n" +
             "Please wait 30–60 seconds and try again. The first request after sleep is slow; subsequent ones are fast."
  });




      } finally {
        this.setLoading(false);
      }
    }

    /**
     * Appends a formatted message bubble to the messages container.
     */
    appendMessage({ role, content }) {
      if (!this.dom.messagesContainer) return;

      const wrapper = document.createElement("div");
      wrapper.className = `rag-message-wrapper rag-message-${role}`;

      const bubble = document.createElement("div");
      bubble.className = "rag-bubble";
      bubble.innerHTML = this.formatMarkdown(content);

      const timeSpan = document.createElement("span");
      timeSpan.className = "rag-message-time";
      const now = new Date();
      timeSpan.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      wrapper.appendChild(bubble);
      wrapper.appendChild(timeSpan);

      this.dom.messagesContainer.appendChild(wrapper);
      this.scrollToBottom();
    }

    /**
     * Controls loading state and toggles the typing indicator.
     */
    setLoading(loading) {
      this.isLoading = loading;
      if (this.dom.sendBtn) {
        this.dom.sendBtn.disabled = loading;
      }
      if (this.dom.typingIndicator) {
        this.dom.typingIndicator.style.display = loading ? "flex" : "none";
      }
      if (loading) {
        this.scrollToBottom();
      }
    }

    /**
     * Smoothly scrolls chat window to bottom.
     */
    scrollToBottom() {
      if (!this.dom.messagesContainer) return;
      setTimeout(() => {
        this.dom.messagesContainer.scrollTop = this.dom.messagesContainer.scrollHeight;
      }, 50);
    }

    /**
     * Safe, lightweight Markdown formatter:
     * - First sanitizes against XSS by encoding HTML characters.
     * - Safely translates bold (**text**), italics (*text*), links ([label](url)),
     *   code tags (`code`), and list bullets.
     */
    formatMarkdown(rawText) {
      if (!rawText) return "";

      // 1. Sanitize HTML tags
      let safe = rawText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

      // 2. Bold: **text** or __text__
      safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

      // 3. Italic: *text* or _text_
      safe = safe.replace(/\*(.*?)\*/g, "<em>$1</em>");

      // 4. Inline code: `code`
      safe = safe.replace(/`([^`]+)`/g, "<code>$1</code>");

      // 5. Links: [text](url) -> open in new tab
      safe = safe.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

      // 6. Bullet lists: lines starting with "- " or "• "
      const lines = safe.split("\n");
      let inList = false;
      const formattedLines = [];

      for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          if (!inList) {
            formattedLines.push("<ul>");
            inList = true;
          }
          formattedLines.push(`<li>${trimmed.substring(2)}</li>`);
        } else {
          if (inList) {
            formattedLines.push("</ul>");
            inList = false;
          }
          if (trimmed.length > 0) {
            formattedLines.push(`<p>${line}</p>`);
          }
        }
      }

      if (inList) {
        formattedLines.push("</ul>");
      }

      return formattedLines.join("");
    }
  }

  // Initialize on page load
  document.addEventListener("DOMContentLoaded", () => {
    window.portfolioChatbotInstance = new PortfolioChatbot();
  });
})();
