import { Suspense, useEffect, useState } from 'react'
import Desktop from './pages/desktop'
import { RotatingSquare } from 'react-loader-spinner'

function App() {

  const [hiddenImageUrl, setHiddenImageUrl] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hiddenImageUrlParam = urlParams.get('hidden_image_url');
    setHiddenImageUrl(hiddenImageUrlParam);
    console.log(hiddenImageUrlParam)
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <Desktop hiddenImageUrl={hiddenImageUrl}/>
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
