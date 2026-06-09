function randomMs(minMs, maxMs) {
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
}

function setupLeaveRejoin(bot) {
    let jumpTimer = null
    let jumpOffTimer = null
    let leaveTimer = null
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
        if (leaveTimer) clearTimeout(leaveTimer)
        jumpTimer = jumpOffTimer = leaveTimer = null
    }

    function scheduleLeave() {
        if (stopped || !bot.entity) return

        const stayTime = randomMs(30 * 60 * 1000, 60 * 60 * 1000) // 30min - 1hr
        logThrottled(`[AFK] Slobot00 will leave in ~${Math.floor(stayTime/60000)} minutes`)

        leaveTimer = setTimeout(() => {
            if (stopped || !bot.entity) return
            logThrottled(`[AFK] Slobot00 leaving after session (30-60min)`)
            try {
                bot.quit() // or bot.end()
            } catch (e) {}
        }, stayTime)
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
        logThrottled(`[AFK] Slobot00 joined - will AFK for 30-60min then leave`)
        scheduleNextJump()
        scheduleLeave()  // <-- Added: auto-leave timer
    })

    bot.on('end', () => {
        logThrottled(`[AFK] Bot disconnected`)
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
