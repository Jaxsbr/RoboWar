# Robo War
## 2.0

### Overview
This game was originaly written and hosted in a ASP.NET web forms application.
Migrating to free github hosting ment that the SQL database dependency would have to be dropped. All game specific logic was ported to a simple SPA application while menu and score tracking logic was removed.

This game was fun to play in a prototype phase and thus will become a 2.0 project.


### Todo
- [ ] Improve graphics
- [ ] Add music
- [ ] Progressive player abilities
- [ ] Menu Rework
- [ ] Score Tracking (Azure)
- [ ] Offline Score Tracking (Cookies)

### Improve graphics
- [ ] Concept a prototype (Produce games colour pallet)
- [ ] Remaster terrain (Robot Graveyard)
- [ ] Remaster all animations
- [ ] Rework partical effects

### Add music
- [x] Add background track
- [x] Add player shoot
- [x] Add player melee damage
- [x] Add power-up collected
- [x] Add enemy die
- [x] Add round count tone
- [ ] Fix sounds that perform badly
- [ ] Add random sounds (melee and tone)

### Progressive player abilities
- [ ] Implement player stats (speed, bullets p/s, health)
- [ ] Implement stats mature by level (player gets boosts in stats)

## Menu Rework
### Welcome Page
- [ ] Welcome page (cookie notification)
### Leaderboard Page
- [ ] Leader board page (shows your personal best time against a score board)
### Mini Map
- [ ] Mini map improvements (size, animations, decoration)

### Score Tracking (Azure)
- [ ] Score persist (Azure storage else cookie)
- [ ] Learder board

### Feature Prototype - Improved terrain
- [ ] Implement collidable bomb spawning section (player and enemy hazard)
- [ ] Water terrain mechanic (water slows player)
- [ ] Art: Add particles (electric cloud/strands with water contact)
- [ ] Sound: Sound of shorting electrics
