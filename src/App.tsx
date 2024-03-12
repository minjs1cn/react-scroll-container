import ReactScrollContainer from "./ReactScrollContainer"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import Demo from "./ReactScrollContainer/Demo"

function App() {
  return (
    <div>
      <h1>滚动容器</h1>
      <div style={{ padding: 30, height: 300, width: 400 }}>
        <ReactScrollContainer>
          <DndProvider backend={HTML5Backend}>
            <Demo />
          </DndProvider>
        </ReactScrollContainer>
      </div>
    </div>
  )
}

export default App
