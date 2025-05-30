/* eslint-disable no-invalid-this */
this.defaults = {
  drawing: {
    alpha: 1,
    pos: [0, 0],
    angle: 0,
    scale: [1, 1],
    attachTo: 'world',
    isBehind: false,
    noLerp: false,
    shapes: [],
  },
  drawingBoxShape: {
    colour: 0xffffff,
    alpha: 1,
    pos: [0, 0],
    angle: 0,
    size: [1, 1],
    noLerp: false,
  },
  drawingCircleShape: {
    type: 'ci',
    colour: 0xffffff,
    alpha: 1,
    pos: [0, 0],
    angle: 0,
    size: [1, 1],
    noLerp: false,
  },
  drawingPolyShape: {
    type: 'po',
    colour: 0xffffff,
    alpha: 1,
    pos: [0, 0],
    angle: 0,
    scale: [1, 1],
    vertices: [
      [0, 0],
      [1, 0],
      [0, 1],
    ],
    noLerp: false,
  },
  drawingLineShape: {
    type: 'li',
    colour: 0xffffff,
    alpha: 1,
    pos: [0, 0],
    end: [1, 1],
    width: 1,
    noLerp: false,
  },
  drawingTextShape: {
    type: 'tx',
    colour: 0xffffff,
    alpha: 1,
    pos: [0, 0],
    angle: 0,
    text: '',
    size: 1,
    align: 'left',
    bold: false,
    italic: false,
    shadow: true,
    noLerp: false,
  },
  drawingImageShape: {
    id: '',
    region: null,
    colour: 0xffffff,
    alpha: 1,
    pos: [0, 0],
    angle: 0,
    size: [1, 1],
    noLerp: false,
  },
  body: {
    type: 's',
    p: [0, 0],
    lv: [0, 0],
    a: 0,
    av: 0,
    fricp: false,
    fric: 1,
    de: 0.3,
    re: 0.8,
    ld: 0,
    ad: 0,
    fr: false,
    bu: false,
    cf: {
      x: 0,
      y: 0,
      w: false,
      ct: 0,
    },
    fz: {
      on: false,
      x: 0,
      y: 0,
      d: true,
      p: true,
      a: true,
    },
    f_c: 1,
    f_p: true,
    f_1: true,
    f_2: true,
    f_3: true,
    f_4: true,
  },
  bodyFixture: {
    n: 'fixture',
    f: 0xffffff,
    fp: null,
    fr: null,
    re: null,
    de: null,
    d: false,
    np: false,
    ng: false,
    ig: false,
  },
  bodyBoxShape: {
    type: 'bx',
    c: [0, 0],
    a: 0,
    w: 1,
    h: 1,
    sk: false,
  },
  bodyCircleShape: {
    type: 'ci',
    c: [0, 0],
    r: 1,
    sk: false,
  },
  bodyPolyShape: {
    type: 'po',
    c: [0, 0],
    a: 0,
    s: 1,
    v: [
      [0, 0],
      [1, 0],
      [0, 1],
    ],
  },
  arrow: {
    type: 'arrow',
    p: [0, 0],
    lv: [0, 0],
    a: 0,
    av: 0,
    fte: 150,
    did: -1,
    ni: false,
    visible: true,
  },
};

