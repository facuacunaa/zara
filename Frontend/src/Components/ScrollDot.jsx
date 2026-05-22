import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const ScrollDot = () => {
    const [visible,   setVisible]   = useState(false)
    const [dragging,  setDragging]  = useState(false)
    const trackRef   = useRef(null)
    const dotRef     = useRef(null)
    const targetRef  = useRef(0)
    const currentRef = useRef(0)
    const rafRef     = useRef(null)
    const timeoutRef = useRef(null)
    const isDragging = useRef(false)

    // ── show dot on scroll ──────────────────────────────────────────────
    useEffect(() => {
        const lerp = (a, b, t) => a + (b - a) * t

        const animate = () => {
            currentRef.current = lerp(currentRef.current, targetRef.current, 0.12)
            if (dotRef.current) {
                dotRef.current.style.top = `${currentRef.current * 100}%`
            }
            rafRef.current = requestAnimationFrame(animate)
        }
        rafRef.current = requestAnimationFrame(animate)

        const onScroll = () => {
            if (isDragging.current) return          // don't fight the drag
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            targetRef.current = docHeight > 0 ? scrollTop / docHeight : 0
            setVisible(scrollTop > 80)
            resetHideTimer()
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            cancelAnimationFrame(rafRef.current)
            clearTimeout(timeoutRef.current)
        }
    }, [])

    const resetHideTimer = () => {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            if (!isDragging.current) setVisible(false)
        }, 1800)
    }

    // ── drag logic ──────────────────────────────────────────────────────
    const getPctFromY = (clientY) => {
        if (!trackRef.current) return 0
        const rect   = trackRef.current.getBoundingClientRect()
        const pct    = (clientY - rect.top) / rect.height
        return Math.min(1, Math.max(0, pct))
    }

    const scrollToPct = (pct) => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        window.scrollTo({ top: pct * docHeight, behavior: 'instant' })
        targetRef.current = pct
    }

    const onMouseDown = (e) => {
        e.preventDefault()
        isDragging.current = true
        setDragging(true)
        setVisible(true)
        clearTimeout(timeoutRef.current)

        const onMove = (ev) => {
            const pct = getPctFromY(ev.clientY)
            scrollToPct(pct)
        }
        const onUp = () => {
            isDragging.current = false
            setDragging(false)
            resetHideTimer()
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
    }

    // touch support
    const onTouchStart = (e) => {
        isDragging.current = true
        setDragging(true)
        setVisible(true)
        clearTimeout(timeoutRef.current)

        const onMove = (ev) => {
            const pct = getPctFromY(ev.touches[0].clientY)
            scrollToPct(pct)
        }
        const onEnd = () => {
            isDragging.current = false
            setDragging(false)
            resetHideTimer()
            window.removeEventListener('touchmove', onMove)
            window.removeEventListener('touchend', onEnd)
        }
        window.addEventListener('touchmove', onMove, { passive: false })
        window.addEventListener('touchend', onEnd)
    }

    // click on track (not dot) → jump to position
    const onTrackClick = (e) => {
        if (e.target === dotRef.current) return
        const pct = getPctFromY(e.clientY)
        scrollToPct(pct)
        setVisible(true)
        resetHideTimer()
    }

    return (
        <Track
            ref={trackRef}
            $visible={visible}
            $dragging={dragging}
            onClick={onTrackClick}
        >
            <Dot
                ref={dotRef}
                $dragging={dragging}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
            />
        </Track>
    )
}

const Track = styled.div`
    position: fixed;
    right: 8px;
    top: 80px;
    bottom: 80px;
    width: 4px;
    background: ${p => p.$dragging ? 'rgba(0,0,0,0.15)' : 'transparent'};
    border-radius: 2px;
    z-index: 9999;
    opacity: ${p => p.$visible ? 1 : 0};
    transition: opacity 0.4s ease, background 0.2s ease;
    pointer-events: ${p => p.$visible ? 'auto' : 'none'};
    cursor: pointer;
`

const Dot = styled.div`
    position: absolute;
    right: -8px;
    width: 20px;
    height: 20px;
    background: #1a1a1a;
    border-radius: 50%;
    transform: translateY(-50%);
    cursor: ${p => p.$dragging ? 'grabbing' : 'grab'};
    transition: transform 0.15s ease, background 0.15s ease;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);

    &:hover {
        transform: translateY(-50%) scale(1.2);
        background: #333;
    }

    &:active {
        transform: translateY(-50%) scale(1.1);
        cursor: grabbing;
    }
`

export default ScrollDot
