import { env } from '../config/env.ts';

const sessionCookieSecurity = [{ sessionCookie: [] }] as const;

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Thread Overflow Backend API',
    version: '1.0.0',
    description: 'Authentication, user session, and hackathon management APIs for Thread Overflow.',
  },
  servers: [
    {
      url: `http://localhost:${env.port}`,
      description: 'Local development',
    },
  ],
  tags: [
    { name: 'System' },
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Hackathons' },
  ],
  components: {
    securitySchemes: {
      sessionCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: env.cookieName,
        description: 'Session cookie created after POST /auth/session.',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
        },
        required: ['error'],
      },
      HealthResponse: {
        type: 'object',
        properties: {
          ok: { type: 'boolean' },
          configured: { type: 'boolean' },
          databaseUrlConfigured: { type: 'boolean' },
        },
        required: ['ok', 'configured', 'databaseUrlConfigured'],
      },
      SessionUser: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          avatarUrl: { type: ['string', 'null'], format: 'uri' },
          role: { type: 'string', enum: ['ADMIN', 'USER'] },
        },
        required: ['id', 'name', 'email', 'avatarUrl', 'role'],
      },
      SessionResponse: {
        type: 'object',
        properties: {
          configured: { type: 'boolean' },
          user: {
            anyOf: [{ $ref: '#/components/schemas/SessionUser' }, { type: 'null' }],
          },
        },
        required: ['configured', 'user'],
      },
      EstablishSessionRequest: {
        type: 'object',
        properties: {
          idToken: { type: 'string' },
        },
        required: ['idToken'],
      },
      LogoutResponse: {
        type: 'object',
        properties: {
          ok: { type: 'boolean' },
        },
        required: ['ok'],
      },
      PersistedUser: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          avatarUrl: { type: ['string', 'null'], format: 'uri' },
          role: { type: 'string', enum: ['ADMIN', 'USER'] },
          azureRoles: {
            type: 'array',
            items: { type: 'string' },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          lastLoginAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'email', 'name', 'avatarUrl', 'role', 'azureRoles', 'createdAt', 'updatedAt', 'lastLoginAt'],
      },
      CurrentUserResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/PersistedUser' },
        },
        required: ['user'],
      },
      HackathonStageCriterion: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          maxScore: { type: 'integer', minimum: 1 },
        },
        required: ['id', 'label', 'maxScore'],
      },
      HackathonStage: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          code: { type: 'string' },
          type: { type: 'string', enum: ['REGISTRATION', 'SUBMISSION'] },
          startAt: { type: 'string' },
          endAt: { type: 'string' },
          sourceStageId: { type: 'string' },
          evaluationEnabled: { type: 'boolean' },
          evaluationMaxScore: { type: 'integer', minimum: 0 },
          evaluationCriteria: {
            type: 'array',
            items: { $ref: '#/components/schemas/HackathonStageCriterion' },
          },
        },
        required: ['name', 'code', 'type'],
      },
      Hackathon: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          slug: { type: 'string' },
          title: { type: 'string' },
          prizePool: { type: 'string' },
          logoDataUrl: { type: 'string' },
          coverImageDataUrl: { type: 'string' },
          overviewHtml: { type: 'string' },
          overviewText: { type: 'string' },
          tracks: {
            type: 'array',
            items: { type: 'string' },
          },
          registrationStart: { type: 'string' },
          registrationEnd: { type: 'string' },
          participationType: { type: 'string', enum: ['INDIVIDUAL', 'TEAM'] },
          minTeamSize: { type: 'string' },
          maxTeamSize: { type: 'string' },
          registrationFields: {
            type: 'array',
            items: { type: 'string' },
          },
          stages: {
            type: 'array',
            items: { $ref: '#/components/schemas/HackathonStage' },
          },
          registrationCount: { type: 'integer' },
          createdAt: { type: 'string' },
        },
        required: [
          'id',
          'slug',
          'title',
          'logoDataUrl',
          'coverImageDataUrl',
          'overviewHtml',
          'overviewText',
          'tracks',
          'registrationStart',
          'registrationEnd',
          'participationType',
          'minTeamSize',
          'maxTeamSize',
          'registrationFields',
          'stages',
          'registrationCount',
          'createdAt',
        ],
      },
      HackathonsResponse: {
        type: 'object',
        properties: {
          hackathons: {
            type: 'array',
            items: { $ref: '#/components/schemas/Hackathon' },
          },
        },
        required: ['hackathons'],
      },
      CreateHackathonRequest: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          logoDataUrl: { type: 'string' },
          coverImageDataUrl: { type: 'string' },
          tracks: { type: 'array', items: { type: 'string' } },
          registrationStart: { type: 'string' },
          registrationEnd: { type: 'string' },
          participationType: { type: 'string', enum: ['INDIVIDUAL', 'TEAM'] },
          minTeamSize: { type: 'string' },
          maxTeamSize: { type: 'string' },
          registrationFields: { type: 'array', items: { type: 'string' } },
          prizePool: { type: 'string' },
        },
        required: [
          'title',
          'description',
          'logoDataUrl',
          'coverImageDataUrl',
          'tracks',
          'registrationStart',
          'registrationEnd',
          'participationType',
          'registrationFields',
        ],
      },
      HackathonResponse: {
        type: 'object',
        properties: {
          hackathon: { $ref: '#/components/schemas/Hackathon' },
        },
        required: ['hackathon'],
      },
      UpdateHackathonStagesRequest: {
        type: 'object',
        properties: {
          stages: {
            type: 'array',
            items: { $ref: '#/components/schemas/HackathonStage' },
          },
        },
        required: ['stages'],
      },
      RegistrationFormResponse: {
        type: 'object',
        properties: {
          field: { type: 'string' },
          value: { type: 'string' },
        },
        required: ['field', 'value'],
      },
      RegistrationTeammate: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
        required: ['name', 'email'],
      },
      HackathonRegistrationSubmission: {
        type: 'object',
        properties: {
          stageId: { type: 'string' },
          stageName: { type: 'string' },
          stageCode: { type: 'string' },
          status: { type: 'string', enum: ['IN_PROGRESS', 'SHORTLISTED', 'REJECTED'] },
          submitted: { type: 'boolean' },
          projectTitle: { type: 'string' },
          summary: { type: 'string' },
          demoUrl: { type: 'string', format: 'uri' },
          repositoryUrl: { type: 'string', format: 'uri' },
          videoUrl: { type: 'string', format: 'uri' },
          deckUrl: { type: 'string', format: 'uri' },
          additionalNotes: { type: 'string' },
          score: { type: 'string' },
          panel: { type: 'string' },
          decisionNote: { type: 'string' },
          submittedAt: { type: 'string', format: 'date-time' },
          reviewedAt: { type: 'string', format: 'date-time' },
        },
        required: ['stageId', 'stageName', 'stageCode', 'status', 'submitted'],
      },
      HackathonRegistration: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          participantName: { type: 'string' },
          participantEmail: { type: 'string', format: 'email' },
          teamName: { type: 'string' },
          track: { type: 'string' },
          formResponses: {
            type: 'array',
            items: { $ref: '#/components/schemas/RegistrationFormResponse' },
          },
          teammates: {
            type: 'array',
            items: { $ref: '#/components/schemas/RegistrationTeammate' },
          },
          submissions: {
            type: 'array',
            items: { $ref: '#/components/schemas/HackathonRegistrationSubmission' },
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'participantName', 'participantEmail', 'formResponses', 'teammates', 'submissions', 'createdAt'],
      },
      RegistrationMember: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          avatarUrl: { type: ['string', 'null'], format: 'uri' },
          role: { type: 'string', enum: ['LEAD', 'MEMBER'] },
        },
        required: ['name', 'email', 'avatarUrl', 'role'],
      },
      HackathonRegistrationDetail: {
        allOf: [
          { $ref: '#/components/schemas/HackathonRegistration' },
          {
            type: 'object',
            properties: {
              lead: { $ref: '#/components/schemas/RegistrationMember' },
              members: {
                type: 'array',
                items: { $ref: '#/components/schemas/RegistrationMember' },
              },
            },
            required: ['lead', 'members'],
          },
        ],
      },
      RegistrationsResponse: {
        type: 'object',
        properties: {
          registrations: {
            type: 'array',
            items: { $ref: '#/components/schemas/HackathonRegistrationDetail' },
          },
        },
        required: ['registrations'],
      },
      RegistrationResponse: {
        type: 'object',
        properties: {
          registration: { $ref: '#/components/schemas/HackathonRegistrationDetail' },
        },
        required: ['registration'],
      },
      CreateHackathonRegistrationRequest: {
        type: 'object',
        properties: {
          participantName: { type: 'string' },
          participantEmail: { type: 'string', format: 'email' },
          teamName: { type: 'string' },
          track: { type: 'string' },
          formResponses: {
            type: 'array',
            items: { $ref: '#/components/schemas/RegistrationFormResponse' },
          },
          teammates: {
            type: 'array',
            items: { $ref: '#/components/schemas/RegistrationTeammate' },
          },
        },
        required: ['participantName', 'participantEmail', 'formResponses'],
      },
      UpsertStageSubmissionRequest: {
        type: 'object',
        properties: {
          projectTitle: { type: 'string' },
          summary: { type: 'string' },
          demoUrl: { type: 'string', format: 'uri' },
          repositoryUrl: { type: 'string', format: 'uri' },
          videoUrl: { type: 'string', format: 'uri' },
          deckUrl: { type: 'string', format: 'uri' },
          additionalNotes: { type: 'string' },
          submitted: { type: 'boolean' },
        },
        required: ['submitted'],
      },
      ReviewStageSubmissionRequest: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['IN_PROGRESS', 'SHORTLISTED', 'REJECTED'] },
          score: { type: 'string' },
          panel: { type: 'string' },
          decisionNote: { type: 'string' },
        },
        required: ['status'],
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Get service health',
        responses: {
          200: {
            description: 'Health status',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current session',
        responses: {
          200: {
            description: 'Current auth session',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SessionResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/session': {
      post: {
        tags: ['Auth'],
        summary: 'Establish a backend session from a Microsoft identity token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EstablishSessionRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Session established',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SessionResponse' },
              },
            },
          },
          400: {
            description: 'Missing token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Invalid token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'SSO not configured',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Destroy the current session',
        security: sessionCookieSecurity,
        responses: {
          200: {
            description: 'Logout completed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LogoutResponse' },
              },
            },
          },
          500: {
            description: 'Logout failure',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get the current persisted user',
        security: sessionCookieSecurity,
        responses: {
          200: {
            description: 'Current user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CurrentUserResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/hackathons': {
      get: {
        tags: ['Hackathons'],
        summary: 'List hackathons',
        security: sessionCookieSecurity,
        responses: {
          200: {
            description: 'Hackathon list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HackathonsResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Hackathons'],
        summary: 'Create a hackathon',
        security: sessionCookieSecurity,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateHackathonRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Hackathon created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HackathonResponse' },
              },
            },
          },
          400: {
            description: 'Invalid payload',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/hackathons/{slug}': {
      get: {
        tags: ['Hackathons'],
        summary: 'Get one hackathon by slug',
        security: sessionCookieSecurity,
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Hackathon detail',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HackathonResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Hackathon not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Hackathons'],
        summary: 'Delete a hackathon',
        security: sessionCookieSecurity,
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          204: {
            description: 'Hackathon deleted',
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Hackathon not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/hackathons/{slug}/stages': {
      put: {
        tags: ['Hackathons'],
        summary: 'Replace hackathon stages',
        security: sessionCookieSecurity,
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateHackathonStagesRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated hackathon',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HackathonResponse' },
              },
            },
          },
          400: {
            description: 'Invalid payload',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Hackathon not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/hackathons/{slug}/my-registration': {
      get: {
        tags: ['Hackathons'],
        summary: 'Get the current user registration for a hackathon',
        security: sessionCookieSecurity,
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Registration detail',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegistrationResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Hackathon or registration not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/hackathons/{slug}/my-registration/submissions/{stageId}': {
      put: {
        tags: ['Hackathons'],
        summary: 'Create or update the current user submission for a stage',
        security: sessionCookieSecurity,
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'stageId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpsertStageSubmissionRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated registration detail',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegistrationResponse' },
              },
            },
          },
          400: {
            description: 'Invalid payload',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Hackathon, registration, or stage not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/hackathons/{slug}/registrations': {
      get: {
        tags: ['Hackathons'],
        summary: 'List registrations for a hackathon',
        security: sessionCookieSecurity,
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Registration list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegistrationsResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Hackathon not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Hackathons'],
        summary: 'Create a registration for the current user',
        security: sessionCookieSecurity,
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateHackathonRegistrationRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Registration created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    hackathon: { $ref: '#/components/schemas/Hackathon' },
                    registration: { $ref: '#/components/schemas/HackathonRegistrationDetail' },
                  },
                  required: ['hackathon', 'registration'],
                },
              },
            },
          },
          400: {
            description: 'Invalid payload',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Hackathon not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/hackathons/{slug}/registrations/{registrationId}': {
      get: {
        tags: ['Hackathons'],
        summary: 'Get one registration by id',
        security: sessionCookieSecurity,
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'registrationId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Registration detail',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegistrationResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Hackathon or registration not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Hackathons'],
        summary: 'Delete a registration',
        security: sessionCookieSecurity,
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'registrationId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          204: {
            description: 'Registration deleted',
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Hackathon or registration not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/hackathons/{slug}/registrations/{registrationId}/submissions/{stageId}/status': {
      put: {
        tags: ['Hackathons'],
        summary: 'Review a registration stage submission',
        security: sessionCookieSecurity,
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'registrationId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'stageId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReviewStageSubmissionRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated registration detail',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegistrationResponse' },
              },
            },
          },
          400: {
            description: 'Invalid payload',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Hackathon, registration, stage, or submission not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
} as const;
