const HeaderComponent = {
    render: function(title = 'My App') {
        return `
            <header class="header">
                <h1>${title}</h1>
                <nav>
                    <a href="#" style="color: white; margin: 0 10px;">Home</a>
                    <a href="#" style="color: white; margin: 0 10px;">About</a>
                    <a href="#" style="color: white; margin: 0 10px;">Contact</a>
                </nav>
            </header>
        `;
    }
};