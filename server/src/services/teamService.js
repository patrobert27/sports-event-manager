const { AppDataSource } = require('../config/data-source');
const Team = require('../entities/Team');
const Competition = require('../entities/Competition');
const User = require('../entities/User');
const TeamPlayer = require('../entities/TeamPlayer');
const { 
  ADMIN_VARIANTS, 
  TEACHER_VARIANTS, 
  STUDENT_VARIANTS 
} = require('../constants/roles');

/**
 * TeamService
 * 
 * Aquesta classe conté tota la lògica de negoci relacionada amb els equips.
 * Aquí és on fem les consultes a la base de dades i apliquem les regles
 * de qui pot fer què i quan ho pot fer.
 */
class TeamService {
    
    // Mètodes auxiliars per obtenir els repositoris de cada entitat
    getRepo() { 
      return AppDataSource.getRepository(Team); 
    }
    
    getCompRepo() { 
      return AppDataSource.getRepository(Competition); 
    }
    
    getUserRepo() { 
      return AppDataSource.getRepository(User); 
    }
    
    getPlayerRepo() { 
      return AppDataSource.getRepository(TeamPlayer); 
    }

    /**
     * Comprova si un usuari té permís per gestionar un equip.
     * Els administradors, el capità de l'equip i el professor tutor
     * són els que tenen permís per fer canvis.
     */
    canManageTeam(user, team) {
        // 1. Validacions
        if (!user || !team) {
          return false;
        }

        // 2. Carrega de dades i càlculs
        const roleName = (user.role?.name || "").toString().toLowerCase();
        
        const isAdmin = ADMIN_VARIANTS.includes(roleName);
        
        // Comprovem si l'ID de l'usuari coincideix amb el capità o el tutor
        const isCaptain = team.captain?.id === user.id || team.captain_id === user.id;
        const isTutor = team.teacher?.id === user.id || team.teacher_id === user.id;

        // 3. Resposta
        // Si és admin, capità o tutor, té permís (true)
        return isAdmin || isCaptain || isTutor;
    }

    /**
     * Neteja l'objecte equip per enviar-lo al frontend.
     * Calcula també el recompte de jugadors confirmats.
     */
    _mapTeam(team) {
        // 1. Validacions
        if (!team) {
          return null;
        }

        // 2. Lògica de negoci i càlculs
        // Filtrem només els jugadors que ja han estat confirmats pel capità/tutor
        const confirmedPlayers = team.players?.filter((player) => {
          return player.confirmed === true;
        }) || [];

        // 3. Resposta
        // Retornem un objecte nou amb el format que necessita el frontend
        return {
            id: team.id,
            name: team.name,
            code: team.code || null,
            shield: team.shield || null,
            primary_color: team.primary_color || null,
            secondary_color: team.secondary_color || null,
            
            // Netegem la contrasenya del capità i tutor
            captain: this._sanitizeUser(team.captain),
            teacher: this._sanitizeUser(team.teacher),
            
            // Dades de la competició resumides
            competition: team.competition 
              ? {
                  id: team.competition.id,
                  name: team.competition.name,
                  status: team.competition.status,
                  activity: team.competition.activity 
                    ? {
                        id: team.competition.activity.id,
                        name: team.competition.activity.name,
                        min_players: team.competition.activity.min_players,
                        max_players: team.competition.activity.max_players
                      } 
                    : null
                } 
              : null,
            
            // Llista de jugadors sense dades sensibles
            players: team.players 
              ? team.players.map((player) => {
                  return {
                    id: player.id,
                    confirmed: player.confirmed,
                    user: this._sanitizeUser(player.user)
                  };
                }) 
              : [],
            
            confirmedCount: confirmedPlayers.length,
            maxPlayers: team.competition?.activity?.max_players || null,
            minPlayers: team.competition?.activity?.min_players || 0
        };
    }

    /**
     * Elimina el camp password de l'objecte usuari.
     */
    _sanitizeUser(user) {
        // 1. Validacions
        if (!user) {
            return null;
        }
        
        // 2. Lògica
        // Fem una còpia de l'usuari sense el camp password
        const { password, ...safeUser } = user;
        
        // 3. Resposta
        return safeUser;
    }

