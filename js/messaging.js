// Messaging System for RideBazzar

class MessagingManager {
  constructor() {
    this.conversations = this.getConversations();
    this.notifications = this.getNotifications();
  }

  // Get all conversations from localStorage
  getConversations() {
    return JSON.parse(localStorage.getItem('ridebazzar_conversations') || '[]');
  }

  // Save conversations to localStorage
  saveConversations(conversations) {
    localStorage.setItem('ridebazzar_conversations', JSON.stringify(conversations));
    this.conversations = conversations;
  }

  // Get notifications from localStorage
  getNotifications() {
    const user = localStorage.getItem('ridebazzar_user');
    if (!user) return [];
    return JSON.parse(localStorage.getItem(`ridebazzar_notifications_${user}`) || '[]');
  }

  // Save notifications to localStorage
  saveNotifications(notifications) {
    const user = localStorage.getItem('ridebazzar_user');
    if (!user) return;
    localStorage.setItem(`ridebazzar_notifications_${user}`, JSON.stringify(notifications));
    this.notifications = notifications;
  }

  // Create or get conversation between two users about a car
  getOrCreateConversation(participant1, participant2, carId) {
    const conversationId = this.generateConversationId(participant1, participant2, carId);
    
    let conversation = this.conversations.find(conv => conv.id === conversationId);
    
    if (!conversation) {
      const car = carManager.getCarById(carId);
      conversation = {
        id: conversationId,
        participants: [participant1, participant2],
        carId: carId,
        carInfo: car ? {
          make: car.make,
          model: car.model,
          year: car.year,
          price: car.price
        } : null,
        messages: [],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        unreadCounts: {
          [participant1]: 0,
          [participant2]: 0
        }
      };
      
      this.conversations.push(conversation);
      this.saveConversations(this.conversations);
    }
    
    return conversation;
  }

  // Generate unique conversation ID
  generateConversationId(user1, user2, carId) {
    const sortedUsers = [user1, user2].sort();
    return `${sortedUsers[0]}_${sortedUsers[1]}_${carId}`;
  }

  // Send message
  sendMessage(conversationId, senderId, messageText, messageType = 'text') {
    const conversation = this.conversations.find(conv => conv.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const message = {
      id: Date.now().toString(),
      senderId,
      text: messageText,
      type: messageType, // text, image, system
      timestamp: new Date().toISOString(),
      read: false
    };

    conversation.messages.push(message);
    conversation.lastActivity = new Date().toISOString();

    // Update unread count for recipient
    const recipient = conversation.participants.find(p => p !== senderId);
    if (recipient) {
      conversation.unreadCounts[recipient]++;
    }

    this.saveConversations(this.conversations);

    // Create notification for recipient
    this.createNotification(recipient, {
      type: 'message',
      title: 'New Message',
      message: `${senderId} sent you a message about ${conversation.carInfo ? conversation.carInfo.make + ' ' + conversation.carInfo.model : 'a car'}`,
      data: { conversationId, carId: conversation.carId }
    });

    return message;
  }

  // Mark messages as read
  markMessagesAsRead(conversationId, userId) {
    const conversation = this.conversations.find(conv => conv.id === conversationId);
    if (!conversation) return;

    conversation.messages.forEach(message => {
      if (message.senderId !== userId) {
        message.read = true;
      }
    });

    conversation.unreadCounts[userId] = 0;
    this.saveConversations(this.conversations);
  }

  // Get conversations for a user
  getUserConversations(userId) {
    return this.conversations.filter(conv => 
      conv.participants.includes(userId)
    ).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  }

  // Get unread message count for user
  getUnreadMessageCount(userId) {
    const userConversations = this.getUserConversations(userId);
    return userConversations.reduce((total, conv) => {
      return total + (conv.unreadCounts[userId] || 0);
    }, 0);
  }

  // Create notification
  createNotification(userId, notificationData) {
    if (!userId) return;

    const userNotifications = JSON.parse(localStorage.getItem(`ridebazzar_notifications_${userId}`) || '[]');
    
    const notification = {
      id: Date.now().toString(),
      ...notificationData,
      timestamp: new Date().toISOString(),
      read: false
    };

    userNotifications.unshift(notification);
    
    // Keep only last 50 notifications
    if (userNotifications.length > 50) {
      userNotifications.splice(50);
    }

    localStorage.setItem(`ridebazzar_notifications_${userId}`, JSON.stringify(userNotifications));
  }

  // Get user notifications
  getUserNotifications(userId) {
    return JSON.parse(localStorage.getItem(`ridebazzar_notifications_${userId}`) || '[]');
  }

  // Mark notification as read
  markNotificationAsRead(userId, notificationId) {
    const notifications = this.getUserNotifications(userId);
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      localStorage.setItem(`ridebazzar_notifications_${userId}`, JSON.stringify(notifications));
    }
  }

  // Get unread notification count
  getUnreadNotificationCount(userId) {
    const notifications = this.getUserNotifications(userId);
    return notifications.filter(n => !n.read).length;
  }

  // System messages for inquiries
  createInquirySystemMessage(carId, inquiryData) {
    const car = carManager.getCarById(carId);
    if (!car) return;

    const conversation = this.getOrCreateConversation(inquiryData.buyer, car.seller, carId);
    
    const systemMessage = {
      id: Date.now().toString(),
      senderId: 'system',
      text: `${inquiryData.buyer} is interested in your ${car.make} ${car.model}. Original message: "${inquiryData.message}"`,
      type: 'system',
      timestamp: new Date().toISOString(),
      read: false,
      data: {
        inquiryId: inquiryData.id,
        buyerPhone: inquiryData.phone
      }
    };

    conversation.messages.push(systemMessage);
    conversation.lastActivity = new Date().toISOString();
    conversation.unreadCounts[car.seller]++;

    this.saveConversations(this.conversations);

    // Create notification
    this.createNotification(car.seller, {
      type: 'inquiry',
      title: 'New Car Inquiry',
      message: `${inquiryData.buyer} is interested in your ${car.make} ${car.model}`,
      data: { conversationId: conversation.id, carId }
    });

    return conversation;
  }