this.game = {
  vars: {},
  events: {
    addEventListener: function(eventName, options, listener) {
      this.eventListeners[eventName]?.push({
        options: options,
        listener: listener,
      });
    },
    fireEvent: function(eventName, options, args) {
      if (game.compatMode) {
        if (eventName == 'platformCollision') eventName = 'bodyCollision';
        if (options?.collideWith == 'platform') options.collideWith = 'body';
      }

      try {
        const listeners = this.eventListeners[eventName];
        for (let i = 0; i < listeners.length; i++) {
          if (listeners[i]?.options) {
            if (listeners[i].options.perPlayer != options?.perPlayer) continue;
            if (listeners[i].options.collideWith != options?.collideWith) continue;
          }

          listeners[i].listener(...args);
        }
      } catch (e) {
        e.isModeError = true;
        throw e;
      }
    },
    eventListeners: {
      roundStart: [],
      step: [],
      playerDie: [],
      discCollision: [],
      arrowCollision: [],
      platformCollision: [],
      bodyCollision: [],
    },
  },
  state: null,
  inputs: {},
  lobby: {},
  world: {
    addShapeIntoWorld: function(shapeData) {
      let fixture;
      let shape;

      if (shapeData.isProxy) {
        fixture = Object.assign(
            JSON.parse(JSON.stringify(defaults.bodyFixture)),
            game.state.physics.fixtures[shapeData.id],
        );
        shape = fixture.geo;
      } else {
        fixture = Object.assign(
            JSON.parse(JSON.stringify(defaults.bodyFixture)),
            shapeData,
        );
        shape = fixture.geo ?? {type: 'bx'};
      }

      switch (shape.type) {
        case 'bx':
          shape = Object.assign(
              JSON.parse(JSON.stringify(defaults.bodyBoxShape)),
              shape,
          );
          break;
        case 'ci':
          shape = Object.assign(
              JSON.parse(JSON.stringify(defaults.bodyCircleShape)),
              shape,
          );
          break;
        case 'po':
          shape = Object.assign(
              JSON.parse(JSON.stringify(defaults.bodyPolyShape)),
              shape,
          );
          break;
      }

      game.state.physics.shapes.push(shape);

      fixture.sh = game.state.physics.shapes.length - 1;
      delete fixture.geo;
      game.state.physics.fixtures.push(fixture);

      return game.state.physics.fixtures.length - 1;
    },
    createPlatform: function(viewOrder, platData) {
      let finalBody;

      if (platData.isProxy) {
        finalBody = Object.assign(
            JSON.parse(JSON.stringify(defaults.body)),
            game.state.physics.bodies[platData.platId],
        );
      } else {
        finalBody = Object.assign(
            JSON.parse(JSON.stringify(defaults.body)),
            platData,
        );
      }

      finalBody.s = {
        type: finalBody.type,
        n: finalBody.n,
        fric: finalBody.fric,
        fricp: finalBody.fricp,
        re: finalBody.re,
        de: finalBody.de,
        ld: finalBody.ld,
        ad: finalBody.ad,
        fr: finalBody.fr,
        bu: finalBody.bu,
        f_c: finalBody.f_c,
        f_p: finalBody.f_p,
        f_1: finalBody.f_1,
        f_2: finalBody.f_2,
        f_3: finalBody.f_3,
        f_4: finalBody.f_4,
      };

      delete finalBody.type;
      delete finalBody.n;
      delete finalBody.fric;
      delete finalBody.fricp;
      delete finalBody.re;
      delete finalBody.de;
      delete finalBody.ld;
      delete finalBody.ad;
      delete finalBody.fr;
      delete finalBody.bu;
      delete finalBody.f_c;
      delete finalBody.f_p;
      delete finalBody.f_1;
      delete finalBody.f_2;
      delete finalBody.f_3;
      delete finalBody.f_4;

      finalBody.cf = Object.assign(
          JSON.parse(JSON.stringify(defaults.body.cf)),
          finalBody.cf,
      );
      finalBody.fx = [];

      for (let i = 0; i < platData.shapes.length; i++) {
        if (!platData.shapes[i]) {
          const e = new ReferenceError('Shape #' + i + ' is empty');
          e.gmSubLevel = 1;
          throw e;
        }

        finalBody.fx.push(this.addShapeIntoWorld(platData.shapes[i]));
      }

      delete finalBody.shapes;

      game.state.physics.bodies.push(finalBody);
      game.state.physics.bro.splice(
          Math.min(viewOrder ?? 0, game.state.physics.bro.length),
          0,
          game.state.physics.bodies.length - 1,
      );

      return game.state.physics.bodies.length - 1;
    },
    clonePlatform: function(id, cloneJoints = false) {
      if (!game.state.physics.bodies[id]) return null;

      const finalBody = JSON.parse(
          JSON.stringify(game.state.physics.bodies[id]),
      );
      const newFx = [];

      for (let i = 0; i < finalBody.fx.length; i++) {
        const fixture = JSON.parse(
            JSON.stringify(game.state.physics.fixtures[finalBody.fx[i]]),
        );
        const shape = JSON.parse(
            JSON.stringify(game.state.physics.shapes[fixture.sh]),
        );

        game.state.physics.shapes.push(shape);
        fixture.sh = game.state.physics.shapes.length - 1;

        game.state.physics.fixtures.push(fixture);
        newFx.push(game.state.physics.fixtures.length - 1);
      }

      finalBody.fx = newFx;

      game.state.physics.bodies.push(finalBody);

      const finalId = game.state.physics.bodies.length - 1;

      game.state.physics.bro.unshift(finalId);

      if (cloneJoints) {
        for (let i = 0; i < game.state.physics.joints.length; i++) {
          let joint = game.state.physics.joints[i];
          if (!joint) continue;

          joint = JSON.parse(JSON.stringify(joint));

          let connected = false;

          if (joint.ba === id) {
            connected = true;
            joint.ba = finalId;
          } else if (joint.bb === id) {
            connected = true;
            joint.bb = finalId;
          }

          if (connected) game.state.physics.joints.push(joint);
        }
      }

      return finalId;
    },
    deletePlatform: function(id) {
      const fxList = game.state.physics.bodies[id].fx;

      delete game.state.physics.bodies[id];
      game.state.physics.bro.splice(game.state.physics.bro.indexOf(id), 1);

      for (const i of fxList) {
        delete game.state.physics.shapes[game.state.physics.fixtures[i].sh];
        delete game.state.physics.fixtures[i];
      }

      for (let i = 0; i < game.state.physics.joints.length; i++) {
        if (
          game.state.physics.joints[i]?.ba !== id &&
          game.state.physics.joints[i]?.bb !== id
        ) {
          continue;
        }
        delete game.state.physics.joints[i];
      }

      for (let i = 0; i < game.state.capZones.length; i++) {
        if (!fxList.includes(game.state.capZones[i].i)) continue;
        delete game.state.capZones[i];
      }
    },
    addShapeToPlat: function(platId, shapeData) {
      const body = game.state.physics.bodies[platId];

      if (!shapeData) {
        const e = new TypeError('Shape is invalid');
        e.gmSubLevel = 1;
        throw e;
      }

      body.fx.push(this.addShapeIntoWorld(shapeData));

      return body.fx.length - 1;
    },
    movePlatShape: function(platId, fromIndex, toIndex) {
      const body = game.state.physics.bodies[platId];

      const fxId = body.fx.splice(fromIndex, 1);
      body.fx.splice(Math.min(toIndex, body.fx.length), 0, fxId);

      return toIndex;
    },
    removeShapeFromPlat: function(platId, shapeIndex) {
      game.state.physics.bodies[platId].fx.splice(shapeIndex, 1);
    },
    getPlatIdByName: function(name) {
      for (let i = 0; i < game.state.physics.bodies.length; i++) {
        const n =
          game.state.physics.bodies[i]?.n ??
          game.lobby.settings.map.physics.bodies[i]?.n ??
          null;
        if (n === name) return i;
      }
      return -1;
    },
    createBody: function(options) {
      const finalBody = Object.assign(
          JSON.parse(JSON.stringify(defaults.body)),
          options.bodyDef,
      );
      finalBody.cf = Object.assign(
          JSON.parse(JSON.stringify(defaults.body.cf)),
          finalBody.cf,
      );

      finalBody.fx = [];

      for (let i = 0; i < options.fixtureDefs.length; i++) {
        const fixture = Object.assign(
            JSON.parse(JSON.stringify(defaults.bodyFixture)),
            options.fixtureDefs[i],
        );

        let shape = options.shapeDefs[i] ?? {type: 'bx'};

        switch (shape.type) {
          case 'bx':
            shape = Object.assign(
                JSON.parse(JSON.stringify(defaults.bodyBoxShape)),
                shape,
            );
            break;
          case 'ci':
            shape = Object.assign(
                JSON.parse(JSON.stringify(defaults.bodyCircleShape)),
                shape,
            );
            break;
          case 'po':
            shape = Object.assign(
                JSON.parse(JSON.stringify(defaults.bodyPolyShape)),
                shape,
            );
            break;
        }

        game.state.physics.shapes.push(shape);

        fixture.sh = game.state.physics.shapes.length - 1;
        game.state.physics.fixtures.push(fixture);
        finalBody.fx.push(game.state.physics.fixtures.length - 1);
      }

      game.state.physics.bodies.push(finalBody);
      game.state.physics.bro.splice(
          Math.min(options.viewOrder ?? Infinity, game.state.physics.bro.length),
          0,
          game.state.physics.bodies.length - 1,
      );

      return game.state.physics.bodies.length - 1;
    },
    addFixtureShapeToBody: function(options) {
      const fixture = Object.assign(
          JSON.parse(JSON.stringify(defaults.bodyFixture)),
          options.fixtureDef,
      );

      let shape = options.shapeDef ?? {type: 'bx'};

      switch (shape.type) {
        case 'bx':
          shape = Object.assign(
              JSON.parse(JSON.stringify(defaults.bodyBoxShape)),
              shape,
          );
          break;
        case 'ci':
          shape = Object.assign(
              JSON.parse(JSON.stringify(defaults.bodyCircleShape)),
              shape,
          );
          break;
        case 'po':
          shape = Object.assign(
              JSON.parse(JSON.stringify(defaults.bodyPolyShape)),
              shape,
          );
          break;
      }

      game.state.physics.shapes.push(shape);

      fixture.sh = game.state.physics.shapes.length - 1;
      game.state.physics.fixtures.push(fixture);
      game.state.physics.bodies[options.bodyId]?.fx.push(
          game.state.physics.fixtures.length - 1,
      );

      return game.state.physics.fixtures.length - 1;
    },
    deleteBody: function(id) {
      const fxList = game.state.physics.bodies[id].fx;

      delete game.state.physics.bodies[id];
      game.state.physics.bro.splice(game.state.physics.bro.indexOf(id), 1);

      for (const i of fxList) {
        delete game.state.physics.shapes[game.state.physics.fixtures[i].sh];
        delete game.state.physics.fixtures[i];
      }

      for (let i = 0; i < game.state.physics.joints.length; i++) {
        if (
          game.state.physics.joints[i]?.ba !== id &&
          game.state.physics.joints[i]?.bb !== id
        ) {
          continue;
        }
        delete game.state.physics.joints[i];
      }

      for (let i = 0; i < game.state.capZones.length; i++) {
        if (!fxList.includes(game.state.capZones[i].i)) continue;
        delete game.state.capZones[i];
      }
    },
    createArrow: function(arrow) {
      const finalArrow = Object.assign(
          JSON.parse(JSON.stringify(defaults.arrow)),
          arrow,
      );

      game.state.projectiles.push(finalArrow);

      return game.state.projectiles.length - 1;
    },
    killDisc: function(id, allowRespawn = true) {
      game.state.gmExtra.kills.push({id: id, allowRespawn: allowRespawn});
    },
    getDiscRadius: (id) =>
      game.lobby.settings.bal[id] ?
        1 + Math.max(Math.min(game.lobby.settings.bal[id] / 100, 1), -0.94) :
        1,
    triggerWin: function(id) {
      if (game.state.fte > -1) return;

      game.state.fte = 90;
      game.state.lscr = id;

      if (id >= 0) {
        game.state.scores[id] ??= 0;
        game.state.scores[id]++;
      }
    },
    endRound: function() {
      game.state.gmExtra.endRound = true;
    },
    rayCast: (origin, end, filter) => rayCast(origin, end, filter, game.compatMode),
    rayCastAll: (origin, end, filter) => rayCastAll(origin, end, filter, game.compatMode),
    disableDeathBarrier: false,
  },
  graphics: {
    addShapeToDrawing: function(drawingId, shape) {
      const drawing = game.graphics.drawings[drawingId];

      if (!drawing) return;

      if (!shape?.type) {
        const e = new TypeError('Tried to add an invalid shape to a drawing.');
        e.gmSubLevel = 1;
        throw e;
      }

      switch (shape.type) {
        case 'bx':
          drawing.shapes.push(
              Object.assign(
                  JSON.parse(JSON.stringify(defaults.drawingBoxShape)),
                  shape,
              ),
          );
          break;
        case 'ci':
          drawing.shapes.push(
              Object.assign(
                  JSON.parse(JSON.stringify(defaults.drawingCircleShape)),
                  shape,
              ),
          );
          break;
        case 'po':
          drawing.shapes.push(
              Object.assign(
                  JSON.parse(JSON.stringify(defaults.drawingPolyShape)),
                  shape,
              ),
          );
          break;
        case 'li':
          drawing.shapes.push(
              Object.assign(
                  JSON.parse(JSON.stringify(defaults.drawingLineShape)),
                  shape,
              ),
          );
          break;
        case 'tx':
          drawing.shapes.push(
              Object.assign(
                  JSON.parse(JSON.stringify(defaults.drawingTextShape)),
                  shape,
              ),
          );
          break;
        case 'im':
          drawing.shapes.push(
              Object.assign(
                  JSON.parse(JSON.stringify(defaults.drawingImageShape)),
                  shape,
              ),
          );
          break;
      }

      return drawing.shapes.length - 1;
    },
    createDrawing: function(drawing) {
      const finalDrawing = Object.assign(
          JSON.parse(JSON.stringify(defaults.drawing)),
          drawing,
      );

      game.graphics.drawings.push(finalDrawing);

      if (!drawing.shapes) return game.graphics.drawings.length - 1;

      for (let i = 0; i < drawing.shapes.length; i++) {
        const shape = drawing.shapes[i];

        if (!shape) {
          const e = new ReferenceError('Shape #' + i + ' is empty');
          e.gmSubLevel = 1;
          throw e;
        }

        switch (shape.type) {
          case 'bx':
            drawing.shapes[i] = Object.assign(
                JSON.parse(JSON.stringify(defaults.drawingBoxShape)),
                shape,
            );
            break;
          case 'ci':
            drawing.shapes[i] = Object.assign(
                JSON.parse(JSON.stringify(defaults.drawingCircleShape)),
                shape,
            );
            break;
          case 'po':
            drawing.shapes[i] = Object.assign(
                JSON.parse(JSON.stringify(defaults.drawingPolyShape)),
                shape,
            );
            break;
          case 'li':
            drawing.shapes[i] = Object.assign(
                JSON.parse(JSON.stringify(defaults.drawingLineShape)),
                shape,
            );
            break;
          case 'tx':
            drawing.shapes[i] = Object.assign(
                JSON.parse(JSON.stringify(defaults.drawingTextShape)),
                shape,
            );
            break;
          case 'im':
            drawing.shapes[i] = Object.assign(
                JSON.parse(JSON.stringify(defaults.drawingImageShape)),
                shape,
            );
            break;
          default:
            const e = new TypeError('Shape #' + i + ' is invalid');
            e.gmSubLevel = 1;
            throw e;
        }
      }

      return game.graphics.drawings.length - 1;
    },
    bakeDrawing: function(id, resolution = 1) {
      if (!game.graphics.drawings[id]) return;
      const baked = bakeDrawing(id, resolution, game.state);

      game.graphics.drawings[id].shapes = [
        {
          type: 'im',
          id: baked.id,
          region: null,
          colour: 0xffffff,
          alpha: 1,
          pos: [0.01, 0.01],
          angle: 0,
          size: [baked.width, baked.height],
          noLerp: true,
        },
      ];
    },
    getScreenSize: () => [
      730 / game.state.physics.ppm,
      500 / game.state.physics.ppm,
    ],
  },
  audio: {
    playSound: playSound,
    playSoundAtWorldPos: function(id, volume, xPos) {
      const scaledPPM = game.state.physics.ppm * game.graphics.camera.scale[0];

      let panning = xPos - game.graphics.camera.pos[0] + 365 / scaledPPM;
      panning = (panning / 365) * scaledPPM - 1;

      game.audio.playSound(id, volume, panning);
    },
    stopAllSounds: stopAllSounds,
  },
  debugLog: debugLog,
};

