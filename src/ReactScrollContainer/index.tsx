import React, {
  FC,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react"
import "./index.css"
import { useDragMove } from "./use-darg-move"

const diffToOffset = (start: number, diff: number, radio: number) => {
  const scrollLength = diff / radio + start
  const offset = Math.max(scrollLength * radio, 0) / radio
  return offset
}

export interface IReactScrollContainerProps {
  // 滚动条最小尺寸
  minBarSize?: number
}
const ReactScrollContainer: FC<
  PropsWithChildren<IReactScrollContainerProps>
> = ({ children, minBarSize = 20 }) => {
  const [containerData, setContainerData] = useState({
    clientHeight: 0,
    scrollHeight: 0,
    clientWidth: 0,
    scrollWidth: 0,
  })
  const xVisible = containerData.scrollWidth > containerData.clientWidth
  const yVisible = containerData.scrollHeight > containerData.clientHeight
  const scrollRef = useRef<HTMLDivElement>(null)
  const yRadioRef = useRef(1)
  const yHeightRef = useRef(0)
  const xRadioRef = useRef(1)
  const xWidthRef = useRef(0)

  const setY = (scrollTop: number) => {
    if (!yRef.current) {
      return
    }
    const yTop = scrollTop * yRadioRef.current
    yRef.current.style.top = `${yTop}px`
    yRef.current.style.height = `${yHeightRef.current}px`
  }
  const setX = (scrollLeft: number) => {
    if (!xRef.current) {
      return
    }
    const xLeft = scrollLeft * xRadioRef.current
    xRef.current.style.left = `${xLeft}px`
    xRef.current.style.width = `${xWidthRef.current}px`
  }

  const onScroll: React.UIEventHandler = (e) => {
    const { scrollTop, scrollLeft } = e.currentTarget
    setY(scrollTop)
    setX(scrollLeft)
  }

  const scrollLeftRef = useRef(0)
  const { ref: xRef, onDragMove: onXDragMove } = useDragMove({
    onStart() {
      if (!scrollRef.current) {
        return
      }
      scrollLeftRef.current = scrollRef.current.scrollLeft
    },
    onMove({ startX, clientX }) {
      if (!scrollRef.current) {
        return
      }
      const offset = diffToOffset(
        scrollLeftRef.current,
        clientX - startX,
        xRadioRef.current,
      )
      scrollRef.current.scrollLeft = offset
    },
  })
  const scrollTopRef = useRef(0)
  const { ref: yRef, onDragMove: onYDragMove } = useDragMove({
    onStart() {
      if (!scrollRef.current) {
        return
      }
      scrollTopRef.current = scrollRef.current.scrollTop
    },
    onMove({ startY, clientY }) {
      if (!scrollRef.current) {
        return
      }
      const offset = diffToOffset(
        scrollTopRef.current,
        clientY - startY,
        yRadioRef.current,
      )
      scrollRef.current.scrollTop = offset
    },
  })

  const watchScrollHeight = () => {
    if (!scrollRef.current) {
      return
    }

    const { scrollHeight, clientHeight, scrollWidth, clientWidth } =
      scrollRef.current
    setContainerData((data) => ({
      ...data,
      clientHeight,
      scrollHeight,
      scrollWidth,
      clientWidth,
    }))
  }

  const isAutoUpScrollingRef = useRef(false)
  const isAutoDownScrollingRef = useRef(false)
  const animateUpTimerRef = useRef(0)
  const animateDownTimerRef = useRef(0)
  const stopAutoScroll = () => {
    if (isAutoUpScrollingRef.current) {
      isAutoUpScrollingRef.current = false
      cancelAnimationFrame(animateUpTimerRef.current)
    }
    if (isAutoDownScrollingRef.current) {
      isAutoDownScrollingRef.current = false
      cancelAnimationFrame(animateDownTimerRef.current)
    }
  }
  const onMouseOver: React.MouseEventHandler = (e) => {
    if (!scrollRef.current) {
      return
    }
    const { clientY } = e
    const { clientHeight } = scrollRef.current
    const halfClientHeight = clientHeight * 0.25
    const { y } = scrollRef.current.getBoundingClientRect()
    const diff = Math.abs(clientY - y - clientHeight)
    const getSpeed = (diff: number) => {
      const s = Math.min(((halfClientHeight - diff) / halfClientHeight) * 5, 1)
      return s
    }
    if (diff < halfClientHeight) {
      if (isAutoDownScrollingRef.current) {
        return
      }
      // 往下
      const speed = getSpeed(diff)
      if (isAutoUpScrollingRef.current) {
        isAutoUpScrollingRef.current = false
        cancelAnimationFrame(animateUpTimerRef.current)
      }
      isAutoDownScrollingRef.current = true

      function animate() {
        if (!scrollRef.current) {
          return
        }
        scrollRef.current.scrollTop += speed
        animateDownTimerRef.current = requestAnimationFrame(animate)
      }
      animate()
      return
    }
    if (clientY - y < halfClientHeight) {
      if (isAutoUpScrollingRef.current) {
        return
      }
      // 往上
      const speed = getSpeed(clientY - y)
      if (isAutoDownScrollingRef.current) {
        isAutoDownScrollingRef.current = false
        cancelAnimationFrame(animateDownTimerRef.current)
      }
      isAutoUpScrollingRef.current = true
      function animate() {
        if (!scrollRef.current) {
          return
        }
        scrollRef.current.scrollTop -= speed
        animateUpTimerRef.current = requestAnimationFrame(animate)
      }
      animate()
      return
    }
    stopAutoScroll()
  }

  const onMouseLeave = () => {
    stopAutoScroll()
  }

  useEffect(() => {
    if (!scrollRef.current) {
      return
    }
    const observer = new MutationObserver(() => {
      watchScrollHeight()
    })
    observer.observe(scrollRef.current, {
      childList: true,
      attributes: true,
      subtree: true,
    })
    watchScrollHeight()
    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!scrollRef.current) {
      return
    }
    const overScrollHeight =
      containerData.scrollHeight - containerData.clientHeight
    const yHeight = Math.max(
      containerData.clientHeight - overScrollHeight,
      minBarSize,
    )
    const yRatio = (containerData.clientHeight - yHeight) / overScrollHeight
    yHeightRef.current = yHeight
    yRadioRef.current = yRatio
    const { scrollTop } = scrollRef.current
    setY(scrollTop)
  }, [containerData.clientHeight, containerData.scrollHeight, minBarSize])

  useEffect(() => {
    if (!scrollRef.current) {
      return
    }
    const overScrollWidth =
      containerData.scrollWidth - containerData.clientWidth
    const xWidth = Math.max(
      containerData.clientWidth - overScrollWidth,
      minBarSize,
    )
    const xRadio = (containerData.clientWidth - xWidth) / overScrollWidth
    xWidthRef.current = xWidth
    xRadioRef.current = xRadio
    const { scrollLeft } = scrollRef.current
    setX(scrollLeft)
  }, [containerData.clientWidth, containerData.scrollWidth, minBarSize])

  return (
    <div className="container">
      <div
        className="scroll"
        ref={scrollRef}
        onScroll={onScroll}
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </div>
      {yVisible && (
        <div className="y">
          <div
            ref={yRef}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={onYDragMove}
            className="y-bar"
          ></div>
        </div>
      )}
      {xVisible && (
        <div className="x">
          <div
            ref={xRef}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={onXDragMove}
            className="x-bar"
          ></div>
        </div>
      )}
    </div>
  )
}

export default ReactScrollContainer
