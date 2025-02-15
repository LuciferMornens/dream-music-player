# MyDream Music Player 🎵

A modern, cosmic-themed music player built with Next.js 15 and React 19, featuring a stunning UI with ambient visual effects and seamless audio playback.

![MyDream Music Player](public/og-image.png)

## ✨ Features

- 🎨 Cosmic-themed UI with dynamic ambient effects and gradients
- 🎵 Seamless audio playback with precise track control
- 🎧 Advanced audio features:
  - Real-time progress tracking
  - Volume control with mute toggle
  - Keyboard-accessible progress bar
  - Cross-fade between tracks
- 📱 Responsive design with glass-morphism effects
- 🗂️ Genre-based track filtering
- 🔄 Real-time track updates
- 🎼 Support for MP3, WAV, and OGG formats
- 🎯 Accessibility features including ARIA labels and keyboard navigation
- 🚀 Optimized performance with lazy loading and image optimization

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with React 19 (App Router)
- **Styling**: 
  - [TailwindCSS](https://tailwindcss.com/) for utility-first styling
  - Custom gradient and glass-morphism effects
  - Framer Motion for smooth animations
- **Type Safety**: TypeScript with strict type checking
- **State Management**: 
  - React Context API for global player state
  - Custom hooks for audio, volume, and notification management
- **Media Handling**:
  - Custom audio player implementation with precise controls
  - Next.js Image optimization for cover art
- **Development Tools**:
  - ESLint for code quality
  - PostCSS for CSS processing
  - Proper file locking for concurrent operations

## 🚀 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mydream.git
   cd mydream
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 Core Components

### Audio Player Hook (useAudioPlayer)
- Manages audio playback state and controls
- Handles track loading, playing, pausing, and seeking
- Implements error handling and loading states
- Uses a singleton audio instance to prevent multiple playbacks

### Player Context
- Provides global state management for:
  - Current track information
  - Playback status
  - Volume controls
  - Track library
  - Notifications
  - Delete confirmations

### Track Management
- Supports track uploading and deletion
- Real-time library updates
- Genre-based filtering
- Featured track highlighting

### UI Components
- `TrackCard`: Displays individual track with controls
- `PageTransition`: Handles smooth page transitions
- Custom ambient background effects
- Glass-morphism cards with hover effects

## 📁 Project Structure

```
mydream/
├── app/                    # Next.js app directory
│   ├── components/        # React components
│   │   ├── PlayerContext.tsx    # Global player state
│   │   ├── TrackCard.tsx        # Track display component
│   │   └── ...                  # Other components
│   ├── hooks/             # Custom React hooks
│   │   ├── useAudioPlayer.ts    # Audio playback logic
│   │   ├── useVolume.ts         # Volume control
│   │   └── ...                  # Other hooks
│   ├── types/             # TypeScript definitions
│   └── page.tsx           # Main application page
├── public/                # Static files
│   ├── audio/            # Music files
│   └── images/           # Images and icons
└── styles/               # Global styles
```

## 🧪 Development

### Code Style
- Follows TypeScript strict mode guidelines
- Uses ESLint with Next.js configuration
- Implements proper error handling and loading states
- Maintains accessibility standards

### Performance Considerations
- Uses singleton audio instance to prevent memory leaks
- Implements proper cleanup in useEffect hooks
- Optimizes images using Next.js Image component
- Implements lazy loading for better initial load times

### State Management
- Uses React Context for global state
- Implements custom hooks for specific functionalities
- Maintains clean separation of concerns

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- Framer Motion for the beautiful animations
- The open-source community for inspiration and resources

---

Built with ❤️ using Next.js and React
