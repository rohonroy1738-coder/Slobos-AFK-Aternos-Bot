function randomMs(minMs, maxMs) {
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
}

function setupLeaveRejoin(bot) {
    let jumpTimer = null
    let jumpOffTimer = null
    let stopped = false
    let lastLogAt = 0

    function logThrottled(msg, minGapMs = 2000) {
        const now = Date.now()
        if (now - lastLogAt >= minGapMs) {
            lastLogAt = now
            console.log(msg)
        }
    }

    function cleanup() {
        stopped = true
        if (jumpTimer) clearTimeout(jumpTimer)
        if (jumpOffTimer) clearTimeout(jumpOffTimer)
        jumpTimer = jumpOffTimer = null
    }

    function scheduleNextJump() {
        if (stopped || !bot.entity) return

        bot.setControlState('jump', true)
        jumpOffTimer = setTimeout(() => bot.setControlState('jump', false), 300)

        const nextJump = randomMs(30000, 240000) // 30s to 4min
        jumpTimer = setTimeout(scheduleNextJump, nextJump)
    }

    bot.once('spawn', () => {
        cleanup()
        stopped = false
        logThrottled(`[AFK] Slobot00 is now staying PERMANENTLY - No leaving`)
        scheduleNextJump()
    })

    bot.on('end', () => {
        logThrottled(`[AFK] Bot disconnected (reason: end)`)
        cleanup()
    })

    bot.on('kicked', (reason) => {
        logThrottled(`[AFK] Bot was kicked: ${reason}`)
        cleanup()
    })

    bot.on('error', (err) => {
        logThrottled(`[AFK] Bot error: ${err.message || err}`)
        cleanup()
    })
}

module.exports = setupLeaveRejoin
