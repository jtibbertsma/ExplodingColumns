# Exploding Columns

[Play Here][live]

[live]: http://jtibbertsma.github.io/ExplodingColumns

## Description

This game is a clone of the old SNES game Kirby's Avalanche. The concept of the
game is that pairs of tiles fall from the top of the screen, and the player can control
them as they fall. Connect four tiles of the same color to make them explode,
and then every tile on top will fall down. You lose if the middle column gets
filled up with tiles. The goal is to survive as long as possible.

## Mechanics

* The movement of the tiles is controlled with the a and d keys to move left and
right, respectively.
* Rotate the pair of tiles using w.
* Drop fast using s.
* 'Avalanches' will periodically fall from the top of the screen, blocking the player's
progress.
* The fall rate of descent of the pairs of tiles will increase after each third avalanche fall.
* The player can earn a decrease in the rate of descent by getting an explosion combo.
  * An explosion combo occurs when an explosion causes tiles to fall and create a group of four or
  more, creating another explosion.

## Todo

This is a list of features that I intend to implement soon.

- [ ] Have a button to begin playing instead of starting as soon as the player navigates to the page.
- [ ] After the game ends, have a button to play again. (Right now, you have to reload the page)
  - [ ] Have a nice transparent overlay over the canvas that fades in after the game ends
- [ ] Display the number of turns that a player has survived.
  - [ ] Store a player's high score as a cookie on their browser.
- [ ] Display the colors of the pair of tiles that will fall on the next turn.
- [ ] Improve page style in general.

Features that would be cool that I probably won't get to soon:

- [ ] Two player mode
- [ ] Against AI mode