    /**
     * Mira si un usuari ja està inscrit en algun equip d'una competició concreta.
     */
    async _checkUserInCompetition(userId, competitionId, entityManager = null) {
        // 1. Validacions i Càrrega
        const repo = entityManager 
          ? entityManager.getRepository(TeamPlayer) 
          : this.getPlayerRepo();
        
        // Busquem si hi ha algun registre de l'usuari en aquesta competició
        const existingRecord = await repo.findOne({
            where: {
                user: { 
                  id: userId 
                },
                team: { 
                  competition: { 
                    id: competitionId 
                  } 
                }
            },
            relations: { 
              team: { 
                competition: true 
              } 
            }
        });
        
        // 2. Resposta
        // Retornem true si hem trobat un registre, false si no
        return !!existingRecord;
    }

    /**
     * Comprova si la competició està actualment en fase de registre.
     */
    _checkRegistrationOpen(competition) {
        // 1. Validacions
        if (!competition) {
          return false;
        }

        // Només es pot registrar si l'estat és 'REGISTRATION'
        if (competition.status !== 'REGISTRATION') {
          return false;
        }

        // 2. Lògica de negoci
        const now = new Date();

        // Comprovem si ja ha començat el període de registre
        if (competition.registration_start) {
            const startDate = new Date(competition.registration_start);
            if (startDate > now) {
              return false;
            }
        }

        // Comprovem si encara no ha passat la data límit
        if (competition.registration_deadline) {
            const deadlineDate = new Date(competition.registration_deadline);
            if (deadlineDate < now) {
              return false;
            }
        }

        // 3. Resposta
        return true;
    }

    /**
     * Crea un equip nou i hi afegeix el creador com a capità.
     */
    async createTeam(data, creatorId) {
        // 1. Validacions
        const { 
          name, 
          competition_id, 
          teacher_id, 
          shield, 
          primary_color, 
          secondary_color 
        } = data;

        if (!name?.trim()) {
          throw Object.assign(
            new Error("El nom de l'equip és obligatori"), 
            { status: 400 }
          );
        }
        
        if (!competition_id) {
          throw Object.assign(
            new Error("La competició és obligatòria"), 
            { status: 400 }
          );
        }

        // 2. Carrega de dades
        const competition = await this.getCompRepo().findOne({
            where: { 
              id: competition_id 
            },
            relations: { 
              activity: true 
            }
        });

        if (!competition) {
          throw Object.assign(
            new Error("Competició no trobada"), 
            { status: 404 }
          );
        }

        // Comprovem que el registre estigui obert
        const isOpen = this._checkRegistrationOpen(competition);
        
        if (!isOpen) {
            throw Object.assign(
              new Error("El període d'inscripció ha finalitzat o la competició no està en fase de registre"), 
              { status: 400 }
            );
        }

        // Comprovem si l'usuari ja és en un altre equip d'aquesta jornada
        const isAlreadyIn = await this._checkUserInCompetition(
          creatorId, 
          competition_id
        );
        
        if (isAlreadyIn) {
          throw Object.assign(
            new Error("Ja tens una solicitud o equip en aquesta competició"), 
            { status: 409 }
          );
        }

        // Només els estudiants poden crear equips
        const creatorUser = await this.getUserRepo().findOne({ 
          where: { 
            id: creatorId 
          }, 
          relations: { 
            role: true 
          } 
        });
        
        const roleName = (creatorUser?.role?.name || "").toString().toLowerCase();
        
        if (!STUDENT_VARIANTS.includes(roleName)) {
            throw Object.assign(
              new Error("Només els estudiants poden crear equips"), 
              { status: 403 }
            );
        }

        // 3. Guardar dades
        // Fem servir una transacció per assegurar-nos que es guarda tot correctament
        return await AppDataSource.transaction(async (entityManager) => {
            
            // Creem l'entitat equip
            const teamEntity = entityManager.create(Team, {
                name: name.trim(),
                code: null,
                shield: shield || null,
                primary_color: primary_color || null,
                secondary_color: secondary_color || null,
                competition: { 
                  id: competition_id 
                },
                captain: { 
                  id: creatorId 
                },
                teacher: teacher_id 
                  ? { id: teacher_id } 
                  : null
            });

            const savedTeam = await entityManager.save(Team, teamEntity);

            // Afegim el creador com a jugador confirmat
            const playerEntity = entityManager.create(TeamPlayer, {
                user: { 
                  id: creatorId 
                },
                team: { 
                  id: savedTeam.id 
                },
                confirmed: true
            });
            
            await entityManager.save(TeamPlayer, playerEntity);

            // 4. Resposta
            return this.getTeamById(
              savedTeam.id, 
              entityManager
            );
        });
    }

