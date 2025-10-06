import dotenv from 'dotenv';
dotenv.config();

export const signUpTestData = {
  firstName: () => `test${Math.random().toString(36).replace(/[0-9]/g, '').slice(2, 12)}`,
  lastName: () => `test${Math.random().toString(36).replace(/[0-9]/g, '').slice(2, 12)}`,
  email: () => `qa_automation+${Date.now()}_${Math.random().toString(36).slice(2, 15)}pwauto@cleanchoice.com`,
  password: process.env.PASSWORD as string,
  confirmPassword: process.env.PASSWORD as string,
};
