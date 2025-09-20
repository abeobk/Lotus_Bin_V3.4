/**
 * Counter Component - A reusable Vue.js counter component
 * 
 * This component provides increment, decrement, and reset functionality
 * with customizable styling and optional limits.
 */

// Counter Component Definition
const CounterComponent = {
    name: 'CounterComponent',
    
    template: `
        <div class="counter-component" :class="componentClass">
            <div class="counter-header" v-if="showTitle">
                <h3 class="counter-title">
                    <i :class="iconClass" v-if="iconClass"></i>
                    {{ title }}
                </h3>
                <p class="counter-description" v-if="description">{{ description }}</p>
            </div>
            
            <div class="counter-display">
                <span class="counter-value" :class="valueClass">{{ formattedValue }}</span>
                <span class="counter-suffix" v-if="suffix">{{ suffix }}</span>
            </div>
            
            <div class="counter-controls">
                <button 
                    class="counter-btn counter-btn-decrease"
                    :class="{ 'disabled': isAtMin }"
                    @click="decrease"
                    :disabled="isAtMin"
                    :title="decreaseTooltip"
                >
                    <i class="fas fa-minus"></i>
                    {{ decreaseLabel }}
                </button>
                
                <button 
                    class="counter-btn counter-btn-reset"
                    @click="resetCounter"
                    :disabled="isAtInitial"
                    :title="resetTooltip"
                >
                    <i class="fas fa-redo"></i>
                    {{ resetLabel }}
                </button>
                
                <button 
                    class="counter-btn counter-btn-increase"
                    :class="{ 'disabled': isAtMax }"
                    @click="increase"
                    :disabled="isAtMax"
                    :title="increaseTooltip"
                >
                    <i class="fas fa-plus"></i>
                    {{ increaseLabel }}
                </button>
            </div>
            
            <div class="counter-info" v-if="showInfo">
                <div class="info-item" v-if="minValue !== null">
                    <span class="info-label">Min:</span>
                    <span class="info-value">{{ minValue }}</span>
                </div>
                <div class="info-item" v-if="maxValue !== null">
                    <span class="info-label">Max:</span>
                    <span class="info-value">{{ maxValue }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Step:</span>
                    <span class="info-value">{{ step }}</span>
                </div>
            </div>
            
            <div class="counter-progress" v-if="showProgress && maxValue !== null">
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
                </div>
                <span class="progress-text">{{ progressPercentage.toFixed(1) }}%</span>
            </div>
        </div>
    `,
    
    props: {
        // Initial value of the counter
        initialValue: {
            type: Number,
            default: 0
        },
        
        // Minimum value (null for no limit)
        minValue: {
            type: Number,
            default: null
        },
        
        // Maximum value (null for no limit)
        maxValue: {
            type: Number,
            default: null
        },
        
        // Step size for increment/decrement
        step: {
            type: Number,
            default: 1
        },
        
        // Component title
        title: {
            type: String,
            default: 'Counter'
        },
        
        // Component description
        description: {
            type: String,
            default: ''
        },
        
        // Icon class for the title
        iconClass: {
            type: String,
            default: 'fas fa-calculator'
        },
        
        // Suffix to display after the value (e.g., "%", "px", "$")
        suffix: {
            type: String,
            default: ''
        },
        
        // Custom CSS class for the component
        componentClass: {
            type: String,
            default: ''
        },
        
        // Labels for buttons
        increaseLabel: {
            type: String,
            default: 'Increase'
        },
        
        decreaseLabel: {
            type: String,
            default: 'Decrease'
        },
        
        resetLabel: {
            type: String,
            default: 'Reset'
        },
        
        // Show/hide various parts
        showTitle: {
            type: Boolean,
            default: true
        },
        
        showInfo: {
            type: Boolean,
            default: false
        },
        
        showProgress: {
            type: Boolean,
            default: false
        },
        
        // Number formatting
        decimalPlaces: {
            type: Number,
            default: 0
        },
        
        // Animation duration in ms
        animationDuration: {
            type: Number,
            default: 300
        }
    },
    
    emits: ['update:modelValue', 'change', 'increment', 'decrement', 'reset', 'limit-reached'],
    
    data() {
        return {
            currentValue: this.initialValue,
            isAnimating: false
        };
    },
    
    computed: {
        formattedValue() {
            if (this.decimalPlaces > 0) {
                return this.currentValue.toFixed(this.decimalPlaces);
            }
            return this.currentValue.toString();
        },
        
        isAtMin() {
            return this.minValue !== null && this.currentValue <= this.minValue;
        },
        
        isAtMax() {
            return this.maxValue !== null && this.currentValue >= this.maxValue;
        },
        
        isAtInitial() {
            return this.currentValue === this.initialValue;
        },
        
        valueClass() {
            return {
                'value-at-min': this.isAtMin,
                'value-at-max': this.isAtMax,
                'value-normal': !this.isAtMin && !this.isAtMax,
                'animating': this.isAnimating
            };
        },
        
        progressPercentage() {
            if (this.maxValue === null || this.minValue === null) {
                return (this.currentValue / (this.maxValue || 100)) * 100;
            }
            const range = this.maxValue - this.minValue;
            const current = this.currentValue - this.minValue;
            return (current / range) * 100;
        },
        
        increaseTooltip() {
            if (this.isAtMax) return 'Maximum value reached';
            return `Increase by ${this.step}`;
        },
        
        decreaseTooltip() {
            if (this.isAtMin) return 'Minimum value reached';
            return `Decrease by ${this.step}`;
        },
        
        resetTooltip() {
            return `Reset to ${this.initialValue}`;
        }
    },
    
    methods: {
        increase() {
            if (!this.isAtMax) {
                const newValue = this.currentValue + this.step;
                this.setValue(Math.min(newValue, this.maxValue !== null ? this.maxValue : newValue));
                this.$emit('increment', this.currentValue);
                
                if (this.isAtMax) {
                    this.$emit('limit-reached', { type: 'max', value: this.currentValue });
                }
            }
        },
        
        decrease() {
            if (!this.isAtMin) {
                const newValue = this.currentValue - this.step;
                this.setValue(Math.max(newValue, this.minValue !== null ? this.minValue : newValue));
                this.$emit('decrement', this.currentValue);
                
                if (this.isAtMin) {
                    this.$emit('limit-reached', { type: 'min', value: this.currentValue });
                }
            }
        },
        
        resetCounter() {
            this.setValue(this.initialValue);
            this.$emit('reset', this.currentValue);
        },
        
        setValue(value) {
            const oldValue = this.currentValue;
            this.currentValue = value;
            this.$emit('update:modelValue', value);
            this.$emit('change', { oldValue, newValue: value });
            
            // Add animation effect
            this.animateValue();
        },
        
        animateValue() {
            this.isAnimating = true;
            setTimeout(() => {
                this.isAnimating = false;
            }, this.animationDuration);
        },
        
        // Public method to set value programmatically
        setValueProgrammatically(value) {
            if (this.minValue !== null && value < this.minValue) {
                value = this.minValue;
            }
            if (this.maxValue !== null && value > this.maxValue) {
                value = this.maxValue;
            }
            this.setValue(value);
        }
    },
    
    watch: {
        initialValue: {
            handler(newValue) {
                this.currentValue = newValue;
            },
            immediate: true
        }
    },
    
    mounted() {
        console.log('Counter component mounted with initial value:', this.initialValue);
    }
};