    /**
     * Afegeix una sol·licitud per unir-se a un equip.
     */
    async joinTeam(teamId, userId) {
        // 1. Lògica de negoci (Transacció)
        return await AppDataSource.transaction(async (entityManager) => {
            
            // 2. Carrega de dades
            const team = await entityManager.getRepository(Team).findOne({
                where: { 
                  id: teamId 
                },
                relations: { 
                  competition: { 
                    activity: true 
                  } 
                }
            });
            
            if (!team) {
              throw Object.assign(
                new Error("Equip no trobat"), 
                { status: 404 }
              );
            }

            const competition = team.competition;

            // Comprovem que es pugui unir (registre obert)
            const isOpen = this._checkRegistrationOpen(competition);
            
            if (!isOpen) {
                throw Object.assign(
                  new Error("El període d'inscripció ha finalitzat o la competició no està en fase de registre"), 
                  { status: 400 }
                );
            }

            // Comprovem que l'usuari sigui un estudiant
            const user = await entityManager.getRepository(User).findOne({
                where: { 
                  id: userId 
                },
                relations: { 
                  role: true 
                }
            });
            
            const roleName = (user?.role?.name || "").toString().toLowerCase();
            
            if (!STUDENT_VARIANTS.includes(roleName)) {
                throw Object.assign(
                  new Error("Només els estudiants poden unir-se com a jugadors"), 
                  { status: 403 }
                );
            }

            // Mirem si ja és en un altre equip
            const alreadyRegistered = await this._checkUserInCompetition(
              userId, 
              competition.id, 
              entityManager
            );
            
            if (alreadyRegistered) {
                throw Object.assign(
                  new Error("Ja estas o has solicitat unir-te a un equip d'aquesta jornada"), 
                  { status: 409 }
                );
            }

            // Mirem si l'equip està ple
            const maxPlayers = competition.activity?.max_players;
            
            if (maxPlayers) {
                const playerCount = await entityManager.getRepository(TeamPlayer).count({
                    where: { 
                      team: { id: teamId }, 
                      confirmed: true 
                    }
                });
                
                if (playerCount >= maxPlayers) {
                    throw Object.assign(
                      new Error(`L'equip ja té el màxim de ${maxPlayers} jugadors`), 
                      { status: 409 }
                    );
                }
            }

            // 3. Guardar dades
            const newPlayer = entityManager.create(TeamPlayer, {
                user: { 
                  id: userId 
                },
                team: { 
                  id: teamId 
                },
                confirmed: false
            });
            
            // 4. Resposta
            return await entityManager.save(TeamPlayer, newPlayer);
        });
    }

    /**
     * Accepta un membre a l'equip (confirma la sol·licitud).
     */
    async acceptMember(teamPlayerId) {
        // 1. Lògica de negoci (Transacció)
        return await AppDataSource.transaction(async (entityManager) => {
            
            // 2. Carrega de dades
            const playerRecord = await entityManager.getRepository(TeamPlayer).findOne({
                where: { 
                  id: teamPlayerId 
                },
                relations: { 
                  team: { 
                    competition: { 
                      activity: true 
                    } 
                  } 
                }
            });
            
            if (!playerRecord) {
              throw Object.assign(
                new Error("Registre no trobat"), 
                { status: 404 }
              );
            }
            
            // Comprovem si encara es poden acceptar membres
            const isOpen = this._checkRegistrationOpen(playerRecord.team.competition);
            
            if (!isOpen) {
                throw Object.assign(
                  new Error("No es poden acceptar membres fora del període d'inscripció"), 
                  { status: 400 }
                );
            }

            if (playerRecord.confirmed) {
              throw Object.assign(
                new Error("Jugador ja confirmat"), 
                { status: 409 }
              );
            }

            // Comprovem si l'equip es passaria del límit
            const maxCount = playerRecord.team.competition?.activity?.max_players;
            
            if (maxCount) {
                const currentPlayers = await entityManager.getRepository(TeamPlayer).count({
                    where: { 
                      team: { id: playerRecord.team.id }, 
                      confirmed: true 
                    }
                });
                
                if (currentPlayers >= maxCount) {
                  throw Object.assign(
                    new Error("L'equip està ple"), 
                    { status: 409 }
                  );
                }
            }

            // 3. Guardar dades
            playerRecord.confirmed = true;
            
            // 4. Resposta
            return await entityManager.save(TeamPlayer, playerRecord);
        });
    }

