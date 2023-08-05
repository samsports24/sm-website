import { Button } from 'antd'

const PopularSportCard = ({ data }) => {
  return (
    <div className='wrapper'>
      <div className='card'>
        <img src={data?.image} />
        <div className='front-side'>
          <img src={data?.icon} />
          <h1>{data?.title}</h1>
        </div>

        <div className='info'>
          <div className='info-container'>
            <h1>{data?.title}</h1>
            <div className='buttons-container'>
              <Button type='default'>
                <span>AFLL</span>
              </Button>
              <Button type='default'>
                <span>RULEBOOK</span>
              </Button>
              <Button type='default'>
                <span>LEAGUE DETAILS</span>
              </Button>
              <Button type='default'>
                <span>FRANCHISES FOR SALE</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PopularSportCard