const shapeProxyValidator = {
  get(fxId, key) {
    if (key === 'isProxy') return true;
    if (key === 'id') return fxId[0];

    const fx = game.state.physics.fixtures[fxId[0]];
    if (key === 'geo') {
      return game.state.physics.shapes[fx.sh];
    }
    return fx[key];
  },
  set(fxId, key, value) {
    game.state.physics.fixtures[fxId[0]][key] = value;
    return true;
  },
};

const shapeListProxyValidator = {
  get(bodyId, key) {
    if (key === 'isProxy') return true;

    if (key === 'length') {
      return game.state.physics.bodies[bodyId[0]].fx.length;
    }
    const fxId = game.state.physics.bodies[bodyId[0]].fx[key];
    if (!shapeProxies[fxId]) {
      shapeProxies[fxId] = new Proxy([fxId], shapeProxyValidator);
    }
    return shapeProxies[fxId];
  },
  set(target, key, value) {
    target[key] = value;
  },
};

const platProxyValidator = {
  get(bodyId, key) {
    if (key === 'isProxy') return true;
    if (key === 'id') return bodyId[0];

    bodyId = bodyId[0];

    if (!game.state.physics.bodies[bodyId]) {
      const e = new TypeError(
          'Cannot get properties of undefined (getting \'' + key + '\')',
      );
      throw e;
    }
    if (key === 'shapes') {
      if (!shapeListProxies[bodyId]) {
        shapeListProxies[bodyId] = new Proxy([bodyId], shapeListProxyValidator);
      }
      return shapeListProxies[bodyId];
    }
    return game.state.physics.bodies[bodyId][key] ?? game.state.physics.bodies[bodyId].s[key];
  },
  set(bodyId, key, value) {
    if (!game.state.physics.bodies[bodyId[0]]) {
      const e = new TypeError(
          'Cannot set properties of undefined (setting \'' + key + '\')',
      );
      throw e;
    }

    if (game.state.physics.bodies[bodyId[0]].s[key]) {
      game.state.physics.bodies[bodyId[0]].s[key] = value;
    } else {
      game.state.physics.bodies[bodyId[0]][key] = value;
    }

    return true;
  },
};