    /**
     * Elimina un membre de l'equip.
     */
    async removeMember(teamPlayerId, userId) {
        // 1. Carrega de dades
        const playerToRemove = await this.getPlayerRepo().findOne({
            where: { 
              id: teamPlayerId 
            },
            relations: { 
              team: { 
                competition: true 
              }, 
              user: true 
            }
        });
        
        if (!playerToRemove) {
            throw Object.assign(
              new Error("Membre no trobat"), 
              { status: 404 }
            );
        }

        const currentUser = await this.getUserRepo().findOne({ 
          where: { 
            id: userId 
          }, 
          relations: { 
            role: true 
          } 
        });
        
        const roleName = (currentUser?.role?.name || "").toString().toLowerCase();
        
        const isAdmin = ADMIN_VARIANTS.includes(roleName);
        const isCaptain = playerToRemove.team.captain_id === userId;
        const isTutor = playerToRemove.team.teacher_id === userId;
        const isSelf = playerToRemove.user.id === userId;

        const isRegOpen = this._checkRegistrationOpen(playerToRemove.team.competition);
        const isFinished = playerToRemove.team.competition?.status === 'FINISHED';

        // 2. Lògica de negoci (Qui pot eliminar?)
        let canRemove = false;
        
        if (isAdmin) {
            canRemove = true; 
        } else if (isSelf && isRegOpen) {
            canRemove = true; 
        } else if (isCaptain && isRegOpen) {
            canRemove = true; 
        } else if (isTutor && !isFinished) {
            canRemove = true; 
        }

        if (!canRemove) {
            throw Object.assign(
              new Error("No tens permís per eliminar aquest membre en aquest moment"), 
              { status: 403 }
            );
        }

        // El capità no es pot autodescartar
        if (playerToRemove.user.id === playerToRemove.team.captain_id) {
          throw Object.assign(
            new Error("No es pot eliminar al capità"), 
            { status: 400 }
          );
        }

        // 3. Guardar dades (Eliminar)
        await this.getPlayerRepo().delete(teamPlayerId);
        
        // 4. Resposta
        return { 
          message: "Membre eliminat" 
        };
    }

    /**
     * Llista els equips d'una competició.
     */
    async listTeams(competitionId = null) {
        // 1. Carrega de dades
        const query = this.getRepo().createQueryBuilder('team')
            .leftJoinAndSelect('team.competition', 'competition')
            .leftJoinAndSelect('competition.activity', 'activity')
            .leftJoinAndSelect('team.captain', 'captain')
            .leftJoinAndSelect('team.teacher', 'teacher')
            .leftJoinAndSelect('team.players', 'players')
            .leftJoinAndSelect('players.user', 'user');

        if (competitionId) {
            query.andWhere(
              'team.competition_id = :competitionId', 
              { competitionId }
            );
        }

        const teamsFound = await query.getMany();
        
        // 2. Resposta
        // Mapegem cada equip per netejar les dades
        return teamsFound.map((team) => {
          return this._mapTeam(team);
        });
    }

    /**
     * Obté un equip pel seu ID.
     */
    async getTeamById(id, entityManager = null) {
        // 1. Validacions i Càrrega
        const repo = entityManager 
          ? entityManager.getRepository(Team) 
          : this.getRepo();
        
        const teamFound = await repo.findOne({
            where: { 
              id: id 
            },
            relations: {
                competition: { 
                  activity: true 
                },
                captain: true,
                teacher: true,
                players: { 
                  user: true 
                }
            }
        });
        
        if (!teamFound) {
          throw Object.assign(
            new Error("Equip no trobat"), 
            { status: 404 }
          );
        }
        
        // 2. Resposta
        return this._mapTeam(teamFound);
    }

    /**
     * Obté l'equip d'un registre de jugador concret.
     */
    async getTeamByPlayerRecordId(playerRecordId) {
        // 1. Carrega de dades
        const playerRecord = await this.getPlayerRepo().findOne({
            where: { 
              id: playerRecordId 
            },
            relations: { 
              team: { 
                captain: true, 
                teacher: true, 
                players: { 
                  user: true 
                } 
              } 
            }
        });
        
        if (!playerRecord) {
          throw Object.assign(
            new Error("Registre no trobat"), 
            { status: 404 }
          );
        }
        
        // 2. Resposta
        return playerRecord.team;
    }

