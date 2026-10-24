/**PORTFOLIO AI CHATBOT - FRONTEND CONFIGURATION */

  const CONFIG = {
  API_BASE_URL: "",

  /**
   * Bot Identity & Welcome Options
   */
  BOT_NAME: "Rakesh's AI Assistant",
  
  WELCOME_MESSAGE: 
    "👋 Hello! I am **Rakesh Yanamandra's AI Assistant**.\n\n" +
    "Feel free to ask me anything about his **projects**, **technical skills**, **education**, or **career opportunities**!",

  /**
   * Suggested quick prompt questions for first-time visitors
   */
  SUGGESTED_QUESTIONS: [
    "What are Rakesh's key technical skills?",
    "Tell me about his top projects",
    "Is Rakesh available for internships or hire?",
    "How can I contact Rakesh?"
  ]
};

// Export to window object for browser access
window.PORTFOLIO_CONFIG = CONFIG;
