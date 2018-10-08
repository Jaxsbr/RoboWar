$.WaveEngine = function (gameWorld) {
    this.GameWorld = gameWorld;
    this.WaveIndex = 0;    
    this.States = { Pending: 0, Busy: 0 };

    this.WaitTick = 10;
    this.WaitTime = this.WaitTick;
    this.ToneSound = new $.Sound('sounds/tone1.mp3', 1);
};

$.WaveEngine.prototype.Update = function () {
    if (this.States.Pending == 0 && this.States.Busy == 0) { this.States.Pending = 1; }
    if (this.States.Pending == 1) { this.UpdatePending(); }
    else if (this.States.Busy == 1) { this.UpdateBusy(); }
};

$.WaveEngine.prototype.UpdatePending = function () {
    this.WaitTime -= $.Delta;
    if (this.WaitTime <= 0) {
        this.WaitTime = this.WaitTick;
        this.States.Pending = 0;
        this.States.Busy = 1;
        this.WaveIndex++;
        this.ToneSound.Play();

        this.GameWorld.SpawnWave();
    }
};

$.WaveEngine.prototype.UpdateBusy = function () {
    if (this.GameWorld.SpawnedEnemies == this.GameWorld.SpawnCount &&
        this.GameWorld.Enemies.length <= 0) {
        this.States.Pending = 1;
        this.States.Busy = 0;
    }
};
