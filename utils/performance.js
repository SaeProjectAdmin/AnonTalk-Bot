const os = require('os');

class PerformanceMonitor {
    constructor() {
        this.startTime = Date.now();
        this.requestCount = 0;
        this.errorCount = 0;
        this.responseTimes = [];
    }

    // Track request performance
    trackRequest(req, res, next) {
        const start = Date.now();
        this.requestCount++;

        res.on('finish', () => {
            const duration = Date.now() - start;
            this.responseTimes.push(duration);

            // Keep only last 1000 response times
            if (this.responseTimes.length > 1000) {
                this.responseTimes.shift();
            }

            if (res.statusCode >= 400) {
                this.errorCount++;
            }
        });

        next();
    }

    // Get performance metrics
    getMetrics() {
        const uptime = Date.now() - this.startTime;
        const avgResponseTime = this.responseTimes.length > 0 
            ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
            : 0;
        
        const maxResponseTime = Math.max(...this.responseTimes, 0);
        const minResponseTime = Math.min(...this.responseTimes, 0);
        
        const errorRate = this.requestCount > 0 
            ? (this.errorCount / this.requestCount) * 100 
            : 0;

        return {
            uptime: Math.floor(uptime / 1000), // seconds
            requestCount: this.requestCount,
            errorCount: this.errorCount,
            errorRate: errorRate.toFixed(2) + '%',
            avgResponseTime: Math.round(avgResponseTime) + 'ms',
            maxResponseTime: maxResponseTime + 'ms',
            minResponseTime: minResponseTime + 'ms',
            memoryUsage: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
                external: Math.round(process.memoryUsage().external / 1024 / 1024) + 'MB'
            },
            cpuUsage: {
                loadAverage: os.loadavg(),
                cpus: os.cpus().length
            }
        };
    }

    // Reset metrics
    reset() {
        this.startTime = Date.now();
        this.requestCount = 0;
        this.errorCount = 0;
        this.responseTimes = [];
    }
}

module.exports = new PerformanceMonitor(); 