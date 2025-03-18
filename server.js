const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all requests
app.use(cors());

// Middleware: Set JSON:API Content-Type for all responses
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/vnd.api+json");
  next();
});

// Parse JSON bodies
app.use(express.json({ type: "application/vnd.api+json" }));

// DELETE /conversations/:id
app.delete("/conversations/:id", (req, res) => {
  try {
    validateRequest(req, res);
    const user = authorize(req, res);
    if (!user) return;

    const { id } = req.params;
    const index = store.conversations.findIndex((c) => c.id === id);

    if (index === -1) {
      return res.status(404).json({
        errors: [
          {
            status: "404",
            title: "Not Found",
            detail: "Conversation not found",
          },
        ],
      });
    }

    // Check ownership
    if (store.conversations[index].author !== user.id) {
      return res.status(403).json({
        errors: [
          {
            status: "403",
            title: "Forbidden",
            detail: "You do not have access to this conversation",
          },
        ],
      });
    }

    // Remove it from the array
    store.conversations.splice(index, 1);

    // Return 204 (No Content) on successful delete
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Internal Server Error",
          detail: "An unexpected error occurred",
        },
      ],
    });
  }
});

// PATCH /conversations/:id
app.patch("/conversations/:id", (req, res) => {
  try {
    validateRequest(req, res);
    const user = authorize(req, res);
    if (!user) return;

    const { id } = req.params;
    const conversation = store.conversations.find((c) => c.id === id);

    if (!conversation) {
      return res.status(404).json({
        errors: [
          {
            status: "404",
            title: "Not Found",
            detail: "Conversation not found",
          },
        ],
      });
    }

    if (conversation.author !== user.id) {
      return res.status(403).json({
        errors: [
          {
            status: "403",
            title: "Forbidden",
            detail: "You do not have access to this conversation",
          },
        ],
      });
    }

    // Parse incoming data
    const { data } = req.body;
    // e.g. data.attributes.archived = true/false
    const { archived } = data.attributes;

    // Update conversation
    conversation.archived = archived;

    // Return updated conversation
    return res.status(200).json({
      data: {
        type: "conversations",
        id: conversation.id,
        attributes: {
          name: conversation.name,
          author: conversation.author,
          archived: conversation.archived,
          messages: conversation.messages,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Internal Server Error",
          detail: "An unexpected error occurred",
        },
      ],
    });
  }
});


// Global data store (renamed from "data" to "store" to avoid conflicts)
const store = {
  conversations: [
    {
      id: "d259d0be-a4cd-41f8-a19b-e333eab1fe21",
      name: "Conversation #1",
      author: "c89ee220-37fc-4781-ae07-24fcaf91281a",
      messages: [
        {
          id: "12f22418-4b56-44ad-9404-cf9231aad3d4",
          text: "Hello, World!",
          author: "c89ee220-37fc-4781-ae07-24fcaf91281a"
        }
      ],
      archived: false,
    },
    {
      id: "c6b3b2c2-2f7f-4d3e-8b0e-1b5d0b7b3f8d",
      name: "Conversation #2",
      author: "f5a2d4e7-3b8f-4c7d-8e7e-3f1b4f7e8f7d",
      messages: [
        {
          id: "d0d8f7e8-7b3f-4b0e-8d3e-2c2f7f6b3b2c",
          text: "Hi, there!",
          author: "AI",
        }
      ],
      archived: false,
    }
  ],
  users: [
    {
      id: "c89ee220-37fc-4781-ae07-24fcaf91281a",
      username: "user1",
      password: "password1",
      email: "user1@example.com"
    },
    {
      id: "f5a2d4e7-3b8f-4c7d-8e7e-3f1b4f7e8f7d",
      username: "user2",
      password: "password2",
      email: "user2@example.com"
    }
  ]
};

const firstMessage = {
  id: "12f22418-4b56-44ad-9404-cf9231aad3d4",
  text: "Hello, how can I help you?",
  author: "AI",
};

// Validate that the request uses JSON:API headers
function validateRequest(req, res) {
  if (String(req.headers["content-type"]) !== "application/vnd.api+json") {
    return res.status(415).json({
      errors: [{
        status: "415",
        title: "Unsupported Content-Type",
        detail: `Unsupported Content-Type header: ${req.headers["content-type"]}`
      }]
    });
  }
  if (!req.accepts("application/vnd.api+json")) {
    return res.status(415).json({
      errors: [{
        status: "415",
        title: "Unsupported Accept header",
        detail: `Unsupported Accept header: ${req.headers["accept"]}`
      }]
    });
  }
}

// Authorize user by token (passed as the Authorization header)
function authorize(req, res) {
  const { authorization } = req.headers;
  const token = String(authorization);
  if (!token) {
    res.status(401).json({
      errors: [{
        status: "401",
        title: "Unauthorized",
        detail: "No token provided"
      }]
    });
    return null;
  }
  const user = store.users.find(user => user.id === token);
  if (!user) {
    res.status(401).json({
      errors: [{
        status: "401",
        title: "Unauthorized",
        detail: "Invalid token"
      }]
    });
    return null;
  }
  return user;
}

// Helper to format a conversation in JSON:API format
function formatConversation(conversation) {
  return {
    type: "conversations",
    id: conversation.id,
    attributes: {
      name: conversation.name,
      author: conversation.author,
      messages: conversation.messages,
      archived: conversation.archived || false, // include archived status
    }
  };
}

