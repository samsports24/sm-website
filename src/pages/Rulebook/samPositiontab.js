import { Button } from 'antd'
import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import sammetricbreakdown from '../../assets/thesammetric.webp'
import { useDispatch, useSelector } from 'react-redux'
import { getSamMetric } from '../../redux'
import updownarrow from '../../assets/updownarrow.png'
import uparrow from '../../assets/uparrow.png'

const SamPositiontab = () => {
  const navigate = useNavigate()

  const location = useLocation()
  console.log('location', location.state.playerName)
  const dispatch = useDispatch()
  const { allSamMetric } = useSelector((state) => state?.league)
  const { playerPosition,playerColor } = location.state

  // console.log('DumyPositionsData',DumyPositionsData);
  // console.log('allSamMetric', allSamMetric)

  // console.log('allSamMetric?.sammetric',allSamMetric?.sammetric);
  const filteredMetrics = allSamMetric?.sammetric?.filter(
    (metric) => metric?.Position === playerPosition,
  )

  // console.log('Filtered Metrics:', filteredMetrics)

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getSamMetric())
    }
    fetchData()
  }, [dispatch])
  const labelsToDisplay = [
    'Passing Yards (For every 1 Passing Yard)',
    'Passing Touchdown',
    'Passing 2-Pointer',
    'Passing Attempts',
    'Passing Completions',
    'Interception Thrown',
    'Incompletions',
    'Sacked',
  ]

  const filteredMetricsWithMatchingStats = filteredMetrics?.map((metric) => ({
    sammetricstats: metric.sammetricstats
      // ?.filter((stat) => labelsToDisplay?.includes(stat.label))
      ?.map((stat) => ({
        ...stat,
        label: `"${stat.label}"`,
        matchingvalue: `"${stat.matchingvalue}"`,
      })),
  }))

  console.log('filteredMetricsWithMatchingStats', filteredMetricsWithMatchingStats)

  return (
    <div className='Sammetricposition'>
      <div className='headersection'>
        <div className='headersectionBg' />
        <div className='headersectiontext'>
          <div className='samimg'>
            <img src={sammetricbreakdown}></img>
          </div>
          <h2>
            {location?.state?.playerName}
            <span>BREAKDOWN</span>
          </h2>

          <Button onClick={() => navigate('/rule-book/sammetric')}>Back</Button>
        </div>
      </div>

      <hr style={{ marginTop: '0px' }} className='horizontal-line'></hr>
      <>
        {filteredMetrics?.map((metric, index) => (
          <div key={index} className='sambgback'>
            <div className='samposmain'>
              <div className='samposdesp'>
                <p>
                  {location.state.playerName} <br />
                  <span  style={{
                      color: playerColor,
                    }}>{location.state.playerPosition}</span>
                </p>
                <p>
                  Franchise Tag #
                  <br />
                  <span  style={{
                      color: playerColor,
                    }} className='franchise'> ${metric?.FranchiseTagCost?.toLocaleString()}</span>
                </p>

                <p>
                  METRIC %
                  <br />
                  <span  style={{
                      color: playerColor,
                    }} className='franchise'>{metric?.Percentage}%</span>
                </p>
              </div>
            </div>

            <div className='scoringcolumn'>
              <p>SCORING TOPIC</p>
              <p>FULL SCALE</p>
              <p>METRIC %</p>
              <p>PAST YEAR</p>
              <p>
                <img width={25} src={updownarrow}></img>
              </p>
              <p>CURRENT YEAR</p>
            </div>

            <div className='new-horizontal-line'></div>

            <div className='positiondetails'>
              <p>{location.state.playerName} Passing</p>

              <>
                {filteredMetricsWithMatchingStats &&
                  filteredMetricsWithMatchingStats[0]?.sammetricstats?.map((newmetric, index) => (
                    <div
                      key={index}
                      className={`positiondetailsinfo ${index % 2 === 1 ? 'even-row' : 'odd-row'}`}
                      style={{ backgroundColor: index % 2 === 1 ? '#ffffff' : '#f5f5f5' }}
                    >
                      <p>{newmetric.label}</p>
                      <p>{newmetric.fullScale}</p>
                      <span style={{
                      color: playerColor,
                    }}>{metric?.Percentage}%</span>
                      <p>****</p>
                      <p>
                        <img width={20} src={uparrow}></img>
                      </p>
                      <p>{newmetric.percentvalue.toFixed(4)}</p> {/* Display percent value */}
                    </div>
                  ))}
              </>
            </div>
          </div>
        ))}
      </>
    </div>
  )
}

export default SamPositiontab
