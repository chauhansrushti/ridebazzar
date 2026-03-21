// RideBazzar Chatbot
class RideBazarChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.init();
  }

  init() {
    // Only show chatbot on FAQ page
    const currentPage = window.location.pathname.toLowerCase();
    if (!currentPage.includes('faq.html')) {
      return; // Don't initialize chatbot on other pages
    }
    
    this.createChatWidget();
    this.addEventListeners();
    this.addWelcomeMessage();
  }

  createChatWidget() {
    const chatHTML = `
      <!-- Chat Button -->
      <div id="chatButton" class="chat-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
        <span class="chat-badge" style="display:none;">1</span>
      </div>

      <!-- Chat Window -->
      <div id="chatWindow" class="chat-window" style="display:none;">
        <div class="chat-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:40px; height:40px; background:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px;">
              🚗
            </div>
            <div>
              <div style="font-weight:bold; font-size:16px;">RideBazzar Assistant</div>
              <div style="font-size:12px; opacity:0.9;">Online</div>
            </div>
          </div>
          <button id="closeChat" class="close-chat">&times;</button>
        </div>
        
        <div id="chatMessages" class="chat-messages"></div>
        
        <div class="chat-input-container">
          <input type="text" id="chatInput" class="chat-input" placeholder="Type your message...">
          <button id="sendMessage" class="send-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions" id="quickActions">
          <button onclick="chatbot.sendQuickMessage('I want to buy a car')">🚗 Buy Car</button>
          <button onclick="chatbot.sendQuickMessage('I want to sell my car')">💰 Sell Car</button>
          <button onclick="chatbot.sendQuickMessage('Show me popular cars')">⭐ Popular Cars</button>
          <button onclick="window.open('https://wa.me/919082073676?text=Hi%20RideBazzar,%20I%20need%20help', '_blank')">💬 WhatsApp</button>
        </div>
      </div>
    `;

    const chatStyles = `
      <style>
        .chat-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #f9b233 0%, #ff8c00 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(249, 178, 51, 0.4);
          z-index: 1000;
          transition: all 0.3s;
        }
        .chat-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(249, 178, 51, 0.6);
        }
        .chat-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #dc3545;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
        .chat-window {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 380px;
          height: 550px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .chat-header {
          background: linear-gradient(135deg, #f9b233 0%, #ff8c00 100%);
          color: white;
          padding: 15px 20px;
          border-radius: 16px 16px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .close-chat {
          background: none;
          border: none;
          color: white;
          font-size: 28px;
          cursor: pointer;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }
        .close-chat:hover {
          background: rgba(255,255,255,0.2);
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f8f9fa;
        }
        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }
        .chat-messages::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 3px;
        }
        .message {
          margin-bottom: 15px;
          display: flex;
          gap: 10px;
          animation: fadeIn 0.3s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .message.bot {
          justify-content: flex-start;
        }
        .message.user {
          justify-content: flex-end;
        }
        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .message.bot .message-avatar {
          background: linear-gradient(135deg, #f9b233 0%, #ff8c00 100%);
        }
        .message.user .message-avatar {
          background: #6c757d;
          color: white;
        }
        .message-content {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 16px;
          word-wrap: break-word;
        }
        .message.bot .message-content {
          background: white;
          color: #333;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .message.user .message-content {
          background: #f9b233;
          color: white;
          border-bottom-right-radius: 4px;
        }
        .chat-input-container {
          display: flex;
          gap: 10px;
          padding: 15px;
          background: white;
          border-top: 1px solid #e0e0e0;
        }
        .chat-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 25px;
          outline: none;
          font-size: 14px;
          transition: border-color 0.3s;
        }
        .chat-input:focus {
          border-color: #f9b233;
        }
        .send-button {
          width: 44px;
          height: 44px;
          background: #f9b233;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        .send-button:hover {
          background: #ff8c00;
          transform: scale(1.1);
        }
        .quick-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 15px;
          background: white;
          border-top: 1px solid #e0e0e0;
        }
        .quick-actions button {
          padding: 8px 14px;
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 20px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .quick-actions button:hover {
          background: #f9b233;
          color: white;
          border-color: #f9b233;
        }
        @media (max-width: 480px) {
          .chat-window {
            width: calc(100vw - 20px);
            height: calc(100vh - 100px);
            right: 10px;
            bottom: 80px;
          }
        }
      </style>
    `;

    document.body.insertAdjacentHTML('beforeend', chatStyles + chatHTML);
  }

  addEventListeners() {
    document.getElementById('chatButton').addEventListener('click', () => this.toggleChat());
    document.getElementById('closeChat').addEventListener('click', () => this.toggleChat());
    document.getElementById('sendMessage').addEventListener('click', () => this.sendMessage());
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const chatWindow = document.getElementById('chatWindow');
    const chatButton = document.getElementById('chatButton');
    const chatBadge = document.querySelector('.chat-badge');
    
    if (this.isOpen) {
      chatWindow.style.display = 'flex';
      chatButton.style.display = 'none';
      chatBadge.style.display = 'none';
      document.getElementById('chatInput').focus();
    } else {
      chatWindow.style.display = 'none';
      chatButton.style.display = 'flex';
    }
  }

  addWelcomeMessage() {
    const welcomeMessages = [
      "Hello! 👋 Welcome to RideBazzar!",
      "I'm your virtual assistant. How can I help you today?",
      "You can ask me about buying cars, selling your car, or browsing our inventory!",
      "Need help? <a href='https://wa.me/919082073676?text=Hi%20RideBazzar,%20I%20need%20help' target='_blank' style='color:#f9b233; font-weight:bold;'>Chat on WhatsApp →</a>"
    ];
    
    welcomeMessages.forEach((msg, index) => {
      setTimeout(() => {
        this.addMessage(msg, 'bot');
      }, index * 800);
    });
  }

  sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    this.addMessage(message, 'user');
    input.value = '';
    
    setTimeout(() => {
      this.generateResponse(message);
    }, 500);
  }

  sendQuickMessage(message) {
    this.addMessage(message, 'user');
    setTimeout(() => {
      this.generateResponse(message);
    }, 500);
  }

  addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = sender === 'bot' ? '🚗' : '👤';
    
    if (sender === 'bot') {
      messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">${text}</div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="message-content">${text}</div>
        <div class="message-avatar">${avatar}</div>
      `;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    this.messages.push({ text, sender, timestamp: new Date() });
  }

  generateResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    
    // Buy car inquiries
    if (lowerMessage.includes('buy') || lowerMessage.includes('purchase')) {
      response = "Great! I can help you find your perfect car. We have a wide range of vehicles available. Would you like to:<br><br>• <a href='all-cars.html' style='color:#f9b233;'>Browse All Cars</a><br>• Filter by budget<br>• Search by brand<br><br>What's your preference?";
    }
    // Sell car inquiries
    else if (lowerMessage.includes('sell')) {
      response = "Excellent! Selling your car is easy with RideBazzar. Here's what you need to do:<br><br>1. <a href='post-car.html' style='color:#f9b233;'>Post Your Car</a><br>2. Add photos and details<br>3. Set your price<br>4. Wait for interested buyers!<br><br>Ready to get started?";
    }
    // Popular cars
    else if (lowerMessage.includes('popular') || lowerMessage.includes('trending')) {
      response = "Our most popular cars right now include:<br><br>🔥 Maruti Swift<br>🔥 Hyundai Creta<br>🔥 Honda City<br>🔥 Tata Nexon<br><br><a href='all-cars.html?sort=popular' style='color:#f9b233;'>View All Popular Cars →</a>";
    }
    // Price/Budget
    else if (lowerMessage.includes('price') || lowerMessage.includes('budget') || lowerMessage.includes('cost')) {
      response = "We have cars for every budget! Our inventory ranges from ₹50,000 to ₹70,00,000+<br><br>What's your budget range?<br>• Under ₹5 Lakhs<br>• ₹5-10 Lakhs<br>• ₹10-20 Lakhs<br>• Above ₹20 Lakhs";
    }
    // Contact/Support
    else if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('whatsapp') || lowerMessage.includes('chat')) {
      response = "I'm here to help! You can reach us at:<br><br>📞 Call: +91 9082073676<br>💬 <a href='https://wa.me/919082073676?text=Hi%20RideBazzar,%20I%20need%20help%20with' target='_blank' style='color:#f9b233; font-weight:bold;'>Chat on WhatsApp →</a><br>📧 Email: support@ridebazzar.com<br><br>What would you like assistance with?";
    }
    // EMI/Finance
    else if (lowerMessage.includes('emi') || lowerMessage.includes('loan') || lowerMessage.includes('finance')) {
      response = "We offer easy financing options!<br><br>✅ Low interest rates starting at 8.5%<br>✅ Flexible tenure (1-7 years)<br>✅ Quick approval<br>✅ Minimal documentation<br><br>Check EMI calculator on any car listing page!";
    }
    // Compare cars
    else if (lowerMessage.includes('compare')) {
      response = "You can compare up to 3 cars side-by-side!<br><br>Visit our <a href='compare.html' style='color:#f9b233;'>Comparison Tool</a> to see detailed specs, prices, and features of multiple cars at once.";
    }
    // Test drive
    else if (lowerMessage.includes('test drive') || lowerMessage.includes('drive')) {
      response = "Yes! You can schedule test drives for any car. Simply:<br><br>1. Visit the car details page<br>2. Click 'Schedule Test Drive'<br>3. Choose your preferred date & time<br>4. The seller will contact you!";
    }
    // Greetings
    else if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      response = "Hello! 👋 How can I assist you today with RideBazzar?";
    }
    // Thanks
    else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      response = "You're welcome! 😊 Is there anything else I can help you with?";
    }
    // Default response
    else {
      response = "I understand you're asking about: <i>\"" + userMessage + "\"</i><br><br>Let me help you with that! You can:<br><br>• <a href='all-cars.html' style='color:#f9b233;'>Browse Cars</a><br>• <a href='post-car.html' style='color:#f9b233;'>Sell Your Car</a><br>• <a href='compare.html' style='color:#f9b233;'>Compare Cars</a><br><br>Or ask me something specific! 😊";
    }
    
    this.addMessage(response, 'bot');
  }
}

// Initialize chatbot when DOM is ready
let chatbot;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    chatbot = new RideBazarChatbot();
  });
} else {
  chatbot = new RideBazarChatbot();
}
