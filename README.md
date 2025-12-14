<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ehwhk2k6OIzhEzvUzLef_ZnclidUXada

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
4. Run build, a folder dist will be create by Vite
   `npm run build`

## Using Firebase
1. authorize the firebase CLI
firebase login
2. init the current working directory as a firebase project
firebase init
3. associate app with firebase project
firebase use —add
4. run app locally with firebase hosting emulator
firebase emulators:start —only hosting
Firebase emulators:start

## Port
1. check if the specific port is being used
lsof -i :5000
2. kill the process to free the port
kill -9 PID