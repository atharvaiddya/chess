# Chess Game

A browser-based chess game built with HTML, CSS, and JavaScript.

## Current Features

- Complete chessboard and piece setup
- Legal movement for all pieces
- Captures
- Check detection
- Checkmate detection
- Stalemate detection
- Castling
- Pawn promotion
- King safety validation
- Prevention of moves that leave your king in check
- Backend game synchronization

## Current Scope

The current version focuses on implementing the core chess mechanics, validating game state on the backend, and synchronizing moves between the backend and frontend.

The following chess rules are intentionally not implemented at this stage:

- En passant
- Threefold repetition
- Fifty move rule
- Insufficient material draw detection

These rules are intentionally deferred so that development can focus on the core game architecture and backend functionality. They can be added in a future iteration as the project continues to evolve.

## Future Improvements

After the multiplayer and backend systems are developed, I plan to continue expanding the game.

Possible future improvements include:

- En passant
- Threefold repetition
- Fifty move rule
- Insufficient material detection
- Improved draw handling
- Multiplayer support
- Move history
- Improved UI and animations

## Project Goal

The main goal of this project is not only to build a chess game, but also to use it as a foundation for learning game-state management, multiplayer communication, and backend development.

The chess rules will continue to be improved as the project evolves.

## v1.0
This release represents v1.0 of the project.

At this stage, the core chess mechanics are implemented, move validation and game-state logic are handled by the backend, and validated moves are synchronized with the frontend.

Further development, including multiplayer onboarding and WebSocket-based communication, is planned for a future iteration.