  // Auto-responses for common scenarios
  generateAutoResponse(messageText, carInfo) {
    const lowerText = messageText.toLowerCase();
    
    if (lowerText.includes('price') || lowerText.includes('cost')) {
      return `The asking price for this ${carInfo.make} ${carInfo.model} is ${carManager.formatPrice(carInfo.price)}. The price is negotiable. Would you like to schedule a viewing?`;
    }
    
    if (lowerText.includes('available') || lowerText.includes('still selling')) {
      return `Yes, this ${carInfo.make} ${carInfo.model} is still available. Would you like to know more details or schedule a viewing?`;
    }
    
    if (lowerText.includes('test drive') || lowerText.includes('viewing') || lowerText.includes('see the car')) {
      return `Sure! I can arrange a test drive for the ${carInfo.make} ${carInfo.model}. When would be convenient for you? Please let me know your preferred time and I'll confirm availability.`;
    }
    
    if (lowerText.includes('condition') || lowerText.includes('history') || lowerText.includes('accident')) {
      return `The car is in good condition with no major accidents. All service records are available. You can inspect the vehicle before making a decision. Would you like to schedule a detailed inspection?`;
    }
    
    return null; // No auto-response available
  }

  // Delete conversation
  deleteConversation(conversationId, userId) {
    const conversation = this.conversations.find(conv => conv.id === conversationId);
    if (!conversation) return false;

    if (!conversation.participants.includes(userId)) {
      throw new Error('You are not part of this conversation');
    }

    this.conversations = this.conversations.filter(conv => conv.id !== conversationId);
    this.saveConversations(this.conversations);
    return true;
  }
}

// Global messaging manager
const messagingManager = new MessagingManager();

// Global functions
function startConversation(sellerId, carId) {
  const buyerId = localStorage.getItem('ridebazzar_user');
  if (!buyerId) {
    throw new Error('You must be logged in to send messages');
  }

  if (sellerId === buyerId) {
    throw new Error('You cannot message yourself');
  }

  return messagingManager.getOrCreateConversation(buyerId, sellerId, carId);
}

function sendCarMessage(conversationId, messageText) {
  const senderId = localStorage.getItem('ridebazzar_user');
  if (!senderId) {
    throw new Error('You must be logged in to send messages');
  }

  return messagingManager.sendMessage(conversationId, senderId, messageText);
}

function getUserConversations() {
  const userId = localStorage.getItem('ridebazzar_user');
  if (!userId) return [];
  return messagingManager.getUserConversations(userId);
}

function getUnreadMessageCount() {
  const userId = localStorage.getItem('ridebazzar_user');
  if (!userId) return 0;
  return messagingManager.getUnreadMessageCount(userId);
}

function getUnreadNotificationCount() {
  const userId = localStorage.getItem('ridebazzar_user');
  if (!userId) return 0;
  return messagingManager.getUnreadNotificationCount(userId);
}

// Enhanced inquiry submission that creates messaging thread
function submitEnhancedInquiry(carId, inquiryData) {
  try {
    // Submit the inquiry through car manager
    const inquiry = carManager.submitInquiry(carId, inquiryData);
    
    // Create messaging thread
    messagingManager.createInquirySystemMessage(carId, {
      id: inquiry.id,
      buyer: inquiry.buyer,
      message: inquiry.message
    });

    return inquiry;
  } catch (error) {
    throw error;
  }
}

// Notification helpers
function showNotificationBadge() {
  const userId = localStorage.getItem('ridebazzar_user');
  if (!userId) return;

  const messageCount = getUnreadMessageCount();
  const notificationCount = getUnreadNotificationCount();
  const totalCount = messageCount + notificationCount;

  // Update navbar badge if it exists
  const badge = document.getElementById('notificationBadge');
  if (badge) {
    if (totalCount > 0) {
      badge.textContent = totalCount > 99 ? '99+' : totalCount;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }

  return totalCount;
}

// Initialize notification checking
function initializeNotifications() {
  if (authManager.isLoggedIn()) {
    showNotificationBadge();
    // Check for notifications every 30 seconds
    setInterval(showNotificationBadge, 30000);
  }
}

// Format message timestamp
function formatMessageTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString('en-IN', { 
    month: 'short', 
    day: 'numeric' 
  });
}

// Message templates
const messageTemplates = {
  interest: "Hi! I'm interested in your {car}. Is it still available?",
  priceInquiry: "Hi! What's your best price for the {car}?",
  testDrive: "Hi! I'd like to schedule a test drive for your {car}. When would be convenient?",
  negotiation: "Hi! I'm interested in your {car}. Would you consider {price} for it?",
  inspection: "Hi! Can I get more details about the condition and service history of your {car}?"
};

function getMessageTemplate(templateKey, car, customPrice = null) {
  let template = messageTemplates[templateKey] || '';
  template = template.replace('{car}', `${car.make} ${car.model} ${car.year}`);
  if (customPrice) {
    template = template.replace('{price}', carManager.formatPrice(customPrice));
  }
  return template;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeNotifications);
