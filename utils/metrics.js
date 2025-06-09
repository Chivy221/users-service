let requestCount = 0;

function increment() {
requestCount++;
}

function getMetrics() {
return `# HELP request_count Total number of requests\n# TYPE request_count counter\nrequest_count ${requestCount}`;}

module.exports = { increment, getMetrics };
