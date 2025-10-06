import dotenv from 'dotenv';
dotenv.config();

export const projectsConfig: ProjectsConfig = {
  cce: {
    stage: {
      baseUrl: 'https://stage-cleanchoiceenergy.com',
    },
    prod: {
      baseUrl: 'https://cleanchoiceenergy.com',
    },
  },
};

export interface ProjectsConfig {
  cce: {
    stage: ProjectConfig;
    prod: ProjectConfig;
  };
}

export interface ProjectConfig {
  baseUrl: string;
}
