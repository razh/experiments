/*globals define*/
define(function() {
  'use strict';

  return {
    player: {
      color: 'rgba(0, 255, 0, 1.0)',
      health: 100,
      speed: 15,
      frequency: 1000 / 10, // Number of ms to fire n bullets/second.
      hitFrequency: 1000 / 40 // Number of ms between player injuries.
    },
    zombie: {
      color: 'rgba(255, 0, 0, 1.0)',
      speed: 20,
      radiusSquared: 150 * 150,
      health: 10
    },
    civilian: {
      color: 'rgba(255, 255, 255, 1.0)',
      radiusSquared: 75 * 75,
      speed: 25
    },
    entity: {
      color: 'rgba(255, 0, 255, 1.0)'
    },
    bullet: {
      color: 'rgba(255, 255, 0, 1.0)'
    }
  };
});