// CSS Styles for the counter component
const counterComponentStyles = `
<style>
.counter-component {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    max-width: 400px;
    margin: 0 auto;
}

.counter-component:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.counter-header {
    text-align: center;
    margin-bottom: 20px;
}

.counter-title {
    margin: 0 0 8px 0;
    color: #2d3748;
    font-size: 1.5em;
    font-weight: 600;
}

.counter-title i {
    margin-right: 8px;
    color: #667eea;
}

.counter-description {
    margin: 0;
    color: #718096;
    font-size: 0.9em;
}

.counter-display {
    text-align: center;
    margin: 30px 0;
    position: relative;
}

.counter-value {
    font-size: 3em;
    font-weight: bold;
    color: #667eea;
    display: inline-block;
    min-width: 120px;
    transition: all 0.3s ease;
    position: relative;
}

.counter-value.value-at-min {
    color: #e53e3e;
}

.counter-value.value-at-max {
    color: #38a169;
}

.counter-value.animating {
    transform: scale(1.1);
    text-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

.counter-suffix {
    font-size: 1.5em;
    color: #718096;
    margin-left: 5px;
}

.counter-controls {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin: 24px 0;
}

.counter-btn {
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 100px;
    justify-content: center;
}

.counter-btn i {
    font-size: 12px;
}

.counter-btn-increase {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.counter-btn-increase:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.counter-btn-decrease {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
}

.counter-btn-decrease:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4);
}

.counter-btn-reset {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
}

.counter-btn-reset:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}

.counter-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
}

.counter-info {
    display: flex;
    justify-content: space-around;
    padding: 16px;
    background: #f7fafc;
    border-radius: 8px;
    margin-top: 20px;
}

.info-item {
    text-align: center;
}

.info-label {
    display: block;
    font-size: 0.8em;
    color: #718096;
    margin-bottom: 4px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-value {
    font-weight: bold;
    color: #2d3748;
    font-size: 1.1em;
}

.counter-progress {
    margin-top: 20px;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s ease;
    border-radius: 4px;
}

.progress-text {
    display: block;
    text-align: center;
    margin-top: 8px;
    font-size: 0.9em;
    color: #718096;
    font-weight: 600;
}

/* Responsive design */
@media (max-width: 480px) {
    .counter-component {
        padding: 16px;
        margin: 0 16px;
    }
    
    .counter-value {
        font-size: 2.5em;
    }
    
    .counter-controls {
        flex-direction: column;
    }
    
    .counter-btn {
        min-width: 100%;
    }
    
    .counter-info {
        flex-direction: column;
        gap: 12px;
    }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
    .counter-component {
        background: #2d3748;
        border-color: #4a5568;
        color: #e2e8f0;
    }
    
    .counter-title {
        color: #e2e8f0;
    }
    
    .counter-info {
        background: #4a5568;
    }
    
    .info-value {
        color: #e2e8f0;
    }
    
    .progress-bar {
        background: #4a5568;
    }
}
</style>
`;

// Export the component for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CounterComponent;
} else if (typeof window !== 'undefined') {
    window.CounterComponent = CounterComponent;
}

// Add styles to document if in browser environment
if (typeof document !== 'undefined') {
    document.head.insertAdjacentHTML('beforeend', counterComponentStyles);
}