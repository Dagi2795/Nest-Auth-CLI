# Nest-Auth-CLI
# Tibeb-Nest-Auth CLI

This CLI tool helps you add an authentication system to your NestJS project. It creates files for user and admin authentication, with routes like `/user/signup`, `/user/login`, and optional features like password reset and two-step verification.

## Prerequisites

Before using the CLI, ensure you have:
- **Node.js** (version 20 or higher, preferably 24.4.0). Install with `nvm`:
  ```bash
  nvm install 24.4.0
  nvm use 24.4.0
  ```
- **NestJS CLI** installed globally:
  ```bash
  npm install -g @nestjs/cli
  ```
- **MySQL** installed and running:
  ```bash
  sudo systemctl start mysql
  ```
- **Postman** for testing routes (download from https://www.postman.com/downloads/ or install via):
  ```bash
  sudo snap install postman
  ```

## Installation

1. **Navigate to the CLI directory**:
   ```bash
   cd /Tibeb-Nest-Auth
   ```

2. **Install dependencies**:
   Install the required packages for the CLI.
   ```bash
   npm install
   ```

3. **Build the CLI**:
   Compile the TypeScript code to JavaScript, outputting to the `dist/` folder.
   ```bash
   npm run build
   ```

4. **Link the CLI globally**:
   Make the `tibeb-nest-auth` command available system-wide.
   ```bash
   npm link
   ```
   If you get a permission error, use:
   ```bash
   sudo npm link
   ```

## Using the CLI

1. **Navigate to your NestJS project**:
   If you don’t have a NestJS project, create one:
   ```bash
   nest new auth
   cd auth
   ```

2. **Run the CLI to generate authentication files**:
   ```bash
   tibeb-nest-auth generate
   ```

3. **Answer the prompts**:
   - **Select features**: Use the spacebar to choose features like `forgot-password` and `reset-password`, then press Enter.
   - **Add fields**: Choose whether to add custom fields (e.g., `phoneNumber:string:false`).
   - **Rename fields**: Optionally rename default fields (e.g., `firstName:name`).
   - **Login identifiers**: Select `email`, `username`, or both.
   - **Package manager**: Choose `npm`, `yarn`, or `pnpm`.
   - **Auth type**: Select `user`, `admin`, or `both`.
   - **OTP delivery**: Choose `sms`, `email`, or `both` (if applicable).
   - **Confirm**: Press Enter (defaults to `Yes`) to proceed.
   Example:
   ```
   ? Select features
   ❯◉ forgot-password
    ◉ reset-password
    ◯ otp-email
    ◯ two-step-verification
   ...
   ? Are you sure you want to proceed? (Y/n) Yes
   ```

4. **Verify generated files**:
   After running, check the `src/` folder:
   ```bash
   ls src/
   ```
   Expected output:
   ```
   app.module.ts  auth/  history/  otp/  permissions/  roles/  users/
   ```
   Check `src/auth/dto/register.dto.ts`:
   ```bash
   cat src/auth/dto/register.dto.ts
   ```
   

## Setting Up the NestJS Project

1. **Configure MySQL**:
   Edit `src/app.module.ts` to set your MySQL credentials:
   ```bash
   nano src/app.module.ts
   ```
   Update the TypeORM configuration:
   ```typescript
   TypeOrmModule.forRoot({
     type: 'mysql',
     host: 'localhost',
     port: 3306,
     username: 'your-username', // Replace with your MySQL username
     password: 'your-password', // Replace with your MySQL password
     database: 'tibeb_auth_db',
     entities: ['dist/**/*.entity{.ts,.js}'],
     synchronize: true, // Set to false in production
   }),
   ```

2. **Create the database**:
   ```bash
   mysql -u root -p -e "CREATE DATABASE tibeb_auth_db;"
   ```

3. **Install project dependencies**:
   ```bash
   npm install
   ```

4. **Start the NestJS application**:
   ```bash
   npm run start:dev
   ```
   The app runs on `http://localhost:3000`.



## Support

For issues, check the CLI output or generated files. Share error messages with your team or on GitHub (if hosted).
