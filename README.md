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
   cd ~/Music/Tibeb-Nest-Auth
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
   cd ~/Desktop/NewFolder
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
   Example content:
   ```
   import { IsString, IsEmail, MinLength, IsOptional, IsNotEmpty } from 'class-validator';

   export class RegisterDto {
     @IsNotEmpty()
     @IsString()
     @IsEmail()
     email: string;

     @IsNotEmpty()
     @IsString()
     @MinLength(8)
     password: string;

     @IsOptional()
     @IsString()
     username: string;

     @IsOptional()
     @IsString()
     firstName: string;

     @IsOptional()
     @IsString()
     lastName: string;
   }
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

3. **Set up JWT secret**:
   Create a `.env` file:
   ```bash
   nano .env
   ```
   Add:
   ```
   JWT_SECRET=your-secure-secret-key
   ```
   Install `dotenv`:
   ```bash
   npm install dotenv
   ```
   Update `src/main.ts`:
   ```typescript
   import { config } from 'dotenv';
   config();
   ```

4. **Install project dependencies**:
   ```bash
   npm install
   ```

5. **Start the NestJS application**:
   ```bash
   npm run start:dev
   ```
   The app runs on `http://localhost:3000`.

## Testing Routes in Postman

The CLI generates routes like `/user/signup`, `/user/login`, and optional routes like `/user/forgot-password`. Use Postman to test them.

1. **Set up Postman**:
   - Open Postman and create a new collection named “Tibeb-Nest-Auth”.
   - Create an environment named “Tibeb-Nest-Auth-Dev” with a variable:
     - Key: `baseUrl`
     - Value: `http://localhost:3000`

2. **Test `POST /user/signup`**:
   - Create a new request named “User Signup”.
   - Method: `POST`
   - URL: `{{baseUrl}}/user/signup`
   - Headers:
     ```
     Content-Type: application/json
     ```
   - Body (raw, JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "password123",
       "username": "testuser",
       "firstName": "Test",
       "lastName": "User"
     }
     ```
   - Click “Send”. Expected: `201 Created` with user details.
   - Save the request.

3. **Test `POST /user/login`**:
   - Create a new request named “User Login”.
   - Method: `POST`
   - URL: `{{baseUrl}}/user/login`
   - Headers:
     ```
     Content-Type: application/json
     ```
   - Body:
     ```json
     {
       "email": "test@example.com",
       "password": "password123"
     }
     ```
   - Tests (to save token):
     ```javascript
     const response = pm.response.json();
     if (response.access_token) {
       pm.environment.set("userToken", response.access_token);
     }
     ```
   - Click “Send”. Expected: `200 OK` with `{ "access_token": "..." }`.
   - Save the request.

4. **Test `POST /user/forgot-password` (if enabled)**:
   - Create a new request named “User Forgot Password”.
   - Method: `POST`
   - URL: `{{baseUrl}}/user/forgot-password`
   - Headers:
     ```
     Content-Type: application/json
     ```
   - Body:
     ```json
     {
       "email": "test@example.com"
     }
     ```
   - Click “Send”. Expected: `200 OK` with `{ "message": "Password reset email sent" }`.

5. **Test admin routes (if `authType: both` or `admin`)**:
   - Create “Admin Signup” and “Admin Login” requests (similar to user routes).
   - For `POST /admin/users`:
     - URL: `{{baseUrl}}/admin/users`
     - Headers:
       ```
       Content-Type: application/json
       Authorization: Bearer {{userToken}}
       ```
     - Body: `{}`
     - Expected: `200 OK` with a list of users.

## Troubleshooting

- **CLI command not found**:
  ```bash
  tibeb-nest-auth: No such file or directory
  ```
  Fix by re-linking:
  ```bash
  cd ~/Music/Tibeb-Nest-Auth
  npm link
  ```
  Or manually create the symlink:
  ```bash
  ln -sf ~/Music/Tibeb-Nest-Auth/dist/index.js /home/$USER/.nvm/versions/node/v24.4.0/bin/tibeb-nest-auth
  chmod +x /home/$USER/.nvm/versions/node/v24.4.0/bin/tibeb-nest-auth
  ```

- **Build errors**:
  Check `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "target": "es2016",
      "module": "commonjs",
      "outDir": "./dist",
      "esModuleInterop": true,
      "forceConsistentCasingInFileNames": true,
      "strict": true,
      "skipLibCheck": true
    },
    "include": ["src/**/*", "src/types/declarations/**/*"],
    "exclude": ["node_modules"]
  }
  ```
  Rebuild:
  ```bash
  npm run clean
  npm run build
  ```

- **Database errors**:
  Verify MySQL is running:
  ```bash
  sudo systemctl status mysql
  ```
  Check credentials in `app.module.ts`.

- **Postman errors**:
  - `404 Not Found`: Ensure the feature (e.g., `forgot-password`) was selected.
  - `400 Bad Request`: Check the request body against `src/auth/dto/register.dto.ts`.
  - `401 Unauthorized`: Use a valid `userToken` in the `Authorization` header.

## Support

For issues, check the CLI output or generated files. Share error messages with your team or on GitHub (if hosted).
