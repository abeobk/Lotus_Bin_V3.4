const FooterComponent = {
    render: function(text = '© 2025 My App. All rights reserved.') {
        return `
            <footer class="footer">
                <p>${text}</p>
            </footer>
        `;
    }
};