'use strict';

const { AppDataSource } = require('../config/data-source');

// =========================
// HELPERS
// =========================

async function getOrCreate(repo, findCondition, createData) {
  let entity = await repo.findOne({ where: findCondition });
  if (!entity) {
    entity = repo.create(createData);
    await repo.save(entity);
  }
  return entity;
}

async function createMatch(repo, data) {
  return await getOrCreate(
    repo,
    {
      competition: { id: data.competition.id ?? data.competition },
      team_local:  { id: data.team_local.id  ?? data.team_local  },
      team_visitor:{ id: data.team_visitor.id ?? data.team_visitor},
      phase:       data.phase,
      start_time:  data.start_time,
    },
    {
      competition:   data.competition,
      phase:         data.phase,
      team_local:    data.team_local,
      team_visitor:  data.team_visitor,
      court_number:  data.court_number ?? 1,
      referee:       data.referee ?? null,
      start_time:    data.start_time,
      end_time:      data.end_time ?? null,
      finished:      data.finished ?? false,
      goals_local:   data.goals_local   ?? 0,
      goals_visitor: data.goals_visitor ?? 0,
    }
  );
}

async function createEvent(repo, data) {
  return await repo.save(repo.create(data));
}

async function upsertStanding(repo, team, values) {
  let standing = await repo.findOne({ where: { team: { id: team.id } } });
  if (!standing) {
    standing = repo.create({ team });
  }
  standing.points        = values.points;
  standing.played_matches = values.played;
  standing.won_matches    = values.won;
  standing.drawn_matches  = values.draw;
  standing.lost_matches   = values.lost;
  standing.goals_for      = values.gf;
  standing.goals_against  = values.ga;
  return await repo.save(standing);
}

function roundRobin(arr) {
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      res.push([arr[i], arr[j]]);
    }
  }
  return res;
}

function initSt(team) {
  return { team, points: 0, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0 };
}

function applyResult(stLocal, stVisitor, gl, gv) {
  stLocal.played++;   stVisitor.played++;
  stLocal.gf  += gl;  stLocal.ga  += gv;
  stVisitor.gf += gv; stVisitor.ga += gl;
  if (gl > gv) {
    stLocal.points   += 3; stLocal.won++;
    stVisitor.lost++;
  } else if (gv > gl) {
    stVisitor.points += 3; stVisitor.won++;
    stLocal.lost++;
  } else {
    stLocal.points   += 1; stLocal.draw++;
    stVisitor.points += 1; stVisitor.draw++;
  }
}

// =========================
// SEED
// =========================

