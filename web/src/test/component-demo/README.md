# Component Demo

This project demonstrates a simple implementation of the component concept using HTML, CSS, and JavaScript. Each component is encapsulated in its own JavaScript file and exposes a `render` function that returns HTML code. The components are then injected into the main HTML file.

## Project Structure

```
component-demo
├── src
│   └── test
│       ├── components
│       │   ├── header.js
│       │   ├── footer.js
│       │   └── card.js
│       ├── styles
│       │   └── main.css
│       ├── index.html
│       └── app.js
└── README.md
```

## Components

- **Header**: A component that displays a title and navigation links.
- **Footer**: A component that shows copyright information and additional links.
- **Card**: A component that presents an image, title, and description.

## Setup and Running the Project

1. Clone the repository or download the project files.
2. Open the `index.html` file in a web browser to view the components in action.
3. Ensure that the CSS styles are applied correctly to enhance the visual appeal of the components.

## How It Works

- Each component is defined in its own JavaScript file within the `components` directory.
- The `render` function in each component returns a string of HTML that represents the component.
- The `app.js` file imports these render functions and injects the generated HTML into the main HTML file, allowing for a modular and reusable component structure.

This project serves as a basic example of how to structure a web application using components, promoting code reusability and separation of concerns.