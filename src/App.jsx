import { Suspense } from 'react'
import Desktop from './pages/desktop'
import { RotatingSquare } from 'react-loader-spinner'

function App() {

  return (
    <Suspense fallback={<Loading />}>
      <Desktop/>
    </Suspense>
  )
}

function Loading() {
  return (
    <div className="spinner" style={{ backgroundColor: '#ffffff', display: isLoading ? "flex" : "none" }}>
      <RotatingSquare
        visible={true}
        height="100"
        width="100"
        color="#f94949"
        ariaLabel="rotating-square-loading"
        wrapperStyle={{}}
        wrapperClass=""
        />
    </div>
  )
}

export default App