async function seed() {
  await AppDataSource.initialize();
  console.log('🌱 Starting FULL seed (Futbol, Bàsquet, Voleibol)...');

  // ── REPOS ──────────────────────────────────────────────────────────────────
  const roleRepo        = AppDataSource.getRepository('Role');
  const userRepo        = AppDataSource.getRepository('User');
  const activityRepo    = AppDataSource.getRepository('Activity');
  const fieldRepo       = AppDataSource.getRepository('Field');
  const competitionRepo = AppDataSource.getRepository('Competition');
  const groupRepo       = AppDataSource.getRepository('Group');
  const teamRepo        = AppDataSource.getRepository('Team');
  const teamPlayerRepo  = AppDataSource.getRepository('TeamPlayer');
  const matchRepo       = AppDataSource.getRepository('Match');
  const eventRepo       = AppDataSource.getRepository('MatchEvent');
  const standingRepo    = AppDataSource.getRepository('Standing');

  // ── 1. ROLES ───────────────────────────────────────────────────────────────
  const studentRole = await getOrCreate(roleRepo, { name: 'estudiant' }, { name: 'estudiant' });
  const teacherRole = await getOrCreate(roleRepo, { name: 'professor' }, { name: 'professor' });
  const adminRole = await getOrCreate(roleRepo, { name: 'admin' }, { name: 'admin' });

  // ── 2. USERS ───────────────────────────────────────────────────────────────
  const rawUsers = [
    // Teachers
    { email: 'anna.soler@test.com',   first_name: 'Anna',    last_name: 'Soler',   role: teacherRole },
    { email: 'jordi.mas@test.com',    first_name: 'Jordi',   last_name: 'Mas',     role: teacherRole },
    { email: 'marta.puig@test.com',   first_name: 'Marta',   last_name: 'Puig',    role: teacherRole },
    // Futbol
    { email: 'marc.roca@test.com',    first_name: 'Marc',    last_name: 'Roca',    role: studentRole },
    { email: 'pau.vila@test.com',     first_name: 'Pau',     last_name: 'Vila',    role: studentRole },
    { email: 'laia.costa@test.com',   first_name: 'Laia',    last_name: 'Costa',   role: studentRole },
    { email: 'nuria.font@test.com',   first_name: 'Núria',   last_name: 'Font',    role: studentRole },
    { email: 'xavi.pons@test.com',    first_name: 'Xavi',    last_name: 'Pons',    role: studentRole },
    { email: 'roger.mir@test.com',    first_name: 'Roger',   last_name: 'Mir',     role: studentRole },
    // Bàsquet
    { email: 'clara.vidal@test.com',  first_name: 'Clara',   last_name: 'Vidal',   role: studentRole },
    { email: 'eric.march@test.com',   first_name: 'Èric',    last_name: 'March',   role: studentRole },
    { email: 'alba.tort@test.com',    first_name: 'Alba',    last_name: 'Tort',    role: studentRole },
    { email: 'joel.riera@test.com',   first_name: 'Joel',    last_name: 'Riera',   role: studentRole },
    { email: 'sara.llop@test.com',    first_name: 'Sara',    last_name: 'Llop',    role: studentRole },
    { email: 'dani.coll@test.com',    first_name: 'Dani',    last_name: 'Coll',    role: studentRole },
    // Voleibol
    { email: 'julia.pages@test.com',  first_name: 'Júlia',   last_name: 'Pagès',   role: studentRole },
    { email: 'pol.bruna@test.com',    first_name: 'Pol',     last_name: 'Bruna',   role: studentRole },
    { email: 'ariadna.gil@test.com',  first_name: 'Ariadna', last_name: 'Gil',     role: studentRole },
    { email: 'victor.mas@test.com',   first_name: 'Víctor',  last_name: 'Mas',     role: studentRole },
    { email: 'marina.sala@test.com',  first_name: 'Marina',  last_name: 'Sala',    role: studentRole },
    { email: 'ivan.deu@test.com',     first_name: 'Ivan',    last_name: 'Deu',     role: studentRole },
  ];

  const users = [];
  for (const u of rawUsers) {
    users.push(await getOrCreate(userRepo, { email: u.email }, { ...u, password: '1234' }));
  }

  const [
    teacher1, teacher2, teacher3,
    marcRoca, pauVila, laiaCosta, nuriaFont, xaviPons, rogerMir,
    claraVidal, ericMarch, albaTort, joelRiera, saraLlop, daniColl,
    juliaPages, polBruna, ariadnaGil, victorMas, marinaSala, ivanDeu,
  ] = users;

  // ── 3. ACTIVITIES ──────────────────────────────────────────────────────────
  const actFutbol  = await getOrCreate(activityRepo, { name: 'Futbol 7'     }, { name: 'Futbol 7',      min_players: 5, max_players: 7 });
  const actBasquet = await getOrCreate(activityRepo, { name: 'Bàsquet 5x5'  }, { name: 'Bàsquet 5x5',  min_players: 4, max_players: 5 });
  const actVolei   = await getOrCreate(activityRepo, { name: 'Voleibol 6x6' }, { name: 'Voleibol 6x6', min_players: 4, max_players: 6 });

  // ── 4. FIELDS ──────────────────────────────────────────────────────────────
  const fieldFutbol  = await getOrCreate(fieldRepo, { name: 'Camp de Futbol Central' }, { name: 'Camp de Futbol Central', location: 'Barcelona', number_of_courts: 2 });
  const fieldBasquet = await getOrCreate(fieldRepo, { name: 'Pavelló Municipal'       }, { name: 'Pavelló Municipal',       location: 'Barcelona', number_of_courts: 2 });
  const fieldVolei   = await getOrCreate(fieldRepo, { name: 'Pista Poliesportiva'     }, { name: 'Pista Poliesportiva',     location: 'Barcelona', number_of_courts: 2 });

  // ══════════════════════════════════════════════════════════════════════════
  // 🏐 COMPETICIÓ VOLEIBOL (FINALITZADA)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('🏐 Seeding Voleibol...');

  const compVolei = await getOrCreate(competitionRepo, { name: 'Copa Voleibol Escolar 2026' }, {
    name: 'Copa Voleibol Escolar 2026',
    date: new Date('2026-05-24'),
    start_time: '11:00',
    status: 'FINISHED',
    activity: actVolei,
    field: fieldVolei,
    creator: teacher3,
    available_courts: 2,
  });

  const gVolA = await getOrCreate(groupRepo, { competition: { id: compVolei.id }, letter: 'A' }, { competition: compVolei, letter: 'A' });
  const gVolB = await getOrCreate(groupRepo, { competition: { id: compVolei.id }, letter: 'B' }, { competition: compVolei, letter: 'B' });

  // 8 equips, 4 per grup, 6 jugadors per equip
  const equipsVolei = [];
  for (let i = 1; i <= 8; i++) {
    equipsVolei.push(await getOrCreate(teamRepo, { code: `V${i}` }, {
      name: `Volei Team ${i}`,
      competition: compVolei,
      group: i <= 4 ? gVolA : gVolB,
      code: `V${i}`,
      captain: teacher3,
      teacher: teacher3,
    }));
  }

  const voleiNamedPlayers = [juliaPages, polBruna, ariadnaGil, victorMas, marinaSala, ivanDeu];
  const voleiPositions = ['UNIVERSAL', 'UNIVERSAL', 'UNIVERSAL', 'UNIVERSAL', 'UNIVERSAL', 'UNIVERSAL'];
  for (const team of equipsVolei) {
    for (let j = 0; j < 6; j++) {
      let user;
      if (team === equipsVolei[0] && j < voleiNamedPlayers.length) {
        user = voleiNamedPlayers[j];
      } else {
        user = await getOrCreate(userRepo, { email: `volei${team.code}_jug${j + 1}@test.com` }, {
          email: `volei${team.code}_jug${j + 1}@test.com`,
          first_name: `VJ${j + 1}`,
          last_name: `Equip${team.code}`,
          role: studentRole,
          password: '1234',
        });
      }
      await getOrCreate(teamPlayerRepo, { team: { id: team.id }, user: { id: user.id } }, {
        team, user, position: 'UNIVERSAL', confirmed: true,
      });
    }
  }

  // Fase de grups (round robin)
  const grupVolA = equipsVolei.slice(0, 4);
  const grupVolB = equipsVolei.slice(4, 8);
  const matchesVolei = [];
  let mId = 1;

  for (const [local, visitor] of roundRobin(grupVolA)) {
    matchesVolei.push(await createMatch(matchRepo, {
      competition: compVolei, phase: 'GROUP_STAGE',
      team_local: local, team_visitor: visitor,
      court_number: 1, referee: teacher3,
      start_time: new Date(`2026-05-24T${String(8 + mId).padStart(2,'0')}:00:00`),
      finished: true,
      goals_local:   Math.floor(Math.random() * 3) + 1,
      goals_visitor: Math.floor(Math.random() * 3),
    }));
    mId++;
  }
  for (const [local, visitor] of roundRobin(grupVolB)) {
    matchesVolei.push(await createMatch(matchRepo, {
      competition: compVolei, phase: 'GROUP_STAGE',
      team_local: local, team_visitor: visitor,
      court_number: 2, referee: teacher3,
      start_time: new Date(`2026-05-24T${String(8 + mId).padStart(2,'0')}:00:00`),
      finished: true,
      goals_local:   Math.floor(Math.random() * 3) + 1,
      goals_visitor: Math.floor(Math.random() * 3),
    }));
    mId++;
  }

  // Calcular standings grups
  const stVolA = grupVolA.map(initSt);
  const stVolB = grupVolB.map(initSt);
  for (const m of matchesVolei) {
    const isA = grupVolA.some(t => t.id === m.team_local.id);
    const arr  = isA ? stVolA : stVolB;
    const sL   = arr.find(s => s.team.id === m.team_local.id);
    const sV   = arr.find(s => s.team.id === m.team_visitor.id);
    if (sL && sV) applyResult(sL, sV, m.goals_local, m.goals_visitor);
  }
  stVolA.sort((a, b) => b.points - a.points || b.gf - b.ga - (a.gf - a.ga));
  stVolB.sort((a, b) => b.points - a.points || b.gf - b.ga - (a.gf - a.ga));

  const [A1v, A2v] = stVolA;
  const [B1v, B2v] = stVolB;

  // Semifinals
  const vSemi1 = await createMatch(matchRepo, {
    competition: compVolei, phase: 'SEMIFINAL',
    team_local: A1v.team, team_visitor: B2v.team,
    court_number: 1, referee: teacher3,
    start_time: new Date('2026-05-25T09:00:00'),
    finished: true, goals_local: 3, goals_visitor: 1,
  });
  const vSemi2 = await createMatch(matchRepo, {
    competition: compVolei, phase: 'SEMIFINAL',
    team_local: B1v.team, team_visitor: A2v.team,
    court_number: 2, referee: teacher3,
    start_time: new Date('2026-05-25T10:00:00'),
    finished: true, goals_local: 2, goals_visitor: 3,
  });
  // Final i 3r lloc
  const vFinal = await createMatch(matchRepo, {
    competition: compVolei, phase: 'FINAL',
    team_local: A1v.team, team_visitor: A2v.team,
    court_number: 1, referee: teacher3,
    start_time: new Date('2026-05-25T12:00:00'),
    finished: true, goals_local: 3, goals_visitor: 1,
  });
  const vTercer = await createMatch(matchRepo, {
    competition: compVolei, phase: 'FINAL',
    team_local: B2v.team, team_visitor: B1v.team,
    court_number: 2, referee: teacher3,
    start_time: new Date('2026-05-25T12:00:00'),
    finished: true, goals_local: 3, goals_visitor: 1,
  });

  // Actualitzar standings amb eliminatòries
  applyResult(A1v, B2v, 3, 1);  // semi1
  applyResult(A2v, B1v, 3, 2);  // semi2 (A2 guanya)
  applyResult(A1v, A2v, 3, 1);  // final
  applyResult(B2v, B1v, 3, 1);  // 3r lloc

  for (const s of [...stVolA, ...stVolB]) {
    await upsertStanding(standingRepo, s.team, s);
  }

  // Events Voleibol
  const tpVolA1 = await teamPlayerRepo.findOne({ where: { team: { id: A1v.team.id } } });
  const tpVolB1 = await teamPlayerRepo.findOne({ where: { team: { id: B1v.team.id } } });
  const tpVolA2 = await teamPlayerRepo.findOne({ where: { team: { id: A2v.team.id } } });
  const tpVolB2 = await teamPlayerRepo.findOne({ where: { team: { id: B2v.team.id } } });

  for (const m of matchesVolei) {
    const tpL = await teamPlayerRepo.findOne({ where: { team: { id: m.team_local.id  } } });
    const tpV = await teamPlayerRepo.findOne({ where: { team: { id: m.team_visitor.id } } });
    await createEvent(eventRepo, { match: m, team_player: tpL, type: 'GOAL', description: 'Punt decisiu local' });
    await createEvent(eventRepo, { match: m, team_player: tpV, type: 'GOAL', description: 'Punt decisiu visitant' });
  }
  await createEvent(eventRepo, { match: vSemi1,  team_player: tpVolA1, type: 'GOAL', description: 'Ace decisiu semifinal' });
  await createEvent(eventRepo, { match: vSemi2,  team_player: tpVolA2, type: 'GOAL', description: 'Remuntada semifinal' });
  await createEvent(eventRepo, { match: vFinal,  team_player: tpVolA1, type: 'GOAL', description: 'Campions!' });
  await createEvent(eventRepo, { match: vTercer, team_player: tpVolB2, type: 'GOAL', description: '3r lloc aconseguit' });

  console.log('  ✅ Voleibol OK — 8 equips, 16 partits, standings finals');

  // ══════════════════════════════════════════════════════════════════════════
  // 🏀 COMPETICIÓ BÀSQUET (EN CURS)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('🏀 Seeding Bàsquet...');

  const compBasquet = await getOrCreate(competitionRepo, { name: 'Lliga Escolar Bàsquet 2026' }, {
    name: 'Lliga Escolar Bàsquet 2026',
    date: new Date('2026-06-01'),
    start_time: '10:00',
    status: 'GROUP_STAGE',
    activity: actBasquet,
    field: fieldBasquet,
    creator: teacher2,
    available_courts: 2,
  });

  const grupsBasquet = [];
  for (const letter of ['A', 'B', 'C']) {
    grupsBasquet.push(await getOrCreate(groupRepo, { competition: { id: compBasquet.id }, letter }, { competition: compBasquet, letter }));
  }

  // 12 equips, 4 per grup, 5 jugadors per equip
  const equipsBasquet = [];
  for (let i = 1; i <= 12; i++) {
    equipsBasquet.push(await getOrCreate(teamRepo, { code: `B${i}` }, {
      name: `Bàsquet Team ${i}`,
      competition: compBasquet,
      group: grupsBasquet[Math.floor((i - 1) / 4)],
      code: `B${i}`,
      captain: teacher2,
      teacher: teacher2,
    }));
  }

  const basquetNamedPlayers = [claraVidal, ericMarch, albaTort, joelRiera, saraLlop, daniColl];
  for (const team of equipsBasquet) {
    for (let j = 0; j < 5; j++) {
      let user;
      if (team === equipsBasquet[0] && j < basquetNamedPlayers.length) {
        user = basquetNamedPlayers[j];
      } else {
        user = await getOrCreate(userRepo, { email: `bas${team.code}_jug${j + 1}@test.com` }, {
          email: `bas${team.code}_jug${j + 1}@test.com`,
          first_name: `BJ${j + 1}`,
          last_name: `Equip${team.code}`,
          role: studentRole,
          password: '1234',
        });
      }
      await getOrCreate(teamPlayerRepo, { team: { id: team.id }, user: { id: user.id } }, {
        team, user, position: 'UNIVERSAL', confirmed: true,
      });
    }
  }

  // Partits per grup (round robin parcial): A=5/6, B=3/6, C=2/6
  const matchesBasquet = [];
  const maxPerGrup = [5, 3, 2];
  let bmId = 1;
  for (let g = 0; g < 3; g++) {
    const grup = equipsBasquet.slice(g * 4, g * 4 + 4);
    const partiis = roundRobin(grup);
    for (let k = 0; k < maxPerGrup[g]; k++) {
      const [local, visitor] = partiis[k];
      const scoreL = Math.floor(Math.random() * 41) + 60;
      const scoreV = Math.floor(Math.random() * 41) + 60;
      matchesBasquet.push(await createMatch(matchRepo, {
        competition: compBasquet, phase: 'GROUP_STAGE',
        team_local: local, team_visitor: visitor,
        court_number: (bmId % 2) + 1, referee: teacher2,
        start_time: new Date(`2026-06-0${Math.floor(bmId / 5) + 1}T${String(9 + (bmId % 8)).padStart(2,'0')}:00:00`),
        finished: true,
        goals_local: scoreL, goals_visitor: scoreV,
      }));
      bmId++;
    }
  }

  const stBasquet = equipsBasquet.map(initSt);
  for (const m of matchesBasquet) {
    const sL = stBasquet.find(s => s.team.id === m.team_local.id);
    const sV = stBasquet.find(s => s.team.id === m.team_visitor.id);
    if (sL && sV) applyResult(sL, sV, m.goals_local, m.goals_visitor);
  }
  for (const s of stBasquet) {
    await upsertStanding(standingRepo, s.team, s);
  }

  for (const m of matchesBasquet) {
    const tpL = await teamPlayerRepo.findOne({ where: { team: { id: m.team_local.id  } } });
    const tpV = await teamPlayerRepo.findOne({ where: { team: { id: m.team_visitor.id } } });
    await createEvent(eventRepo, { match: m, team_player: tpL, type: 'GOAL', description: 'Triple decisiu local' });
    await createEvent(eventRepo, { match: m, team_player: tpV, type: 'GOAL', description: 'Triple decisiu visitant' });
  }

  // Events detallats per al primer partit de bàsquet
  if (matchesBasquet.length > 0) {
    const mBasA = matchesBasquet[0];
    const tpClara = await teamPlayerRepo.findOne({ where: { team: { id: equipsBasquet[0].id }, user: { id: claraVidal.id } } });
    const tpEric  = await teamPlayerRepo.findOne({ where: { team: { id: equipsBasquet[1].id }, user: { id: ericMarch.id  } } });
    const tpSara  = await teamPlayerRepo.findOne({ where: { team: { id: equipsBasquet[0].id }, user: { id: saraLlop.id   } } });
    const tpDani  = await teamPlayerRepo.findOne({ where: { team: { id: equipsBasquet[1].id }, user: { id: daniColl.id   } } });
    if (tpClara) await createEvent(eventRepo, { match: mBasA, team_player: tpClara, type: 'GOAL', description: 'Triple – Clara Vidal' });
    if (tpEric)  await createEvent(eventRepo, { match: mBasA, team_player: tpEric,  type: 'CARD', description: 'Falta personal – Èric March' });
    if (tpSara)  await createEvent(eventRepo, { match: mBasA, team_player: tpSara,  type: 'GOAL', description: '2+1 – Sara Llop' });
    if (tpDani)  await createEvent(eventRepo, { match: mBasA, team_player: tpDani,  type: 'GOAL', description: 'Triple – Dani Coll' });
  }

  console.log('  ✅ Bàsquet OK — 12 equips, 10 partits jugats, standings parcials');

  // ══════════════════════════════════════════════════════════════════════════
  // ⚽ COMPETICIÓ FUTBOL (EN CURS GRAN)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('⚽ Seeding Futbol...');

  const compFutbol = await getOrCreate(competitionRepo, { name: 'Lliga Escolar Futbol 2026' }, {
    name: 'Lliga Escolar Futbol 2026',
    date: new Date('2026-06-10'),
    start_time: '09:00',
    status: 'GROUP_STAGE',
    activity: actFutbol,
    field: fieldFutbol,
    creator: teacher1,
    available_courts: 2,
  });

  const grupsFutbol = [];
  for (const letter of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) {
    grupsFutbol.push(await getOrCreate(groupRepo, { competition: { id: compFutbol.id }, letter }, { competition: compFutbol, letter }));
  }

  // 32 equips, 4 per grup, 7 jugadors per equip
  const equipsFutbol = [];
  for (let i = 1; i <= 32; i++) {
    equipsFutbol.push(await getOrCreate(teamRepo, { code: `F${i}` }, {
      name: `Futbol Team ${i}`,
      competition: compFutbol,
      group: grupsFutbol[Math.floor((i - 1) / 4)],
      code: `F${i}`,
      captain: teacher1,
      teacher: teacher1,
    }));
  }

  const futbolNamedPlayers = [marcRoca, pauVila, laiaCosta, nuriaFont, xaviPons, rogerMir];
  for (const team of equipsFutbol) {
    for (let j = 0; j < 7; j++) {
      let user;
      if (team === equipsFutbol[0] && j < futbolNamedPlayers.length) {
        user = futbolNamedPlayers[j];
      } else {
        user = await getOrCreate(userRepo, { email: `fut${team.code}_jug${j + 1}@test.com` }, {
          email: `fut${team.code}_jug${j + 1}@test.com`,
          first_name: `FJ${j + 1}`,
          last_name: `Equip${team.code}`,
          role: studentRole,
          password: '1234',
        });
      }
      await getOrCreate(teamPlayerRepo, { team: { id: team.id }, user: { id: user.id } }, {
        team, user, position: 'UNIVERSAL', confirmed: true,
      });
    }
  }

  // Partits: A,B=tots (6), C,D=3, E-H=1
  const matchesFutbol = [];
  // Grups A i B: tots els partits jugats
  // Grups C i D: 3 partits jugats
  // Grups E-H: 1 partit jugat
  const maxPartits = [6, 6, 3, 3, 1, 1, 1, 1];
  let fmId = 1;
  const baseDate = new Date('2026-06-10T09:00:00');

  for (let g = 0; g < 8; g++) {
    const grup = equipsFutbol.slice(g * 4, g * 4 + 4);
    const partits = roundRobin(grup);
    for (let k = 0; k < maxPartits[g]; k++) {
      const [local, visitor] = partits[k];
      const t = new Date(baseDate.getTime() + fmId * 60 * 60 * 1000);
      matchesFutbol.push(await createMatch(matchRepo, {
        competition: compFutbol, phase: 'GROUP_STAGE',
        team_local: local, team_visitor: visitor,
        court_number: (g % 2) + 1, referee: teacher1,
        start_time: t,
        finished: true,
        goals_local:   Math.floor(Math.random() * 3),
        goals_visitor: Math.floor(Math.random() * 3),
      }));
      fmId++;
    }
    // Partits futurs (no jugats) per grups A i B
    if (g < 2) {
      // ja tots jugats, no cal afegir-ne
    }
  }

  const stFutbol = equipsFutbol.map(initSt);
  for (const m of matchesFutbol) {
    const sL = stFutbol.find(s => s.team.id === m.team_local.id);
    const sV = stFutbol.find(s => s.team.id === m.team_visitor.id);
    if (sL && sV) applyResult(sL, sV, m.goals_local, m.goals_visitor);
  }
  for (const s of stFutbol) {
    await upsertStanding(standingRepo, s.team, s);
  }

  for (const m of matchesFutbol) {
    const tpL = await teamPlayerRepo.findOne({ where: { team: { id: m.team_local.id  } } });
    const tpV = await teamPlayerRepo.findOne({ where: { team: { id: m.team_visitor.id } } });
    await createEvent(eventRepo, { match: m, team_player: tpL, type: 'GOAL', description: 'Gol local' });
    await createEvent(eventRepo, { match: m, team_player: tpV, type: 'GOAL', description: 'Gol visitant' });
  }

  // Events detallats per al primer partit de futbol
  if (matchesFutbol.length > 0) {
    const mFutA = matchesFutbol[0];
    const tpMarc  = await teamPlayerRepo.findOne({ where: { team: { id: equipsFutbol[0].id }, user: { id: marcRoca.id  } } });
    const tpXavi  = await teamPlayerRepo.findOne({ where: { team: { id: equipsFutbol[0].id }, user: { id: xaviPons.id  } } });
    const tpRoger = await teamPlayerRepo.findOne({ where: { team: { id: equipsFutbol[0].id }, user: { id: rogerMir.id  } } });
    const tpPau   = await teamPlayerRepo.findOne({ where: { team: { id: equipsFutbol[1].id }, user: { id: pauVila.id   } } });
    if (tpMarc)  await createEvent(eventRepo, { match: mFutA, team_player: tpMarc,  type: 'GOAL', description: 'Gol de penal – Marc Roca' });
    if (tpPau)   await createEvent(eventRepo, { match: mFutA, team_player: tpPau,   type: 'GOAL', description: 'Gol en contra' });
    if (tpRoger) await createEvent(eventRepo, { match: mFutA, team_player: tpRoger, type: 'CARD', description: 'Targeta groga – entrada dura' });
    if (tpXavi)  await createEvent(eventRepo, { match: mFutA, team_player: tpXavi,  type: 'GOAL', description: 'Rematada de cap – Xavi Pons' });
  }

  console.log('  ✅ Futbol OK — 32 equips, ~26 partits jugats, standings parcials');

  // ══════════════════════════════════════════════════════════════════════════
  console.log('');
  console.log('🎉 FULL seed completat!');
  console.log('   🏐 Voleibol  — 8 equips,  16 partits, FINALITZADA');
  console.log('   🏀 Bàsquet   — 12 equips, 10 partits, EN CURS (GROUP_STAGE)');
  console.log('   ⚽ Futbol    — 32 equips, 26 partits, EN CURS (GROUP_STAGE)');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});