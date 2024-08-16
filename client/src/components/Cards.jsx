import { useEffect } from 'react'
import { Row } from 'react-bootstrap'
import { ThreeDots } from 'react-loader-spinner'
import { useDispatch, useSelector } from 'react-redux'
import { getAds, reset } from '../redux/ads/adsSlice'
import { InnerCard } from './InnerCard'

const Cards = () => {
  // Fetching the ads, loading state, and filtered ads from Redux
  const { ads, isLoading, filteredAds, isError, message } = useSelector(
    (state) => state.ads
  )
  const dispatch = useDispatch()

  // Fetch ads when the component mounts
  useEffect(() => {
    dispatch(getAds())
    return () => {
      // Clean up by resetting the state when the component unmounts
      dispatch(reset())
    }
  }, [dispatch])

  // Log the ads and filteredAds for debugging purposes
  useEffect(() => {
    console.log('Fetched ads data:', ads)
    console.log('Filtered ads data:', filteredAds)
  }, [ads, filteredAds])

  // Handle loading, error, and empty state
  if (isLoading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ThreeDots color="#3a77ff" height={100} width={100} />
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        <h1>Error: {message}</h1>
      </div>
    )
  }

  return (
    <div className="AdCard">
      <Row className="g-3">
        {filteredAds?.data?.length > 0 ? (
          filteredAds?.data?.map((ad,i) => (
            <InnerCard key={i} ad={ad} />
          ))
        ) : (
          <div style={{ height: '35vh' }}>
            <h1>You have no ads to show</h1>
          </div>
        )}
      </Row>
    </div>
  )
}

export default Cards