    /**
     * Actualitza la informació d'un equip.
     */
    async updateTeam(id, data, userId) {
        // 1. Validacions i Carrega
        const teamToUpdate = await this.getTeamById(id);
        
        if (!teamToUpdate) {
          throw Object.assign(
            new Error("Equip no trobat"), 
            { status: 404 }
          );
        }

        const currentUser = await this.getUserRepo().findOne({ 
          where: { 
            id: userId 
          }, 
          relations: { 
            role: true 
          } 
        });
        
        const roleName = (currentUser?.role?.name || "").toString().toLowerCase();
        
        const isAdmin = ADMIN_VARIANTS.includes(roleName);
        const isCaptain = teamToUpdate.captain?.id === userId;
        const isTutor = teamToUpdate.teacher?.id === userId;
        
        const isRegOpen = this._checkRegistrationOpen(teamToUpdate.competition);
        const isFinished = teamToUpdate.competition?.status === 'FINISHED';

        // 2. Lògica de negoci (Qui pot editar?)
        let canEdit = false;
        
        if (isAdmin) {
            canEdit = true; 
        } else if (isCaptain && isRegOpen) {
            canEdit = true; 
        } else if (isTutor && !isFinished) {
            canEdit = true; 
        }

        if (!canEdit) {
            throw Object.assign(
              new Error("No tens permís per editar l'equip en aquest moment"), 
              { status: 403 }
            );
        }

        // Seleccionem només els camps que deixem editar
        const allowedFields = [
          'name', 
          'shield', 
          'primary_color', 
          'secondary_color', 
          'teacher_id'
        ];
        
        const updateData = {};
        
        allowedFields.forEach((key) => {
            if (data[key] !== undefined) {
                if (key === 'teacher_id') {
                  updateData.teacher = data.teacher_id 
                    ? { id: data.teacher_id } 
                    : null;
                } else {
                  updateData[key] = data[key];
                }
            }
        });

        // 3. Guardar dades
        await this.getRepo().update(id, updateData);
        
        // 4. Resposta
        return this.getTeamById(id);
    }

    /**
     * Elimina un equip sencer.
     */
    async deleteTeam(id) {
        // 1. Carrega de dades
        const teamEntity = await this.getRepo().findOne({ 
          where: { 
            id: id 
          } 
        });
        
        if (!teamEntity) {
          throw Object.assign(
            new Error("Equip no trobat"), 
            { status: 404 }
          );
        }
        
        // 2. Guardar dades (Eliminar)
        await this.getRepo().remove(teamEntity);
        
        // 3. Resposta
        return { 
          message: "Equip eliminat correctament" 
        };
    }

    /**
     * Canvia el capità de l'equip.
     */
    async transferCaptaincy(teamId, newCaptainId) {
        // 1. Lògica de negoci (Transacció)
        return await AppDataSource.transaction(async (entityManager) => {
            
            // 2. Carrega de dades
            const teamInfo = await entityManager.getRepository(Team).findOne({
                where: { 
                  id: teamId 
                },
                relations: { 
                  players: { 
                    user: true 
                  } 
                }
            });
            
            if (!teamInfo) {
              throw Object.assign(
                new Error("Equip no trobat"), 
                { status: 404 }
              );
            }

            // Comprovem que el nou capità sigui membre confirmat
            const newCaptainMember = teamInfo.players.find((player) => {
              return player.user.id === newCaptainId && player.confirmed;
            });
            
            if (!newCaptainMember) {
              throw Object.assign(
                new Error("El nou capità ha de ser membre confirmat"), 
                { status: 400 }
              );
            }

            // 3. Guardar dades
            teamInfo.captain = { 
              id: newCaptainId 
            };
            
            const savedTeamInfo = await entityManager.save(Team, teamInfo);
            
            // 4. Resposta
            return this.getTeamById(
              savedTeamInfo.id, 
              entityManager
            );
        });
    }

    /**
     * Valida si l'equip compleix els requisits numèrics de la competició.
     */
    async validateTeamReadiness(teamId) {
        // 1. Carrega de dades
        const teamDetails = await this.getTeamById(teamId);
        
        // 2. Resposta amb càlculs
        return {
            isReady: teamDetails.confirmedCount >= teamDetails.minPlayers && (teamDetails.maxPlayers ? teamDetails.confirmedCount <= teamDetails.maxPlayers : true),
            confirmedCount: teamDetails.confirmedCount,
            minPlayers: teamDetails.minPlayers,
            maxPlayers: teamDetails.maxPlayers,
            missing: teamDetails.confirmedCount < teamDetails.minPlayers ? teamDetails.minPlayers - teamDetails.confirmedCount : 0
        };
    }
}

module.exports = new TeamService();
