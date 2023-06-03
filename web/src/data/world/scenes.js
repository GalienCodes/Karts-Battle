const scenes = [
  {
    sceneName: "SceneRoomZero",
    storySection: 'glow',
    obstacles: [ ],
    triggers: [
      { id: 'door', positionType: 'object', objId: 'SceneRoomZeroDoor', geometry: { type: "sphere", radius: 0.5 } }
    ],
    bounds: { z: [-1.8, 0.8], x: [-3, 3] },
    startPos: { x: 0, y: 0, z: 0},
    elems: {
      'SceneRoomZeroDoor': {
        condition: (strangeJuice) => {
          return strangeJuice.evolution > 2;
        }
      }
    },
    controls: [
      { 
        id: 'drink_strange_juice', 
        icon: 'strange-juice', 
        condition: (strangeJuice, storyInfo) => {
          let display = true;
          if(storyInfo) {
            if(storyInfo.storySection === 'glow') {
              if(storyInfo.storyIndex < 3) {
                display = false;
              }
            }
          }
          return display;
        }
      },
      {
        id: 'electrify', 
        icon: 'plug', 
        condition: (strangeJuice) => {
          return strangeJuice.evolution > 0;
        } 
      },
      { 
        id: 'scavenge_in_bin', 
        icon: 'bin', 
        condition: (strangeJuice) => {
          return strangeJuice.evolution > 1;
        } 
      }
    ]
  },
  {
    sceneName: "SceneBeach",
    storySection: "move-relaxed",
    obstacles: [
      { pos: [1, 0, -1], geometry: { type: "sphere", radius: 0.4 } },
      { pos: [-1, 0, -1], geometry: { type: "sphere", radius: 0.4 } }
    ],
    triggers: [
      { id: 'door', positionType: 'object', objId: 'SceneBeachDoor', geometry: { type: "sphere", radius: 0.5 } }
    ],
    bounds: { z: [-1.8, 0.8], x: [-3, 3] },
    startPos: { x: 0, y: 0, z: 0 }
  }
]

export default scenes;