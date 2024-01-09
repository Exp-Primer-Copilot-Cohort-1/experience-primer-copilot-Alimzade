// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { randomBytes } = require('crypto');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Create comments array
const commentsByPostId = {};

// Get all comments for a post
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

// Create a comment for a post
app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');

  // Get the content from the request body
  const { content } = req.body;

  // Get the comments for the post
  const comments = commentsByPostId[req.params.id] || [];

  // Add the new comment to the comments array
  comments.push({ id: commentId, content, status: 'pending' });

  // Update the comments for the post
  commentsByPostId[req.params.id] = comments;

  // Emit event to event bus
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: { id: commentId, content, postId: req.params.id, status: 'pending' },
  });

  // Send the response
  res.status(201).send(comments);
});

// Receive events from event bus
app.post('/events', async (req, res) => {
  console.log('Received event', req.body.type);

  // Get the event type and data
  const { type, data } = req.body;

  // If the event type is CommentModerated
  if (type === 'CommentModerated') {
    // Get the comments for the post
    const comments = commentsByPostId[data.postId];

    // Get the comment from the comments array
    const comment = comments.find((comment) => {
      return comment.id === data.id;
    });

    // Update the comment status
    comment.status = data.status;

    // Emit event to event bus
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: { ...comment, postId: data.postId },
    });
  }