# Running Locally with Vercel

To test the trip planner's interactive features (including the backend AI routes) on your computer, follow these steps:

### 1. Install Dependencies
Ensure you have all the necessary packages installed:
```bash
npm install
```

### 2. Run with Vercel CLI
Since you want to run it like it will be on Vercel, use the following command:
```bash
npx vercel dev
```
> [!NOTE]
> If it's your first time, it might ask you to login to Vercel and "Link" the project. You can just follow the prompts (usually just pressing Enter for defaults).

### 3. Environment Variables
Your `.env` file is already set up with the required keys:
- `GEMINI_API_KEY`
- `WEATHER_API_KEY`

Vercel will automatically pick these up when you run `npx vercel dev`.

### 4. Access the App
Once the command is running, you can access the app at:
`http://localhost:3000`
