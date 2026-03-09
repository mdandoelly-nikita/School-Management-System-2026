// js/chat.js

// Initialize Realtime Database
let rtdb = null;

function initRealtimeDB() {
    if (!rtdb) {
        // Get the database URL from Firebase config or set manually
        const databaseURL = 'https://school-management-2026-e2f1b-default-rtdb.europe-west1.firebasedatabase.app';
        rtdb = firebase.database(databaseURL);
    }
    return rtdb;
}

// Create or get conversation between two users
async function getOrCreateConversation(user1Id, user2Id) {
    const db = initRealtimeDB();
    const conversationId = [user1Id, user2Id].sort().join('_');
    
    const conversationRef = db.ref(`conversations/${conversationId}`);
    const snapshot = await conversationRef.once('value');
    
    if (!snapshot.exists()) {
        await conversationRef.set({
            participants: [user1Id, user2Id],
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            lastMessage: '',
            lastMessageTime: firebase.database.ServerValue.TIMESTAMP
        });
    }
    
    return conversationId;
}

// Send a message
async function sendMessage(conversationId, senderId, senderName, senderRole, text, attachments = []) {
    const db = initRealtimeDB();
    const messageRef = db.ref(`messages/${conversationId}`).push();
    
    const messageData = {
        senderId,
        senderName,
        senderRole,
        text,
        attachments,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        read: false
    };
    
    await messageRef.set(messageData);
    
    // Update conversation last message
    await db.ref(`conversations/${conversationId}`).update({
        lastMessage: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        lastMessageTime: firebase.database.ServerValue.TIMESTAMP,
        lastMessageSender: senderId
    });
    
    return messageRef.key;
}

// Listen for new messages
function listenToMessages(conversationId, callback) {
    const db = initRealtimeDB();
    const messagesRef = db.ref(`messages/${conversationId}`).orderByChild('timestamp');
    
    messagesRef.on('value', (snapshot) => {
        const messages = [];
        snapshot.forEach((childSnapshot) => {
            messages.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        callback(messages);
    });
    
    return () => messagesRef.off();
}

// Listen to user's conversations
function listenToConversations(userId, callback) {
    const db = initRealtimeDB();
    
    // This is complex - we'll implement it differently
    // For now, we'll load conversations differently
}

// Mark messages as read
async function markMessagesAsRead(conversationId, userId) {
    const db = initRealtimeDB();
    const messagesRef = db.ref(`messages/${conversationId}`);
    
    const snapshot = await messagesRef.once('value');
    const updates = {};
    
    snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        if (message.senderId !== userId && !message.read) {
            updates[`${childSnapshot.key}/read`] = true;
        }
    });
    
    if (Object.keys(updates).length > 0) {
        await messagesRef.update(updates);
    }
}

// Get user conversations (simplified version)
async function getUserConversations(userId) {
    const db = initRealtimeDB();
    
    // Get all conversations that include this user
    const snapshot = await db.ref('conversations').once('value');
    const conversations = [];
    
    snapshot.forEach((childSnapshot) => {
        const conv = childSnapshot.val();
        if (conv.participants && conv.participants.includes(userId)) {
            conversations.push({
                id: childSnapshot.key,
                ...conv
            });
        }
    });
    
    // Sort by last message time (newest first)
    return conversations.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
}

// Get other participant in conversation
function getOtherParticipant(conversation, currentUserId) {
    return conversation.participants?.find(p => p !== currentUserId);
}

// Format timestamp
function formatMessageTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Today: show time
    if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // Yesterday
    if (diff < 48 * 60 * 60 * 1000) {
        return 'Yesterday';
    }
    // Older
    return date.toLocaleDateString();
}