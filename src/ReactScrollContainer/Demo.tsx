import { FC, useState } from "react"
import ListItem from "../components/ListItem"

const Demo: FC = () => {
  const [data, setData] = useState(
    Array(13)
      .fill(0)
      .map((_, index) => index),
  )

  return (
    <>
      {data.map((item) => (
        <ListItem index={item} key={item} />
      ))}
    </>
  )
}

export default Demo
