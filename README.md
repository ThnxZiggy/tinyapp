# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

*This project could not be complete without the help of numerous LHL mentors. Thank you all for the wisdom you shared 🙏🏻*

## Final Product

!["screenshot of Login page"](https://github.com/ThnxZiggy/tinyapp/blob/main/docs/Login%20Page.png)
!["screenshot the URL index page"](https://github.com/ThnxZiggy/tinyapp/blob/main/docs/URL%20Index%20Page.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session


## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Considerations

- This is my first application being sumbitted with rougly 4 weeks of exposure to programming. It has been created to satisfy all major rubric requirements but it is my intention to revisit and update with additional functionality such as:
    - unique visitor count
    - last visit
    - updated urls index page to quickly copy/paste the shortened URL redirect
    - being hosted on a domain with userdata being stored on a server.

- This app will not let you access your URL index unless you are logged in and will redirect you to the login page.
- This app runs on your system memory. Once the terminal session is closed, you will lose all your data.
- There may be minor bugs but the core functionality remains intact. I intend to update as I encounter them.
