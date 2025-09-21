const CardComponent = {
    render: function(data = {}) {
        const { title = 'Card Title', content = 'Card content goes here.', buttonText = 'Click me' } = data;
        
        return `
            <div class="card">
                <h3>${title}</h3>
                <p>${content}</p>
                <button onclick="alert('Button clicked!')" style="margin-top: 10px; padding: 8px 16px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    ${buttonText}
                </button>
            </div>
        `;
    }
};