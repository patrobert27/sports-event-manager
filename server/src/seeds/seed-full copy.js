const { AppDataSource } = require('../config/data-source');

async function getOrCreate(repo, findCondition, createData) {
  let entity = await repo.findOne({ where: findCondition });
  if (!entity) {
    entity = repo.create(createData);
    await repo.save(entity);
  }
  return entity;
}

async function seed() {
  await AppDataSource.initialize();
  console.log('🌱 Starting FULL seed (Futbol, Bàsquet, Voleibol)...');

  // =========================
  // REPOS
  // =========================
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

  // =========================
  // 1. ROLES
  // =========================
  const studentRole = await getOrCreate(roleRepo, { name: 'STUDENT' }, { name: 'STUDENT' });
  const teacherRole = await getOrCreate(roleRepo, { name: 'TEACHER' }, { name: 'TEACHER' });

  // =========================
  // 2. USERS  (8 students + 3 teachers)
  // =========================
  const rawUsers = [
    // Teachers
    { email: 'anna.soler@test.com',    first_name: 'Anna',    last_name: 'Soler',    role: teacherRole },
    { email: 'jordi.mas@test.com',     first_name: 'Jordi',   last_name: 'Mas',      role: teacherRole },
    { email: 'marta.puig@test.com',    first_name: 'Marta',   last_name: 'Puig',     role: teacherRole },
    // Students — Futbol
    { email: 'marc.roca@test.com',     first_name: 'Marc',    last_name: 'Roca',     role: studentRole },
    { email: 'pau.vila@test.com',      first_name: 'Pau',     last_name: 'Vila',     role: studentRole },
    { email: 'laia.costa@test.com',    first_name: 'Laia',    last_name: 'Costa',    role: studentRole },
    { email: 'nuria.font@test.com',    first_name: 'Núria',   last_name: 'Font',     role: studentRole },
    { email: 'xavi.pons@test.com',     first_name: 'Xavi',    last_name: 'Pons',     role: studentRole },
    { email: 'roger.mir@test.com',     first_name: 'Roger',   last_name: 'Mir',      role: studentRole },
    // Students — Bàsquet
    { email: 'clara.vidal@test.com',   first_name: 'Clara',   last_name: 'Vidal',    role: studentRole },
    { email: 'eric.march@test.com',    first_name: 'Èric',    last_name: 'March',    role: studentRole },
    { email: 'alba.tort@test.com',     first_name: 'Alba',    last_name: 'Tort',     role: studentRole },
    { email: 'joel.riera@test.com',    first_name: 'Joel',    last_name: 'Riera',    role: studentRole },
    { email: 'sara.llop@test.com',     first_name: 'Sara',    last_name: 'Llop',     role: studentRole },
    { email: 'dani.coll@test.com',     first_name: 'Dani',    last_name: 'Coll',     role: studentRole },
    // Students — Voleibol
    { email: 'julia.pages@test.com',   first_name: 'Júlia',   last_name: 'Pagès',    role: studentRole },
    { email: 'pol.bruna@test.com',     first_name: 'Pol',     last_name: 'Bruna',    role: studentRole },
    { email: 'ariadna.gil@test.com',   first_name: 'Ariadna', last_name: 'Gil',      role: studentRole },
    { email: 'victor.mas@test.com',    first_name: 'Víctor',  last_name: 'Mas',      role: studentRole },
    { email: 'marina.sala@test.com',   first_name: 'Marina',  last_name: 'Sala',     role: studentRole },
    { email: 'ivan.deu@test.com',      first_name: 'Ivan',    last_name: 'Deu',      role: studentRole },
  ];

  const users = [];
  for (const u of rawUsers) {
    users.push(
      await getOrCreate(userRepo, { email: u.email }, { ...u, password: '1234' })
    );
  }

  // Named aliases for readability
  const [
    teacher1, teacher2, teacher3,
    // Futbol players
    marcRoca, pauVila, laiaCosta, nuriaFont, xaviPons, rogerMir,
    // Bàsquet players
    claraVidal, ericMarch, albaTort, joelRiera, saraLlop, daniColl,
    // Voleibol players
    juliaPages, polBruna, ariadnaGil, victorMas, marinaSala, ivanDeu,
  ] = users;

  // =========================
  // 3. ACTIVITIES
  // =========================
  const actFutbol  = await getOrCreate(activityRepo, { name: 'Futbol 7' },   { name: 'Futbol 7',   min_players: 5, max_players: 7  });
  const actBasquet = await getOrCreate(activityRepo, { name: 'Bàsquet 5x5' },{ name: 'Bàsquet 5x5',min_players: 4, max_players: 5  });
  const actVolei   = await getOrCreate(activityRepo, { name: 'Voleibol 6x6' },{ name: 'Voleibol 6x6',min_players:4, max_players: 6  });

  // =========================
  // 4. FIELDS
  // =========================
  const fieldFutbol  = await getOrCreate(fieldRepo, { name: 'Camp de Futbol Central' }, { name: 'Camp de Futbol Central', location: 'Barcelona', number_of_courts: 2 });
  const fieldBasquet = await getOrCreate(fieldRepo, { name: 'Pavelló Municipal'       }, { name: 'Pavelló Municipal',       location: 'Barcelona', number_of_courts: 2 });
  const fieldVolei   = await getOrCreate(fieldRepo, { name: 'Pista Poliesportiva'     }, { name: 'Pista Poliesportiva',     location: 'Barcelona', number_of_courts: 2 });

  // =========================
  // 5. COMPETITIONS
  // =========================
  const compFutbol  = await getOrCreate(competitionRepo, { name: 'Lliga Escolar Futbol 2026' }, {
    name: 'Lliga Escolar Futbol 2026',
    date: new Date('2026-05-10'),
    start_time: '09:00',
    status: 'GROUP_STAGE',
    activity: actFutbol,
    field: fieldFutbol,
    creator: teacher1,
    available_courts: 2,
  });

  const compBasquet = await getOrCreate(competitionRepo, { name: 'Torneig Bàsquet Escolar 2026' }, {
    name: 'Torneig Bàsquet Escolar 2026',
    date: new Date('2026-05-17'),
    start_time: '10:00',
    status: 'GROUP_STAGE',
    activity: actBasquet,
    field: fieldBasquet,
    creator: teacher2,
    available_courts: 2,
  });

  const compVolei   = await getOrCreate(competitionRepo, { name: 'Copa Voleibol Escolar 2026' }, {
    name: 'Copa Voleibol Escolar 2026',
    date: new Date('2026-05-24'),
    start_time: '11:00',
    status: 'GROUP_STAGE',
    activity: actVolei,
    field: fieldVolei,
    creator: teacher3,
    available_courts: 2,
  });

  // =========================
  // 6. GROUPS  (A + B per competition)
  // =========================
  const [gFutA, gFutB] = await Promise.all([
    getOrCreate(groupRepo, { competition: compFutbol,  letter: 'A' }, { competition: compFutbol,  letter: 'A' }),
    getOrCreate(groupRepo, { competition: compFutbol,  letter: 'B' }, { competition: compFutbol,  letter: 'B' }),
  ]);
  const [gBasA, gBasB] = await Promise.all([
    getOrCreate(groupRepo, { competition: compBasquet, letter: 'A' }, { competition: compBasquet, letter: 'A' }),
    getOrCreate(groupRepo, { competition: compBasquet, letter: 'B' }, { competition: compBasquet, letter: 'B' }),
  ]);
  const [gVolA, gVolB] = await Promise.all([
    getOrCreate(groupRepo, { competition: compVolei,   letter: 'A' }, { competition: compVolei,   letter: 'A' }),
    getOrCreate(groupRepo, { competition: compVolei,   letter: 'B' }, { competition: compVolei,   letter: 'B' }),
  ]);

  // =========================
  // 7. TEAMS
  // =========================
  // --- FUTBOL (4 teams, 2 per group) ---
  const futA1 = await getOrCreate(teamRepo, { code: 'FA1' }, { name: 'FC Barcelona School',  competition: compFutbol,  group: gFutA, code: 'FA1', captain: marcRoca,  teacher: teacher1 });
  const futA2 = await getOrCreate(teamRepo, { code: 'FA2' }, { name: 'Real Madrid School',   competition: compFutbol,  group: gFutA, code: 'FA2', captain: pauVila,   teacher: teacher1 });
  const futB1 = await getOrCreate(teamRepo, { code: 'FB1' }, { name: 'Atlètic Gràcia',       competition: compFutbol,  group: gFutB, code: 'FB1', captain: laiaCosta, teacher: teacher2 });
  const futB2 = await getOrCreate(teamRepo, { code: 'FB2' }, { name: 'CE Eixample',          competition: compFutbol,  group: gFutB, code: 'FB2', captain: nuriaFont, teacher: teacher2 });

  // --- BÀSQUET (4 teams, 2 per group) ---
  const basA1 = await getOrCreate(teamRepo, { code: 'BA1' }, { name: 'Bàsquet Sants',        competition: compBasquet, group: gBasA, code: 'BA1', captain: claraVidal, teacher: teacher2 });
  const basA2 = await getOrCreate(teamRepo, { code: 'BA2' }, { name: 'Hoops Sarrià',         competition: compBasquet, group: gBasA, code: 'BA2', captain: ericMarch,  teacher: teacher2 });
  const basB1 = await getOrCreate(teamRepo, { code: 'BB1' }, { name: 'Clippers Gràcia',      competition: compBasquet, group: gBasB, code: 'BB1', captain: albaTort,   teacher: teacher3 });
  const basB2 = await getOrCreate(teamRepo, { code: 'BB2' }, { name: 'Lakers Poblenou',      competition: compBasquet, group: gBasB, code: 'BB2', captain: joelRiera,  teacher: teacher3 });

  // --- VOLEIBOL (4 teams, 2 per group) ---
  const volA1 = await getOrCreate(teamRepo, { code: 'VA1' }, { name: 'Spike Eixample',       competition: compVolei,   group: gVolA, code: 'VA1', captain: juliaPages, teacher: teacher3 });
  const volA2 = await getOrCreate(teamRepo, { code: 'VA2' }, { name: 'Ace Gràcia',           competition: compVolei,   group: gVolA, code: 'VA2', captain: polBruna,   teacher: teacher3 });
  const volB1 = await getOrCreate(teamRepo, { code: 'VB1' }, { name: 'Block Sants',          competition: compVolei,   group: gVolB, code: 'VB1', captain: ariadnaGil, teacher: teacher1 });
  const volB2 = await getOrCreate(teamRepo, { code: 'VB2' }, { name: 'Dig Sarrià',           competition: compVolei,   group: gVolB, code: 'VB2', captain: victorMas,  teacher: teacher1 });

  // =========================
  // 8. TEAM PLAYERS
  // =========================
  const teamPlayers = [
    // Futbol
    { team: futA1, user: marcRoca,  position: 'GK',  confirmed: true  },
    { team: futA1, user: xaviPons,  position: 'DEF', confirmed: true  },
    { team: futA2, user: pauVila,   position: 'MID', confirmed: true  },
    { team: futA2, user: rogerMir,  position: 'FWD', confirmed: false },
    { team: futB1, user: laiaCosta, position: 'GK',  confirmed: true  },
    { team: futB2, user: nuriaFont, position: 'MID', confirmed: true  },
    // Bàsquet
    { team: basA1, user: claraVidal,position: 'PG',  confirmed: true  },
    { team: basA1, user: saraLlop,  position: 'SF',  confirmed: true  },
    { team: basA2, user: ericMarch, position: 'PF',  confirmed: true  },
    { team: basA2, user: daniColl,  position: 'C',   confirmed: false },
    { team: basB1, user: albaTort,  position: 'SG',  confirmed: true  },
    { team: basB2, user: joelRiera, position: 'PG',  confirmed: true  },
    // Voleibol
    { team: volA1, user: juliaPages,position: 'S',   confirmed: true  },
    { team: volA1, user: marinaSala,position: 'OH',  confirmed: true  },
    { team: volA2, user: polBruna,  position: 'MB',  confirmed: true  },
    { team: volA2, user: ivanDeu,   position: 'OPP', confirmed: false },
    { team: volB1, user: ariadnaGil,position: 'L',   confirmed: true  },
    { team: volB2, user: victorMas, position: 'MB',  confirmed: true  },
  ];

  // Evitem duplicats usant els IDs en el where
  for (const tp of teamPlayers) {
    await getOrCreate(
      teamPlayerRepo,
      { team: tp.team.id ?? tp.team, user: tp.user.id ?? tp.user },
      tp
    );
  }

  // =========================
  // 9. MATCHES  (1 per group → 6 total)
  // =========================
  const matchDefs = [
    // Futbol
    {
      key: { team_local: futA1, team_visitor: futA2, competition: compFutbol },
      data: { competition: compFutbol, phase: 'GROUP_STAGE', team_local: futA1, team_visitor: futA2, court_number: 1, referee: teacher1, start_time: new Date('2026-05-10T09:00:00'), finished: true,  goals_local: 3, goals_visitor: 1 },
    },
    {
      key: { team_local: futB1, team_visitor: futB2, competition: compFutbol },
      data: { competition: compFutbol, phase: 'GROUP_STAGE', team_local: futB1, team_visitor: futB2, court_number: 2, referee: teacher2, start_time: new Date('2026-05-10T10:00:00'), finished: true,  goals_local: 0, goals_visitor: 2 },
    },
    // Bàsquet
    {
      key: { team_local: basA1, team_visitor: basA2, competition: compBasquet },
      data: { competition: compBasquet, phase: 'GROUP_STAGE', team_local: basA1, team_visitor: basA2, court_number: 1, referee: teacher2, start_time: new Date('2026-05-17T10:00:00'), finished: true,  goals_local: 54, goals_visitor: 47 },
    },
    {
      key: { team_local: basB1, team_visitor: basB2, competition: compBasquet },
      data: { competition: compBasquet, phase: 'GROUP_STAGE', team_local: basB1, team_visitor: basB2, court_number: 2, referee: teacher3, start_time: new Date('2026-05-17T11:00:00'), finished: false, goals_local: 0,  goals_visitor: 0  },
    },
    // Voleibol
    {
      key: { team_local: volA1, team_visitor: volA2, competition: compVolei },
      data: { competition: compVolei,   phase: 'GROUP_STAGE', team_local: volA1, team_visitor: volA2, court_number: 1, referee: teacher3, start_time: new Date('2026-05-24T11:00:00'), finished: true,  goals_local: 3, goals_visitor: 1 },
    },
    {
      key: { team_local: volB1, team_visitor: volB2, competition: compVolei },
      data: { competition: compVolei,   phase: 'GROUP_STAGE', team_local: volB1, team_visitor: volB2, court_number: 2, referee: teacher1, start_time: new Date('2026-05-24T12:00:00'), finished: false, goals_local: 0, goals_visitor: 0 },
    },
  ];

  const matches = [];
  for (const m of matchDefs) {
    matches.push(await getOrCreate(matchRepo, m.key, m.data));
  }

  const [matchFutA, matchFutB, matchBasA, matchBasB, matchVolA, matchVolB] = matches;

  // =========================
  // 10. MATCH EVENTS
  // Enum vàlids: 'GOAL' | 'CARD'
  // team_player ha de ser una entitat TeamPlayer real
  // =========================


  // Recuperem els TeamPlayers creats al pas 8 (ara per ID)
  const tpMarcFutA1  = await teamPlayerRepo.findOne({ where: { team: futA1.id, user: marcRoca.id  } });
  const tpXaviFutA1  = await teamPlayerRepo.findOne({ where: { team: futA1.id, user: xaviPons.id  } });
  const tpPauFutA2   = await teamPlayerRepo.findOne({ where: { team: futA2.id, user: pauVila.id   } });
  const tpRogerFutA2 = await teamPlayerRepo.findOne({ where: { team: futA2.id, user: rogerMir.id  } });
  const tpLaiaFutB1  = await teamPlayerRepo.findOne({ where: { team: futB1.id, user: laiaCosta.id } });
  const tpNuriaFutB2 = await teamPlayerRepo.findOne({ where: { team: futB2.id, user: nuriaFont.id } });

  const tpClaraBasA1 = await teamPlayerRepo.findOne({ where: { team: basA1.id, user: claraVidal.id } });
  const tpSaraBasA1  = await teamPlayerRepo.findOne({ where: { team: basA1.id, user: saraLlop.id   } });
  const tpEricBasA2  = await teamPlayerRepo.findOne({ where: { team: basA2.id, user: ericMarch.id  } });
  const tpDaniBasA2  = await teamPlayerRepo.findOne({ where: { team: basA2.id, user: daniColl.id   } });

  const tpJuliaVolA1  = await teamPlayerRepo.findOne({ where: { team: volA1.id, user: juliaPages.id } });
  const tpMarinaVolA1 = await teamPlayerRepo.findOne({ where: { team: volA1.id, user: marinaSala.id } });
  const tpPolVolA2    = await teamPlayerRepo.findOne({ where: { team: volA2.id, user: polBruna.id   } });

  const eventGroups = [
    // Futbol Grup A  (FA1 3–1 FA2)
    {
      match: matchFutA,
      events: [
        { type: 'GOAL', description: 'Gol de penal – Marc Roca',       tp: tpMarcFutA1  },
        { type: 'GOAL', description: 'Gol en contra',                  tp: tpPauFutA2   },
        { type: 'CARD', description: 'Targeta groga – entrada dura',   tp: tpRogerFutA2 },
        { type: 'GOAL', description: 'Rematada de cap – Xavi Pons',    tp: tpXaviFutA1  },
        { type: 'GOAL', description: 'Contraatac ràpid – Xavi Pons',   tp: tpXaviFutA1  },
        { type: 'CARD', description: 'Targeta vermella – doble groga', tp: tpRogerFutA2 },
      ],
    },
    // Futbol Grup B  (FB1 0–2 FB2)
    {
      match: matchFutB,
      events: [
        { type: 'GOAL', description: 'Falta directa – Núria Font',    tp: tpNuriaFutB2 },
        { type: 'CARD', description: 'Targeta groga – protesta',      tp: tpLaiaFutB1  },
        { type: 'GOAL', description: 'Dribbling i xut – Núria Font',  tp: tpNuriaFutB2 },
      ],
    },
    // Bàsquet Grup A  (BA1 54–47 BA2)  — sense GOAL/CARD nadius, usem GOAL per punts i CARD per faltes
    {
      match: matchBasA,
      events: [
        { type: 'GOAL', description: 'Triple – Clara Vidal',          tp: tpClaraBasA1 },
        { type: 'CARD', description: 'Falta personal – Èric March',   tp: tpEricBasA2  },
        { type: 'GOAL', description: '2+1 – Sara Llop',               tp: tpSaraBasA1  },
        { type: 'GOAL', description: 'Triple – Dani Coll',            tp: tpDaniBasA2  },
        { type: 'CARD', description: 'Falta tècnica – entrenador',    tp: tpDaniBasA2  },
        { type: 'GOAL', description: 'Contraatac – Clara Vidal',      tp: tpClaraBasA1 },
      ],
    },
    // Voleibol Grup A  (VA1 3–1 VA2)  — GOAL per punt d'equip, CARD per infracció
    {
      match: matchVolA,
      events: [
        { type: 'GOAL', description: 'Set 1 guanyat 25–18',           tp: tpJuliaVolA1  },
        { type: 'GOAL', description: 'Set 2 perdut 22–25',            tp: tpPolVolA2    },
        { type: 'GOAL', description: 'Ace – Júlia Pagès',             tp: tpJuliaVolA1  },
        { type: 'GOAL', description: 'Set 3 guanyat 25–20',           tp: tpMarinaVolA1 },
        { type: 'GOAL', description: 'Set 4 guanyat 25–19',           tp: tpJuliaVolA1  },
      ],
    },
  ];

  for (const eg of eventGroups) {
    const existing = await eventRepo.find({ where: { match: eg.match } });
    if (existing.length === 0) {
      await eventRepo.save(
        eg.events.map(e =>
          eventRepo.create({
            match:       eg.match,
            team_player: e.tp,
            type:        e.type,
            description: e.description,
          })
        )
      );
    }
  }

  // =========================
  // 11. STANDINGS
  // =========================
  const standingsDefs = [
    // Futbol
    { team: futA1, points: 3, played: 1, won: 1, draw: 0, lost: 0, gf: 3, ga: 1 },
    { team: futA2, points: 0, played: 1, won: 0, draw: 0, lost: 1, gf: 1, ga: 3 },
    { team: futB1, points: 0, played: 1, won: 0, draw: 0, lost: 1, gf: 0, ga: 2 },
    { team: futB2, points: 3, played: 1, won: 1, draw: 0, lost: 0, gf: 2, ga: 0 },
    // Bàsquet
    { team: basA1, points: 2, played: 1, won: 1, draw: 0, lost: 0, gf: 54, ga: 47 },
    { team: basA2, points: 1, played: 1, won: 0, draw: 0, lost: 1, gf: 47, ga: 54 },
    { team: basB1, points: 0, played: 0, won: 0, draw: 0, lost: 0, gf: 0,  ga: 0  },
    { team: basB2, points: 0, played: 0, won: 0, draw: 0, lost: 0, gf: 0,  ga: 0  },
    // Voleibol
    { team: volA1, points: 3, played: 1, won: 1, draw: 0, lost: 0, gf: 3,  ga: 1  },
    { team: volA2, points: 0, played: 1, won: 0, draw: 0, lost: 1, gf: 1,  ga: 3  },
    { team: volB1, points: 0, played: 0, won: 0, draw: 0, lost: 0, gf: 0,  ga: 0  },
    { team: volB2, points: 0, played: 0, won: 0, draw: 0, lost: 0, gf: 0,  ga: 0  },
  ];

  for (const s of standingsDefs) {
    await getOrCreate(
      standingRepo,
      { team: s.team },
      {
        team:            s.team,
        points:          s.points,
        played_matches:  s.played,
        won_matches:     s.won,
        drawn_matches:   s.draw,
        lost_matches:    s.lost,
        goals_for:       s.gf,
        goals_against:   s.ga,
      }
    );
  }

  console.log('✅ FULL seed completed — 3 competicions, 12 equips, 6 partits, events & standings');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});