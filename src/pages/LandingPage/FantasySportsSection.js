import React from 'react'
import Video from '../../assets/landing/fantasy-sports-video.mp4'
import { Typography } from 'antd'

const FantasySportsSection = () => {
  return (
    <>
      <div className='fantasy_sports'>
        <div className='main_heading'>
          <Typography.Title level={1}>
            LET&apos;S DISCUSS
            <br />
            FANTASY SPORTS
          </Typography.Title>
        </div>
        <div className='contentDesktop'>
          <Content mainTitle />
        </div>
        <video src={Video} width='100%' height='100%' muted autoPlay loop controls={false} />
      </div>
      <div className='fantasy_sports fantasy_sports_small_screen '>
        <div className='contentSmallScreen'>
          <Content />
        </div>
      </div>
    </>
  )
}

const Content = ({ mainTitle }) => {
  return (
    <div className='content'>
      <div className='top'>
        {mainTitle && (
          <Typography.Title level={1}>
            LET&apos;S
            <br />
            DISCUSS
            <br />
            FANTASY
            <br />
            SPORTS
          </Typography.Title>
        )}
      </div>
      <div className='bottom'>
        <p className='text1'>SAMSPORTS</p>
        <div>
          <p className='text2'>c/ELISA 17</p>
          <p className='text3'>08023 Barcelona, Spain</p>
        </div>
        <div>
          <p className='text4'>
            Email: <span>support@samsports.io</span>
          </p>
          <p className='text5'>
            Social: <span>@SAMSports_</span>
          </p>
        </div>
        <div>
          <p className='text4 linksBox'>
            <a
              href='https://app.termly.io/document/terms-of-service/372d4c41-9267-4833-8bbb-aba80f6fbbb8'
              target='_blank'
              rel='noreferrer'
            >
              Terms and Policy
            </a>
            <span style={{ marginInline: '10px' }}>|</span>
            <a href='https://sam-wallet-10b1f.web.app/' target='_blank' rel='noreferrer'>
              White Paper
            </a>
          </p>
        </div>
        <p className='text6'>
          SAMSPORTS is not in any way affiliated with any sports team or sports league, nor is it
          affiliated with any player, players association, or collection of players. The use of
          sports players’ names in conjunction with their statistics in our contests is intended for
          informational purposes only and should not be construed as an endorsement of our contests.
        </p>
      </div>
    </div>
  )
}

export default FantasySportsSection
