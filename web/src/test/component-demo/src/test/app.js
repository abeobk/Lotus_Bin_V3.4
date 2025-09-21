// Main application logic
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Split.js with 3 vertical panels
    const split = Split(['#panel-1', '#panel-2', '#panel-3'], {
        direction: 'vertical',
        sizes: [25, 50, 25], // Initial sizes in percentages
        minSize: [100, 200, 100], // Minimum sizes in pixels
        gutterSize: 10,
        cursor: 'row-resize',
        snapOffset: 30,
        onDragEnd: function(sizes) {
            console.log('Panel sizes after resize:', sizes);
        }
    });

    // Render header in top panel
    const headerContainer = document.getElementById('header');
    headerContainer.innerHTML = HeaderComponent.render('Split Panel Demo');

    // Render multiple cards in main content panel
    const contentContainer = document.getElementById('content');
    const cards = [
        { title: 'First Card', content: 'This card is in the main content panel.', buttonText: 'Learn More' },
        { title: 'Second Card', content: 'This card is also in the main content panel.', buttonText: 'Get Started' },
        { title: 'Third Card', content: 'Another card in the scrollable main area.', buttonText: 'Contact Us' }
    ];

    cards.forEach(cardData => {
        contentContainer.innerHTML += CardComponent.render(cardData);
    });

    // Render footer in bottom panel
    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = FooterComponent.render('© 2025 Split Panel App');

    // Add some utility functions for panels
    window.panelUtils = {
        resetPanels: function() {
            split.setSizes([25, 50, 25]);
        },
        
        focusMainPanel: function() {
            split.setSizes([10, 80, 10]);
        },
        
        equalPanels: function() {
            split.setSizes([33.33, 33.33, 33.33]);
        }
    };

    // Add control buttons to the navigation panel
    const panel1Content = document.querySelector('#panel-1 .panel-content');
    panel1Content.innerHTML += `
        <div class="panel-controls">
            <h3>Panel Controls</h3>
            <button onclick="panelUtils.resetPanels()">Reset Layout</button>
            <button onclick="panelUtils.focusMainPanel()">Focus Main</button>
            <button onclick="panelUtils.equalPanels()">Equal Panels</button>
        </div>
    `;
});