// Helper to format a message in JSON:API format
function formatMessage(message) {
  return {
    type: "messages",
    id: message.id,
    attributes: {
      text: message.text,
      author: message.author
    }
  };
}

// Generate an AI response if needed (internal function)
function generateAIResponse(conversation) {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  if (lastMessage.author === "AI") return;

  // 1) Define an array of possible responses
  const possibleReplies = [
    "AI: I'm sorry, I don't understand. Can you please rephrase that?",
    "AI: That's really interesting! Tell me more.",
    "AI: Hmm, let me think about that for a moment...",
    "AI: Fascinating perspective! What's your next thought?",
    "AI: Could you elaborate on that?",
    "AI: I see. Is there anything else you'd like to discuss?",
    "AI: Interesting! How does that make you feel?",
    "AI: Let me check my notes... Actually, I'd love to hear more details.",
  ];

  // 2) Pick one at random
  const randomIndex = Math.floor(Math.random() * possibleReplies.length);
  const randomReply = possibleReplies[randomIndex];

  // 3) Create the AI message using a random reply
  const aiMessage = {
    id: crypto.randomUUID(),
    text: randomReply,
    author: "AI",
  };

  // 4) Push it into conversation messages
  conversation.messages.push(aiMessage);
}

// Simple delay helper
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Authenticate endpoint (expects payload per JSON:API)
app.post("/authenticate", (req, res) => {
  try {
    validateRequest(req, res);
    const { data } = req.body;
    const { username, password } = data.attributes;
    const user = store.users.find(u => u.username === username && u.password === password);
    if (!user) {
      return res.status(401).json({
        errors: [{
          status: "401",
          title: "Unauthorized",
          detail: "Invalid username or password"
        }]
      });
    }
    res.status(200).json({
      meta: { token: user.id }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [{
        status: "500",
        title: "Internal Server Error",
        detail: "An unexpected error occurred"
      }]
    });
  }
});

// Get all conversations for the authenticated user
app.get("/conversations", (req, res) => {
  try {
    validateRequest(req, res);
    const user = authorize(req, res);
    if (!user) return;
    const userConversations = store.conversations.filter(conversation => conversation.author === user.id);
    res.status(200).json({
      data: userConversations.map(formatConversation)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [{
        status: "500",
        title: "Internal Server Error",
        detail: "An unexpected error occurred"
      }]
    });
  }
});

// Get a single conversation by ID (if the user is authorized)
app.get("/conversations/:id", (req, res) => {
  try {
    validateRequest(req, res);
    const user = authorize(req, res);
    if (!user) return;
    const conversation = store.conversations.find(c => c.id === req.params.id);
    if (!conversation) {
      return res.status(404).json({
        errors: [{
          status: "404",
          title: "Not Found",
          detail: "Conversation not found"
        }]
      });
    }
    if (conversation.author !== user.id) {
      return res.status(403).json({
        errors: [{
          status: "403",
          title: "Forbidden",
          detail: "You do not have access to this conversation"
        }]
      });
    }
    res.status(200).json({
      data: formatConversation(conversation)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [{
        status: "500",
        title: "Internal Server Error",
        detail: "An unexpected error occurred"
      }]
    });
  }
});

// Create a new conversation (expects JSON:API formatted payload)
app.post("/conversations", (req, res) => {
  try {
    validateRequest(req, res);
    const author = authorize(req, res);
    if (!author) return;
    const { data } = req.body;
    const { name } = data.attributes;
    const conversation = {
      id: crypto.randomUUID(),
      name,
      author: author.id,
      messages: [firstMessage],
    };
    store.conversations.push(conversation);
    res.status(201).json({
      data: formatConversation(conversation)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [{
        status: "500",
        title: "Internal Server Error",
        detail: "An unexpected error occurred"
      }]
    });
  }
});

// Add a new message to a conversation (expects JSON:API payload)
app.post("/conversations/:id", (req, res) => {
  try {
    validateRequest(req, res);
    const author = authorize(req, res);
    if (!author) return;
    const conversation = store.conversations.find(c => c.id === req.params.id);
    if (!conversation) {
      return res.status(404).json({
        errors: [{
          status: "404",
          title: "Not Found",
          detail: "Conversation not found"
        }]
      });
    }
    if (conversation.author !== author.id) {
      return res.status(403).json({
        errors: [{
          status: "403",
          title: "Forbidden",
          detail: "You do not have access to this conversation"
        }]
      });
    }
    const { data } = req.body;
    const { text } = data.attributes;
    const message = {
      id: crypto.randomUUID(),
      text,
      author: author.id,
    };
    conversation.messages.push(message);
    res.status(201).json({
      data: formatMessage(message)
    });
    // Generate AI response after a delay if needed
    delay(2500).then(() => generateAIResponse(conversation));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [{
        status: "500",
        title: "Internal Server Error",
        detail: "An unexpected error occurred"
      }]
    });
  }
});

// Serve openapi.json file
app.get("/openapi.json", (req, res) => {
  res.sendFile(__dirname + "/openapi.json");
});

// Serve doc.html file
app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/doc.html");
});

app.listen(port, () => {
  console.log(`API is running on port ${port}`);
});
