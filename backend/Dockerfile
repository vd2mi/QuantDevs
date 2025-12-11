FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY server.js ./
COPY helpers/ ./helpers/
COPY utils.js ./

# Expose port (Hugging Face uses port 7860)
EXPOSE 7860

# Set environment variables (can be overridden by HF secrets)
ENV PORT=7860
ENV NODE_ENV=production

# Start server
CMD ["node", "server.js"]

