/*globals define*/
define(function() {
  'use strict';

  return {
    padding: 10,
    player: {
      color: 'rgba(0, 255, 0, 1.0)',
      health: 100,
      speed: 75,
      frequency: 1000 / 10, // Number of ms to fire n bullets/second.
      hitFrequency: 1000 / 40 // Number of ms between player injuries.
    },
    zombie: {
      count: 20,
      color: 'rgba(255, 0, 0, 1.0)',
      speed: 30,
      radius: 150,
      health: 10
    },
    civilian: {
      count: 1000,
      color: 'rgba(255, 255, 255, 1.0)',
      radius: 75,
      speed: 40
    },
    entity: {
      color: 'rgba(255, 0, 255, 1.0)'
    },
    bullet: {
      color: 'rgba(255, 255, 0, 1.0)'
    }
  };
});
