import {
  FC,
  PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import "./index.css"

const ReactScrollContainer: FC<PropsWithChildren> = ({ children }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollData, setScrollData] = useState({
    scrollHeight: 1,
    clientHeight: 0,
    scrollWidth: 1,
    clientWidth: 0,
  })
  const [scroll, setScroll] = useState({
    scrollTop: 0,
    scrollLeft: 0,
  })
  const [y, setY] = useState(0)

  const xVisible = scrollData.scrollWidth > scrollData.clientWidth
  const yVisible = scrollData.scrollHeight > scrollData.clientHeight
  const xWidth =
    (scrollData.clientWidth / scrollData.scrollWidth) * scrollData.clientWidth
  const minYHeight = 20
  const yHeight = Math.max(
    scrollData.clientHeight * 2 - scrollData.scrollHeight,
    minYHeight,
  )
  const yRadio =
    (scrollData.clientHeight - yHeight) /
    (scrollData.scrollHeight - scrollData.clientHeight)

  console.log("yRadio", yRadio)
  // scroll的内容在变化的

  const onScroll: React.UIEventHandler = (e) => {
    const { scrollTop, scrollLeft } = e.currentTarget
    setScroll({
      scrollTop,
      scrollLeft,
    })
  }

  useEffect(() => {
    console.log("useEffect", scroll.scrollTop, yRadio)
    setY(scroll.scrollTop * yRadio)
  }, [scroll.scrollTop, yRadio])

  const contentEffect = (type: string) => {
    if (!scrollRef.current) {
      return
    }

    const { clientHeight, clientWidth, scrollWidth, scrollHeight } =
      scrollRef.current

    console.log(type, clientHeight, scrollHeight)

    setScrollData({
      clientHeight,
      clientWidth,
      scrollWidth,
      scrollHeight,
    })
  }

  useEffect(() => {
    contentEffect("effect")
  }, [])

  useEffect(() => {
    if (!scrollRef.current) {
      return
    }
    // 创建一个新的 MutationObserver 实例
    const observer = new MutationObserver(function () {
      if (!scrollRef.current) {
        return
      }
      contentEffect("observer")
    })

    // 配置观察器
    const config = { attributes: true, childList: true, subtree: true }

    // 开始观察
    observer.observe(scrollRef.current, config)
  })

  // useLayoutEffect(() => {
  //   contentEffect("layoutEffect")
  // }, [])

  return (
    <div className="container">
      <div className="scroll" ref={scrollRef} onScroll={onScroll}>
        {children}
      </div>
      {xVisible && (
        <div className="x">
          <div className="x-bar"></div>
        </div>
      )}
      {yVisible && (
        <div className="y">
          <div className="y-bar" style={{ height: yHeight, top: y }}></div>
        </div>
      )}
    </div>
  )
}

export default ReactScrollContainer