const platProxies = [];
const shapeListProxies = [];
const shapeProxies = [];
const platListProxy = new Proxy(
    {},
    {
      get(_target, key) {
        if (key === 'length') {
          return game.state.physics.bodies.length;
        }
        if (!platProxies[key]) {
          platProxies[key] = new Proxy([key], platProxyValidator);
        }
        return !game.state.physics.bodies[key] ? undefined : platProxies[key];
      },
    },
);

this.staticSetted = false;
this.resetStaticInfo = function() {
  this.staticSetted = false;

  game.lobby = {};
};
this.setStaticInfo = function() {
  getStaticInfo(this.game);
  this.staticSetted = true;
};
this.gameStateList = [];
this.setDynamicInfo = function() {
  getDynamicInfo(this.game);

  game.state.physics.platforms = platListProxy;

  const gameLength = game.state.gmExtra.gameLength;

  gameStateList[gameLength] = game.state;
  game.prevState = gameStateList[gameLength - 1];
  delete gameStateList[gameLength - 500];

  // random seed manage
  let randomSeed = 0;

  for (let i = 0; i < game.state.discs.length; i++) {
    if (!game.state.discs[i]) continue;
    randomSeed =
      randomSeed +
      game.state.discs[i].x +
      game.state.discs[i].y +
      game.state.discs[i].xv +
      game.state.discs[i].yv;
  }

  randomSeed += game.state.rl;
  randomSeed += randomSeed * game.state.rc;
  randomSeed *= game.lobby.seed + 1;

  // eslint-disable-next-line new-cap
  const random = new Math.seedrandom(randomSeed);
  Math.random = () => Math.round(random() * 1000000000) * 0.000000001;
};
this.prepareDynamicInfo = function() {
  game.state.gmExtra.compatMode = game.compatMode;
  game.state.gmExtra.vars = game.vars;
  game.state.gmExtra.camera = game.graphics.camera;
  game.state.gmExtra.drawings = game.graphics.drawings;
  game.state.gmExtra.overrides = game.inputs.overrides;
  game.state.gmExtra.disableDeathBarrier = game.world.disableDeathBarrier;
  game.state.gmExtra.linearSpeedCap = game.world.linearSpeedCap * 0.033333333;
  game.state.gmExtra.angularSpeedCap =
    game.world.angularSpeedCap * (Math.PI / 180) * 0.033333333;

  for (let i = 0; i < game.inputs.length; i++) {
    if (!game.inputs[i]) continue;
    game.state.gmExtra.mousePosSend[i] = game.inputs[i].mouse.allowPosSending;
  }


  /* #region CHANGE VECTORS TO XY */
  // turn vectors back to xy props

  for (let i = 0; i !== game.state.discs.length; i++) {
    if (!game.state.discs[i]) continue;

    const disc = game.state.discs[i];

    disc.x = disc.p[0];
    disc.y = disc.p[1];
    disc.xv = disc.lv[0];
    disc.yv = disc.lv[1];
    disc.sx = disc.sp[0];
    disc.sy = disc.sp[1];
    disc.sxv = disc.slv[0];
    disc.syv = disc.slv[1];
  }
  for (let i = 0; i !== game.state.discDeaths.length; i++) {
    if (!game.state.discDeaths[i]) continue;

    const death = game.state.discDeaths[i];

    death.x = death.p[0];
    death.y = death.p[1];
    death.xv = death.lv[0];
    death.yv = death.lv[1];
  }
  for (let i = 0; i !== game.state.projectiles.length; i++) {
    if (!game.state.projectiles[i]) continue;

    const arrow = game.state.projectiles[i];

    arrow.x = arrow.p[0];
    arrow.y = arrow.p[1];
    arrow.xv = arrow.lv[0];
    arrow.yv = arrow.lv[1];
  }
  for (let i = 0; i !== game.state.physics.bodies.length; i++) {
    if (!game.state.physics.bodies[i]) continue;
    if (!game.state.physics.bodies[i].cf.lf) continue;

    const body = game.state.physics.bodies[i];

    body.cf.x = body.cf.lf[0];
    body.cf.y = body.cf.lf[1];
  }
  for (let i = 0; i !== game.state.physics.shapes.length; i++) {
    if (!game.state.physics.shapes[i] || game.state.physics.shapes[i].type !== 'bx') continue;
    if (!game.state.physics.shapes[i].s) continue;

    const shape = game.state.physics.shapes[i];

    shape.w = shape.s[0];
    shape.h = shape.s[1];
  }
  /* #endregion VECTORS TO XY */

  /* #region ANGLE UNIT RESTORING */
  // turn angles back into radians
  // if an angle didn't change during the event firing, it's set to the pre-degreed value
  // instead of being multiplied, to prevent possible desyncs due to floating point error
  const degToRad = Math.PI / 180;

  for (let i = 0; i !== game.state.discs.length; i++) {
    if (!game.state.discs[i]) continue;
    game.state.discs[i].a *= degToRad;
    game.state.discs[i].av *= degToRad;

    if (Math.abs(game.state.discs[i].a - game.state.discs[i].ra) < 0.0000001) {
      game.state.discs[i].a = game.state.discs[i].ra;
    }
    if (Math.abs(game.state.discs[i].av - game.state.discs[i].rav) < 0.0000001) {
      game.state.discs[i].av = game.state.discs[i].rav;
    }
  }
  for (let i = 0; i !== game.state.projectiles.length; i++) {
    if (!game.state.projectiles[i]) continue;

    const arrow = game.state.projectiles[i];

    arrow.a *= degToRad;
    arrow.av *= degToRad;

    if (Math.abs(arrow.a - arrow.ra) < 0.0000001) {
      arrow.a = arrow.ra;
    }
    if (Math.abs(arrow.av - arrow.rav) < 0.0000001) {
      arrow.av = arrow.rav;
    }
  }
  for (let i = 0; i !== game.state.physics.bodies.length; i++) {
    if (!game.state.physics.bodies[i]) continue;

    const body = game.state.physics.bodies[i];

    body.a *= degToRad;
    body.av *= degToRad;

    if (Math.abs(body.a - body.ra) < 0.0000001) {
      body.a = body.ra;
    }
    if (Math.abs(body.av - body.rav) < 0.0000001) {
      body.av = body.rav;
    }
  }
  for (let i = 0; i !== game.state.physics.shapes.length; i++) {
    if (!game.state.physics.shapes[i]) continue;

    const shape = game.state.physics.shapes[i];

    if (shape.type !== 'ci') {
      shape.a *= degToRad;
      if (Math.abs(shape.a - shape.ra) < 0.0000001) shape.a = shape.ra;
    }
  }
  for (let i = 0; i !== game.state.physics.joints.length; i++) {
    if (!game.state.physics.joints[i]) continue;

    const joint = game.state.physics.joints[i];

    if (joint.type == 'lpj') {
      joint.pa *= Math.PI / 180;
      if (Math.abs(joint.pa - joint.rpa) < 0.0000001) joint.pa = joint.rpa;
    } else if (joint.type == 'rv') {
      joint.d.ua *= Math.PI / 180;
      joint.d.la *= Math.PI / 180;
      if (Math.abs(joint.d.ua - joint.rua) < 0.0000001) joint.d.ua = joint.rua;
      if (Math.abs(joint.d.la - joint.rla) < 0.0000001) joint.d.la = joint.rla;
    }
  }
  /* #endregion ANGLE UNIT RESTORING */


  return game.state;
};
