# crispytaytortot.com
CrispyTaytortot's Website and more!

## `Branding` Folder
Assets associated with branding, including color schemes, logos, and other images.

## `crispytaytortot.com` Folder
The code associated with https://crispytaytortot.com.

## `tools.crispytaytortot.com` Folder
The code associated with https://tools.crispytaytortot.com.

## `server` Folder
The backend code associated with all *.crispytaytortot.com sites.

# Assumptions
- The frontend code assumes that if Crispy is live on Twitch he is also live on YouTube.
- The `schedule.sqlite` SQLite database hosted on the server is the source of truth for Crispy's stream schedule. We assume that the IDs of each schedule item stored in the CrispyDB are stable. These schedule items and their IDs are created by [Crispy's Stream Scheduler tool](https://tools.crispytaytortot.com/scheduler/).

# How to Run the Website Locally
## Prerequisites
- [NodeJS v18](https://nodejs.org/en/download/)
    - I'm using NodeJS v18.12.1
- Your favorite code editor
    - I'm using [Visual Studio Code](https://code.visualstudio.com/download)
- [Git](https://git-scm.com/download/)
- A [GitHub](https://github.com) account

## Steps
1. Using Git Shell or Windows Terminal, clone this repository to your local disk with:
    
    ```git clone git@github.com:zfox23/crispytaytortot.com.git```
        
    - You might have to first [connect to GitHub with SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
2. Open Visual Studio Code.
3. Drag the folder containing `crispytaytortot.com` into Visual Studio Code.
4. Open a Terminal within Visual Studio Code.
    - On Windows, the hotkey to do this is `ctrl+shift+tilde`
    - Make sure your VS Code terminal is set to use `Git Bash` via the dropdown to the right of the "+" icon in the bottom right.
5. In the Terminal window, type `cd website` and press Enter.
6. In the Terminal window, type `npm i` and press Enter to install the necessary NPM package prerequisites for this project.
7. In the Terminal window, type `npm run develop` and press Enter.

Now, you should be able to visit [https://localhost:8000](https://localhost:8000) in your favorite Web browser and see the website running locally.

Any changes you make to the site locally will be immediately reflected in the browser; you don't need to refresh the page to see your changes.

# About
The website employs three main technologies:
1. [React](https://reactjs.org/)
2. [Gatsby](https://gatsbyjs.com/)
3. [TailwindCSS](https://tailwindcss.com/)
