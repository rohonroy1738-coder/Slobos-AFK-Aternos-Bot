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

        jumpTimer = null
        jumpOffTimer = null
    }

    function scheduleNextJump() {
        if (stopped || !bot.entity) return

        try {
            bot.setControlState('jump', true)

            jumpOffTimer = setTimeout(() => {
                try {
                    bot.setControlState('jump', false)
                } catch (e) {}
            }, 300)
        } catch (e) {}

        const nextJump = randomMs(30000, 240000)
        jumpTimer = setTimeout(scheduleNextJump, nextJump)
    }

    bot.once('spawn', () => {
        stopped = false

        console.log('[AFK] Bot joined server')
        scheduleNextJump()
    })

    bot.on('end', () => {
        console.log('[AFK] Bot disconnected')
        cleanup()
    })

    bot.on('kicked', (reason) => {
        console.log('[AFK] Bot was kicked:', reason)
        cleanup()
    })

    bot.on('error', (err) => {
        console.log('[AFK] Bot error:', err)
    })
}

module.exports = setupLeaveRejoin
