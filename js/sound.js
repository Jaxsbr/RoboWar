$.Sound = function(url, playbackRate = 1) {
    this.Reset(url, playbackRate);    
    this.Loop = false;
};

$.Sound.prototype.Play = function() {
    this.Audio.loop = this.Loop;
    this.Audio.play();        
}

$.Sound.prototype.Pause = function() {    
    this.Audio.pause();
}

$.Sound.prototype.Reset = function(url, playbackRate = 1) {    
    this.Url = url;    
    this.PlaybackRate = playbackRate;
    this.Audio = new Audio(this.Url);    
    this.Audio.playbackRate = this.PlaybackRate
}